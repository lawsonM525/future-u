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

    const { reportId } = await request.json().catch(() => ({ })) as { reportId?: string }

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Timeout controller
    const timeoutMs = 120000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Ask model to produce a strict JSON structure
      const currentYear = new Date().getFullYear()
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a career roadmap planner. Given a user's career strategy report, output a realistic, motivating timeline with concrete checkpoints. Return ONLY JSON with this exact shape: { "checkpoints": [{ "year": number, "title": string, "description": string }] }.
- Use ${currentYear} through ${currentYear + 7} as plausible years.
- Include 5-7 checkpoints.
- Keep titles concise (max ~8 words). Descriptions 1-3 sentences, specific and actionable.
- Do not include any extra commentary, markdown, or code fences.`
          },
          {
            role: 'user',
            content: `Career Strategy Report (source):\n\n${reportContent}`
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
      const checkpoints: TimelineCheckpoint[] = parsed.checkpoints
        .map((raw) => {
          const cp = raw as Record<string, unknown>
          const year = Number(cp.year)
          const title = String((cp.title ?? '') as string).trim()
          const description = String((cp.description ?? '') as string).trim()
          return { year, title, description }
        })
        .filter((cp: TimelineCheckpoint) => Number.isFinite(cp.year) && !!cp.title && !!cp.description)

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
