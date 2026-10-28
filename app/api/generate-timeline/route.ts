import { NextResponse } from 'next/server'
import { generateTimeline } from '@/lib/generate-timeline'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
import { Timeline } from '@/models/Timeline'
import { auth } from '@/app/utils/authOptions'
import type { IReport } from '@/models/Report'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 300

function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && (e as { name?: unknown }).name === 'AbortError'
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({ })) as unknown
    const { reportId, answers, quizType, userProfile } = (body || {}) as {
      reportId?: string
      answers?: Record<string | number, string>
      quizType?: string
      userProfile?: string
    }

    // Validate env
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing OPENAI_API_KEY' },
        { status: 500 }
      )
    }

    // Connect DB
    await connect()

    // Load report
    let reportDoc: IReport | null = null
    if (reportId) {
      reportDoc = await Report.findOne({ _id: reportId, userId: session.user.id })
    } else {
      reportDoc = await Report.findOne({ userId: session.user.id }).sort({ createdAt: -1 })
    }

    if (!reportDoc) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const reportContent: string = reportDoc.content

    // Build a user profile string from quiz answers for added specificity
    let computedUserProfile: string | undefined
    if (answers && typeof answers === 'object' && Object.keys(answers).length > 0) {
      computedUserProfile = Object.entries(answers)
        .map(([q, a]) => `Q${q}: ${String(a)}`)
        .join('\n')
    } else if (typeof userProfile === 'string' && userProfile.trim()) {
      computedUserProfile = userProfile.trim()
    } else if (typeof reportDoc.userProfile === 'string' && reportDoc.userProfile.trim()) {
      computedUserProfile = reportDoc.userProfile
    }

    const displayQuizType = (quizType || reportDoc.quizType) ?? undefined

    // Timeout controller
    const timeoutMs = 120000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const checkpoints = await generateTimeline({ reportContent, userProfile: computedUserProfile, quizType: displayQuizType, signal: controller.signal })

      const timeline = await Timeline.findOneAndUpdate(
        { userId: session.user.id, reportId: String(reportDoc._id) },
        { $set: { checkpoints } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )

      clearTimeout(timeoutId)

      return NextResponse.json({
        timelineId: timeline._id.toString(),
        checkpoints
      })
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (isAbortError(err)) {
        return NextResponse.json(
          { error: 'Timeline generation timed out' },
          { status: 408 }
        )
      }
      console.error('Timeline generation error:', err)
      return NextResponse.json(
        { error: 'Failed to generate timeline' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('generate-timeline error:', error)
    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    )
  }
}
