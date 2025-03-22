import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
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
    throw new Error(`Missing required environment variable: ${envVar}`)
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { answers } = await request.json()

    if (!answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
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
        .map(([q, a]) => `Q${q}: ${a}`)
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
          // Check for different possible metadata field names
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `you are a career guidance expert. analyze the user's quiz responses and generate a detailed, step-by-step career roadmap report that takes the user from where they are now to becoming their career hero. this report should be aligned with the philosophy of transformation—think of it as mapping out "your future, mapped out"—with practical checkpoints along the way. use simple language. break your report into the following sections:

1. **VISION & DREAM STATE**
   - describe the ultimate career vision the user aspires to achieve.
   - use inspiring, vivid language that helps them visualize their dream future.
   - encourage them to see this vision as both attainable and transformative.

2. **CURRENT STRENGTHS & TALENTS**
   - identify 3-4 key strengths and talents from their quiz responses.
   - provide clear titles and detailed explanations with practical examples of how these can be leveraged.

3. **MILESTONES & CHECKPOINTS (YOUR ROADMAP TO SUCCESS)**
   - outline 5-7 actionable milestones that mark significant steps on the journey from zero to hero.
   - for each milestone, include specific, measurable actions the user can take.
   - emphasize the importance of celebrating small wins and re-committing at each checkpoint.

4. **STRATEGIES FOR GROWTH & OVERCOMING OBSTACLES**
   - offer 3-4 practical strategies to navigate setbacks, detours, and distractions.
   - focus on building resilience, adapting to changes, and maintaining an unwavering commitment.
   - inject motivational insights that remind them that persistence and recommitment are key.

format each section with a clear title in bold followed by detailed explanations. use bullet points or numbered lists where appropriate, and ensure there are double line breaks between sections and points for clarity.`
          },
          {
            role: "user",
            content: `User Profile:\n${userProfile}\n\nRelevant Career Context:\n${relevantData}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, { signal: controller.signal })

      // Clear timeout
      clearTimeout(timeoutId)

      const reportContent = completion.choices[0].message.content

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