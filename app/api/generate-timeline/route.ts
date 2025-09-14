import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
import { Timeline, TimelineCheckpoint } from '@/models/Timeline'
import { auth } from '@/app/utils/authOptions'
import type { IReport } from '@/models/Report'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 300

function extractJson(content: string): unknown {
  // Remove markdown code fences if present
  const trimmed = content.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/i)
  const jsonStr = fenceMatch ? fenceMatch[1] : trimmed
  return JSON.parse(jsonStr)
}

function isTimelineResponse(val: unknown): val is { checkpoints: unknown[] } {
  if (typeof val !== 'object' || val === null) return false
  const maybe = val as { checkpoints?: unknown }
  return Array.isArray(maybe.checkpoints)
}

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const displayQuizType = (quizType || reportDoc.quizType) ?? undefined

    // Timeout controller
    const timeoutMs = 120000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Ask model to produce a strict JSON structure
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a career roadmap planner. Given a user's career strategy report and their raw quiz answers (user profile), output a realistic, motivating 6-year timeline with concrete achievements. Return ONLY JSON with this exact shape: { "checkpoints": [{ "year": number, "title": string, "description": string, "items": string[] }] }.
- Use exactly these years: 2025, 2026, 2027, 2028, 2029, 2030. Create one checkpoint object for each year.
- For each year, write a concise title (max ~8 words).
- For each year's description, write 1-3 sentences summarizing the year's focus.
- For each year's items array, include 3-5 milestone-style achievements phrased as accomplished outcomes (e.g., "Published your first technical book", "Spoke at two major tech conferences", "Launched v1 of your startup and reached 1,000 users"). Avoid generic to-do phrasing. Be specific and impactful.
- Do not include any extra commentary, markdown, or code fences.
Language and tone:
• SHOULD use clear, simple language. 
• SHOULD be Gen Z-friendly and informative. 
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
• AVOID these words: “can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, realm, however, harness, exciting, groundbreaking, cutting-edge, remarkable, it, remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving" 
# IMPORTANT: Review your response and ensure no em dashes!`
          },
          {
            role: 'user',
            content: `Career Strategy Report (source):\n\n${reportContent}\n\nQuiz Type: ${displayQuizType ?? '(unspecified)'}\n\nRaw Quiz Answers (User Profile):\n${computedUserProfile ?? '(none provided)'}`
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      }, { signal: controller.signal })

      const content = completion.choices[0].message.content || '{}'

      // Parse JSON robustly
      let parsed: unknown
      try {
        parsed = extractJson(content)
      } catch {
        // Retry with a minimal repair: strip non-json characters
        const fallback = content.replace(/^.*?(\{[\s\S]*\}).*$/, '$1')
        parsed = JSON.parse(fallback) as unknown
      }

      if (!isTimelineResponse(parsed)) {
        throw new Error('Model response missing checkpoints array')
      }

      // Validate and coerce checkpoints
      const rawCheckpoints: TimelineCheckpoint[] = (parsed.checkpoints as unknown[])
        .map((raw) => {
          const cp = raw as Record<string, unknown>
          const year = Number(cp.year)
          const title = String((cp.title ?? '') as string).trim()
          const description = String((cp.description ?? '') as string).trim()
          const rawItems = Array.isArray(cp.items) ? cp.items : (typeof cp.items === 'string' ? [cp.items] : [])
          const itemsAll = (rawItems as unknown[]).map((s) => String(s ?? '').trim()).filter(Boolean)
          const items = itemsAll.slice(0, 5)
          const out: TimelineCheckpoint = { year, title }
          if (items.length) out.items = items
          if (description) out.description = description
          return out
        })
        .filter((cp: TimelineCheckpoint) => Number.isFinite(cp.year) && !!cp.title && !!cp.description && (cp.items?.length ?? 0) >= 3)

      // Enforce exactly the 6 required years 2025..2030, one checkpoint each
      const targetYears = [2025, 2026, 2027, 2028, 2029, 2030]
      const byYear = new Map<number, TimelineCheckpoint>()
      for (const cp of rawCheckpoints) {
        if (targetYears.includes(cp.year) && !byYear.has(cp.year)) {
          byYear.set(cp.year, cp)
        }
      }
      const missing = targetYears.filter(y => !byYear.has(y))
      if (missing.length > 0) {
        throw new Error('Model response missing required years: ' + missing.join(', '))
      }
      const checkpoints: TimelineCheckpoint[] = targetYears.map(y => byYear.get(y)!)

      if (checkpoints.length === 0) {
        throw new Error('No valid checkpoints generated')
      }

      const timeline = new Timeline({
        userId: session.user.id,
        checkpoints
      })
      await timeline.save()

      clearTimeout(timeoutId)

      return NextResponse.json({
        timelineId: timeline._id.toString(),
        checkpoints
      })
    } catch (err: unknown) {
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
