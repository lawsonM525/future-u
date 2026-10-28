import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

// Shared by account reports and guest reports. Provider credentials stay on the server.
export async function generateCareerReport({ answers, signal }: { answers: Record<string, string>; signal?: AbortSignal }) {
  if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    throw new Error('Report generation is not configured')
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const index = pinecone.index(process.env.PINECONE_INDEX)

  // 1. Compile answers into a structured document
  const userProfile = Object.entries(answers)
    .map(([q, a]) => 'Q' + q + ': ' + a)
    .join('\n')

  // 2. Generate embedding for user profile
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: userProfile,
  }, { signal: signal })

  // 3. Query Pinecone for similar vectors
  const queryResponse = await index.query({
    vector: embedding.data[0].embedding,
    topK: 5,
    includeMetadata: true
  })

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
  "summary": string, // 1-2 sentences, concise, plain text (no markdown). The first sentence should tell the user who they are right now. The second sentence should describe who they aim to become in five years. Never promise a job, salary, or guaranteed outcome.
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
  }, { signal: signal })

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


  return { userProfile, queryResponse, summary, archetypeTag, reportContent }
}
