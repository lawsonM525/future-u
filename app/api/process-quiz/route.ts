import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'

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
    const { answers } = await request.json()

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

      // Store the relevant career data separately
      const relevantCareers = queryResponse.matches
        .map(match => match.metadata?.text)
        .filter(Boolean)
        .join('\n')

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful career advisor. Generate a report with personalized career advice based on the user's profile and relevant career data. The report should include clear simple steps to take and should be amply spaced and easily readable."
          },
          {
            role: "user",
            content: `
User Profile:
${userProfile}

Relevant Career Data:
${relevantData}

Generate a highly personalized and deeply insightful career roadmap using second-person language (addressing the user as "you"). The report should be motivational, psychologically compelling, and structured into seven progressive stages leading to "Stage Completion."

The structure should be as follows:

1. Brief Summary of the User's Current Situation & Career Path Recommendations
2. The 7-Stage Career Roadmap (with meaningful stage names)
3. Mission & Ikigai Alignment
4. Closing Statement with a compelling, specific affirmation

Please ensure each stage includes:
- Key Actions & Next Steps
- Psychological Checkpoints
- Encouraging Explanation
            `
          }
        ]
      }, { signal: controller.signal })

      const reportContent = completion.choices[0].message.content

      try {
        // Store report in MongoDB
        const report = await Report.create({
          data: reportContent,
          careers: relevantCareers || ''
        })

        clearTimeout(timeoutId)

        return NextResponse.json({ 
          reportId: report._id.toString(),
          reportContent, 
          relevantCareers
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
      }

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