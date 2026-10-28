import { NextResponse } from 'next/server'
import { generateCareerReport } from '@/lib/generate-career-report'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
// Timeline generation has been split into a separate endpoint to avoid long runtimes
import { auth } from '@/app/utils/authOptions'

export const maxDuration = 300 // Set max duration to 300 seconds (5 minutes)
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    // Debug session data
    console.log('Session in process-quiz:', JSON.stringify(session?.user || 'No session'));
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { answers, quizType } = await request.json()

    if (!answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      )
    }

    if (!quizType) {
      return NextResponse.json(
        { error: 'Quiz type is required' },
        { status: 400 }
      )
    }

    // Add timeout to OpenAI calls
    const timeoutMs = 180000 // 3 minutes
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Connect to MongoDB early
      await connect()

      const { userProfile, queryResponse, summary, archetypeTag, reportContent } = await generateCareerReport({ answers, signal: controller.signal })

      // Timeline generation moved to /api/generate-timeline to reduce request duration

      // Create report document
      const report = new Report({
        content: reportContent,
        summary,
        archetypeTag,
        quizType,
        userProfile,
        userId: session.user.id,
        careers: queryResponse.matches
          .filter((match): match is typeof match & { score: number } => 
            typeof match.score === 'number' && 
            match.metadata?.text !== undefined
          )
          .map(match => ({
            id: match.id,
            score: Math.round(match.score * 100),
            metadata: match.metadata
          }))
      })

      await report.save()

      // Timeline will be generated asynchronously by calling /api/generate-timeline

      // Clear timeout
      clearTimeout(timeoutId)

      return NextResponse.json({ 
        reportId: report._id.toString(),
        reportContent,
        summary,
        archetypeTag,
        quizType,
        userProfile,
        relevantCareers: report.careers
          .map((career: { metadata: { text?: string } }) => career.metadata?.text)
          .filter(Boolean)
          .join('\n')
      })
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out' },
          { status: 408 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process quiz' },
      { status: 500 }
    )
  }
}