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

Use exact markdown H2 headings with these exact titles, in this order, and do not rename them:

## VISION & DREAM STATE

- Write 1–2 paragraphs. Do not use bullet points in this section.

## CURRENT STRENGTHS & TALENTS

- Identify 3–4 strengths. For each strength, write a short title line (no markdown bullets), followed by one descriptive paragraph. Do not use bullet points in this section.

## MILESTONES & CHECKPOINTS (YOUR ROADMAP TO SUCCESS)

- Provide 5–7 milestones. For each milestone, include a short title line and a bullet list of 1–3 concrete actions.
- Incorporate unique and actionable career insights derived from the provided data (e.g., emerging skills, networking tips, or industry trends).
- Stress the importance of celebrating small wins and re-committing to your dream at each checkpoint.

## STRATEGIES FOR GROWTH & OVERCOMING OBSTACLES

- Provide 3–4 strategies. For each strategy, include a short title line and a bullet list of 1–3 concise actions.
- Integrate data-driven advice (e.g., trending career skills, innovative industry strategies) from the relevant career context.

Formatting rules:
- Leave a blank line between headings, titles, and paragraphs.
- Use paragraphs, not bullets, in the Vision and Strengths sections.
- Use bullet lists only in the Milestones and Strategies sections.

WRITING STYLE RULES:
- Use clear, simple language.
- Be spartan and informative.
- Use short, impactful sentences.
- Use active voice. Avoid passive voice.
- Focus on practical, actionable insights.
- Use bullet lists only in the Milestones and Strategies sections; otherwise use paragraphs.
- Use data and examples to support claims when possible.
- Address the reader directly using "you" and "your".
- Do not use em dashes. Use commas or periods.
- Avoid constructions like "not just this, but also this".
- Avoid metaphors and clichés.
- Avoid generalizations.
- Do not include any setup phrases like "in conclusion" or "in closing".
- Do not include warnings or notes. Output the content only.
- Avoid unnecessary adjectives and adverbs.
- Do not use hashtags.
- Do not use semicolons.
- Do not use markdown formatting characters beyond headings and lists already specified. No asterisks outside headings/lists.
- Avoid these words: can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, realm, however, harness, exciting, groundbreaking, cutting-edge, remarkable, it, remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving.

Tone: encouraging and hopeful. Back every encouragement with practical actions the reader can take to reach their checkpoints.
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