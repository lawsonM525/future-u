import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { supabase } from '../../../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Validate environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_ENVIRONMENT',
  'PINECONE_INDEX'
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
  apiKey: process.env.PINECONE_API_KEY as string,
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

      // Log the extracted data
      console.log('Extracted relevant data:', relevantData)

      // Store the relevant career data separately
      const relevantCareers = queryResponse.matches
        .map(match => match.metadata?.text)
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

Generate a detailed and clear career advice report including:

1. Summary of user's current situation

2. Career path recommendations

3. Skill development suggestions

4. Clear action items

5. Industry insights

Separate each section with dash line separatoors like "---------------------------"
            `
          }
        ]
      }, { signal: controller.signal })

      // Generate a unique ID for this report
      const reportId = uuidv4()
      
      // First insert the report
      const reportInsert = await supabase
        .from('reports')
        .insert({
          id: reportId,
          data: completion.choices[0].message.content
        })
        .select('id')
        .single()

      if (reportInsert.error) {
        console.error('Report insert error:', reportInsert.error)
        throw new Error(`Failed to store report: ${reportInsert.error.message}`)
      }

      // Then insert the careers data
      const careersInsert = await supabase
        .from('careers')
        .insert({
          report_id: reportId,
          data: relevantCareers || ''  // Ensure we never insert null
        })
        .select('id')
        .single()

      if (careersInsert.error) {
        console.error('Careers insert error:', careersInsert.error)
        // Try to clean up the report if careers insert fails
        await supabase.from('reports').delete().eq('id', reportId)
        throw new Error(`Failed to store careers: ${careersInsert.error.message}`)
      }

      clearTimeout(timeoutId)

      return NextResponse.json({ 
        reportId,
        relevantCareers
      })

    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 408 }
        )
      }
      throw err
    }

  } catch (err: unknown) {
    console.error('Error processing quiz:', err)
    const status = err instanceof Error && 'status' in err ? Number(err.status) : 500
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to process quiz' },
      { status }
    )
  }
} 