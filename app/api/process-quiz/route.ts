import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
import { parseReportContent } from '@/lib/reportParser'
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

      // 5. Generate structured output: concise summary, archetype tag, and a markdown report (strengths + strategies only)
      function extractJson(content: string): unknown {
        const trimmed = content.trim()
        const fenceMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/i)
        const jsonStr = fenceMatch ? fenceMatch[1] : trimmed
        return JSON.parse(jsonStr)
      }

      const archetypeOptions = [
        'the spark','the oracle','the outlaw','the lighthouse','the glitch','the alchemist','the phoenix','the visionary','the shapeshifter','the maverick','the muse','the architect','the adventurer','the storm','the mirror','the rebel heart','the gardener','the trailblazer','the nomad','the north star','the hacker','the flame','the scribe','the dreamweaver','the creator'
      ] as const

      type ArchetypeTag = typeof archetypeOptions[number]
      interface ModelResponse {
        summary: string
        archetypeTag: ArchetypeTag
        report_md: string
      }

      function coerceModelResponse(input: unknown): ModelResponse {
        if (typeof input !== 'object' || input === null) {
          throw new Error('Model output is not an object')
        }
        const obj = input as Record<string, unknown>
        const summary = typeof obj.summary === 'string' ? obj.summary.trim() : ''
        const archetypeTagRaw = typeof obj.archetypeTag === 'string' ? obj.archetypeTag.trim() : ''
        const archetypeTagNormalized = archetypeTagRaw.toLowerCase()
        const report_md = typeof obj.report_md === 'string' ? obj.report_md : ''
        const isValidTag = (archetypeOptions as readonly string[]).includes(archetypeTagNormalized)
        if (!summary || !report_md || !isValidTag) {
          throw new Error('Model output missing required fields or invalid archetypeTag')
        }
        return { summary, archetypeTag: archetypeTagNormalized as ArchetypeTag, report_md }
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a career guidance expert. Analyze the user's quiz responses and the provided relevant career insights data. Your goal is to help them understand what their dream life looks like and how they can obtain it. Return ONLY valid JSON with this exact shape:
{
  "summary": string, // 1-2 sentences, concise, plain text (no markdown). The first sentence should tell the user who they are right now. The second sentence should tell the user who they will be in five years.
  "archetypeTag": string, // exactly one of: ${archetypeOptions.join(', ')}
  "report_md": string // markdown containing ONLY the following H2 sections in this order: \n## CURRENT STRENGTHS & TALENTS\n\n## STRATEGIES FOR GROWTH\n
}

Instructions:
- Do NOT include any milestones or timeline content in report_md. Those are generated elsewhere.
- CURRENT STRENGTHS & TALENTS: Provide 3-4 strengths. For each, write a short title line followed by one paragraph. Use paragraphs only. Do NOT use bullets. Do NOT add any bold/italic formatting or markdown beyond the H2 heading and plain paragraphs.
- STRATEGIES FOR GROWTH: Provide 3-4 strategies. For each, include a short title line and a bullet list of 1-3 concise actions. Use bullets here.
- Use data-driven insights when possible (from the provided context).

Formatting rules:
- Leave a blank line between headings, titles, and paragraphs.
- Avoid markdown characters other than headings and bullet hyphens in the strategies list.
- No hashtags, semicolons, or em dashes. Use commas or periods.
- Avoid filler words and clichés. Be specific.

Language and tone:
• SHOULD use clear, simple language. 
• SHOULD be spartan and informative. 
• SHOULD use short, impactful sentences. 
• SHOULD use active voice; avoid passive voice. 
• SHOULD focus on practical, actionable insights. 
• SHOULD use data and examples to support claims when possible. 
• SHOULD use “you” and “your” to directly address the reader. 
• AVOID using em dashes (—) anywhere in your response. Use only commas, periods, or other standard punctuation. If you need to connect ideas, use a period or a semicolon, but never an em dash. • AVOID constructions like "...not just this, but also this". • AVOID metaphors and clichés. • AVOID generalizations. • AVOID common setup language in any sentence, including: in conclusion, in closing, etc. 
• AVOID output warnings or notes, just the output requested. 
• AVOID unnecessary adjectives and adverbs.  
• AVOID semicolons. 
• AVOID asterisks. 
• AVOID these words: “can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, realm, however, harness, exciting, groundbreaking, cutting-edge, remarkable, it, remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving" # IMPORTANT: Review your response and ensure no em dashes!
`
          },
          {
            role: "user",
            content: `User Profile:\n${userProfile}\n\nRelevant Career Context:\n${relevantData}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, { signal: controller.signal })

      const raw = completion.choices[0].message.content || '{}'
      let parsedUnknown: unknown
      try {
        parsedUnknown = extractJson(raw)
      } catch {
        const fallback = raw.replace(/^.*?(\{[\s\S]*\}).*$/, '$1')
        parsedUnknown = JSON.parse(fallback)
      }

      const parsed = coerceModelResponse(parsedUnknown)
      const summary = parsed.summary
      const archetypeTag = parsed.archetypeTag
      const reportContent = parsed.report_md

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

      // 6. Generate Strategy Resources (Exa) ONCE and store on the report
      try {
        const exaKey = process.env.EXA_API_KEY
        if (exaKey) {
          const parsedReport = parseReportContent(reportContent)
          const strategies = parsedReport.strategies || []
          type ExaResult = {
            title: string
            url: string
            author?: string | null
            publishedDate?: string | null
            text?: string
            summary?: string
            favicon?: string
            image?: string
          }
          const perBullet = 2
          const groups: Array<{
            title: string
            details: Array<{ text: string; results: Array<{ title: string; url: string; snippet?: string; author?: string | null; publishedDate?: string | null; favicon?: string; image?: string }> }>
          }> = []

          for (const s of strategies) {
            const details = Array.isArray(s.details) ? s.details.filter(Boolean) : []
            const queries = details.map(text => ({ text }))

            const responses = await Promise.all(
              queries.map(async ({ text }) => {
                const body = {
                  query: text,
                  type: 'auto',
                  numResults: perBullet,
                  contents: { text: true },
                  moderation: true,
                }
                const res = await fetch('https://api.exa.ai/search', {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    'x-api-key': exaKey,
                  },
                  body: JSON.stringify(body),
                })
                if (!res.ok) return { text, results: [] as ExaResult[] }
                const json = await res.json()
                const results: ExaResult[] = Array.isArray(json.results) ? json.results : []
                return { text, results }
              })
            )

            const detailResults = responses.map(r => ({
              text: r.text,
              results: r.results.slice(0, perBullet).map((rr) => ({
                title: rr.title,
                url: rr.url,
                snippet: rr.summary || (typeof rr.text === 'string' ? rr.text.slice(0, 240) : undefined),
                author: rr.author ?? null,
                publishedDate: rr.publishedDate ?? null,
                favicon: rr.favicon,
                image: rr.image,
              }))
            }))

            groups.push({ title: s.title, details: detailResults })
          }

          report.strategyResources = {
            strategies: groups,
            generatedAt: new Date(),
          }
          await report.save()
        } else {
          console.warn('EXA_API_KEY not set; skipping strategy resources generation')
        }
      } catch (e) {
        console.error('Failed to generate strategy resources:', e)
        // do not fail the request; resources can be generated lazily later
      }

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