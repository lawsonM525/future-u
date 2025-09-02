import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
// Timeline generation has been split into a separate endpoint to avoid long runtimes
import { auth } from '@/app/utils/authOptions'

// Validate environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX',
  'MONGODB_URI'
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error('Missing required environment variable: ' + envVar)
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string
})

const index = pinecone.index(process.env.PINECONE_INDEX as string)

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

      // 1. Compile answers into a structured document
      const userProfile = Object.entries(answers)
        .map(([q, a]) => 'Q' + q + ': ' + a)
        .join('\n')

      // 2. Generate embedding for user profile
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: userProfile,
      }, { signal: controller.signal })

      // 3. Query Pinecone for similar vectors
      const queryResponse = await index.query({
        vector: embedding.data[0].embedding,
        topK: 5,
        includeMetadata: true
      })

      // Add debug logging
      console.log('Pinecone response:', JSON.stringify(queryResponse.matches, null, 2))

      // 4. Generate career advice using retrieved context
      const relevantData = queryResponse.matches
        .map(match => {
          if (!match.metadata) {
            console.warn('Match missing metadata:', match)
            return ''
          }
          const text = match.metadata.text || match.metadata.content || match.metadata.description
          if (!text) {
            console.warn('Match metadata missing text field:', match.metadata)
            return ''
          }
          return text
        })
        .filter(Boolean)
        .join('\n')

      if (!relevantData) {
        console.warn('No relevant data found in Pinecone response')
      }

      // 5. Generate career roadmap report with actionable, data-driven insights
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a career guidance expert. Analyze the user's quiz responses and the provided relevant career insights data (extracted from tweets, job boards, reddit posts, etc.) and generate a detailed, step-by-step career roadmap report that takes the user from where they are now to becoming their career hero. Think "your future, mapped out" - a journey that transforms them from zero to hero with actionable, specific checkpoints.

Break your report into these sections:

1. **VISION & DREAM STATE**
 - Describe the ultimate career vision the user aspires to achieve using vivid, inspiring language.
 - Guide them to visualize their dream future as both attainable and transformative.

2. **CURRENT STRENGTHS & TALENTS**
 - Identify 3-4 key strengths and talents from their quiz responses.
 - Provide clear titles and detailed explanations with practical examples on leveraging these strengths.

3. **MILESTONES & CHECKPOINTS (YOUR ROADMAP TO SUCCESS)**
 - Outline 5-7 actionable milestones marking key steps on the journey from zero to hero.
 - For each milestone, include specific, measurable actions the user can take.
 - Incorporate unique and actionable career insights derived from the provided data - like emerging skills, networking tips, or industry trends.
 - Stress the importance of celebrating small wins and re-committing to your dream at each checkpoint.

4. **STRATEGIES FOR GROWTH & OVERCOMING OBSTACLES**
 - Offer 3-4 practical strategies to navigate setbacks, detours, and distractions.
 - Focus on how this specific user can build resilience, adapt to change, and maintain unwavering commitment.
 - Integrate data-driven advice (e.g., trending career skills, innovative industry strategies) from the relevant career context.
 - Include motivational insights that reinforce persistence and the power of recommitment.

Format each section with a clear title in bold, followed by detailed explanations. Use bullet points or numbered lists where appropriate, and ensure double line breaks between sections and points for clarity.
`
          },
          {
            role: "user",
            content: `User Profile:\n` + userProfile + `\n\nRelevant Career Context:\n` + relevantData
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, { signal: controller.signal })

      const reportContent = completion.choices[0].message.content

      // Timeline generation moved to /api/generate-timeline to reduce request duration

      // Create report document
      const report = new Report({
        content: reportContent,
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
        relevantCareers: report.careers.map((career: { metadata: { text?: string } }) => career.metadata?.text).filter(Boolean).join('\n')
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