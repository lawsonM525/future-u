import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import type { FilterQuery } from 'mongoose'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Goal } from '@/models/Goal'
import { Quest } from '@/models/Quest'
import type { QuestDocument } from '@/models/Quest'
import { OpenAI } from 'openai'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 120

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function extractJson(content: string): unknown {
  const trimmed = content.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/i)
  const jsonStr = fenceMatch ? fenceMatch[1] : trimmed
  return JSON.parse(jsonStr)
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

// Local types to avoid "any" when working with lean queries and model output
type QuestLean = {
  _id: Types.ObjectId
  userId: string
  goalId?: string
  goalTitle: string
  goalYear?: number | null
  title: string
  quantity: number
  progress: number
  explanation?: string
  createdAt?: Date
  completedAt?: Date | null
}

type GeneratedQuest = {
  goalId?: string
  goalTitle?: string
  goalYear?: number | null
  title?: string
  quantity?: number
  explanation?: string
}

type NewQuestDoc = {
  userId: string
  goalId: string
  goalTitle: string
  goalYear: number | null
  title: string
  quantity: number
  progress: number
  explanation?: string
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connect()

    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') || 'active').toLowerCase()
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || (status === 'completed' ? 20 : 3)))
    const cursor = searchParams.get('cursor') || null

    function normalizeTitle(s: string) {
      return s.toLowerCase().replace(/\s+/g, ' ').trim()
    }

    // Helper to fetch filtered quests
    const baseFilter: FilterQuery<QuestDocument> = { userId: session.user.id }
    let filter: FilterQuery<QuestDocument>
    if (status === 'completed') {
      filter = { ...baseFilter, $expr: { $gte: ["$progress", "$quantity"] } }
    } else if (status === 'active' || status === 'all') {
      filter = { ...baseFilter, $expr: { $lt: ["$progress", "$quantity"] } }
      if (status === 'all') delete filter.$expr
    } else {
      filter = baseFilter
    }

    const query = Quest.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 10) // fetch a little extra for dedupe

    if (cursor) {
      // paginate using _id cursor
      try {
        const oid = new Types.ObjectId(cursor)
        query.where({ _id: { $lt: oid } })
      } catch {
        // ignore invalid cursor
      }
    }

    const listRaw = await query.lean()
    let list = listRaw as unknown as QuestLean[]

    // For active list in the card, dedupe by normalized title and keep those with highest remaining amount
    if (status === 'active') {
      const seen = new Map<string, QuestLean>()
      for (const q of list) {
        const key = normalizeTitle(String(q.title || ''))
        const remaining = Math.max(0, Number(q.quantity || 1) - Number(q.progress || 0))
        const prev = seen.get(key)
        if (!prev || (Math.max(0, Number(prev.quantity || 1) - Number(prev.progress || 0)) < remaining)) {
          seen.set(key, q)
        }
      }
      list = Array.from(seen.values())
    }

    // If requesting active and none are found, generate them from top goals
    if (status === 'active' && list.length === 0) {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ quests: [] })
      }

      // Load existing quest titles (both active and completed) to avoid duplicates
      const existingAll = await Quest.find({ userId: session.user.id }).select('title').lean()
      const existingNormSet = new Set(existingAll.map(q => normalizeTitle(String(q.title || ''))))

      const goals = await Goal.find({ userId: session.user.id, status: { $ne: 'completed' } })
        .select('_id title checkpointYear')
        .lean()

      if (goals.length === 0) {
        return NextResponse.json({ quests: [] })
      }

      const withYear = goals.filter(g => typeof g.checkpointYear === 'number').sort((a, b) => (a.checkpointYear! - b.checkpointYear!))
      const anytime = goals.filter(g => typeof g.checkpointYear !== 'number')
      const top = [...withYear, ...anytime].slice(0, 3)

      const goalsContext = top.map(g => `- id: ${g._id} | title: ${g.title}${typeof g.checkpointYear === 'number' ? ` | year: ${g.checkpointYear}` : ''}`).join('\n')
      const existingTitlesList = Array.from(existingNormSet).slice(0, 50).join(', ')

      const system = `You are a focused coaching assistant. Create exactly one actionable, measurable quest for each provided goal (so exactly ${top.length} quests in total). Return ONLY valid JSON.`

      const user = `Goals (closest first):\n${goalsContext}\n\nExisting quest titles to avoid (already created or completed):\n${existingTitlesList || '(none)'}\n\nRules for each quest:\n- title: imperative, max 7 words, specific.\n- quantity: positive integer representing how many discrete actions to perform (e.g., send 3 emails => quantity 3). If the title implies a number, ensure quantity matches that number.\n- explanation: 1–2 short sentences explaining how this quest helps achieve the goal.\n- The quest must be doable within a day.\n- IMPORTANT: Do not repeat, paraphrase, or closely mirror any title in the existing list; all new quest titles must be distinct.\n- IMPORTANT: Ensure each quest title is distinct across the list; if a similar action applies to more than one goal, vary the wording or focus.\n\nReturn JSON with exact shape:\n{\n  \"quests\": [\n    { \"goalId\": string, \"goalTitle\": string, \"goalYear\": number|null, \"title\": string, \"quantity\": number, \"explanation\": string },\n    { \"goalId\": string, \"goalTitle\": string, \"goalYear\": number|null, \"title\": string, \"quantity\": number, \"explanation\": string },\n    { \"goalId\": string, \"goalTitle\": string, \"goalYear\": number|null, \"title\": string, \"quantity\": number, \"explanation\": string }\n  ]\n}\nEnsure exactly ${top.length} items. Do not include any text outside the JSON.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.4,
        max_tokens: 600,
      })

      const raw = completion.choices[0]?.message?.content || '{}'
      let parsedUnknown: unknown
      try {
        parsedUnknown = extractJson(raw)
      } catch {
        const fallback = raw.replace(/^.*?(\{[\s\S]*\}).*$/, '$1')
        parsedUnknown = JSON.parse(fallback)
      }

      const obj = (parsedUnknown && typeof parsedUnknown === 'object') ? parsedUnknown as Record<string, unknown> : {}
      const arr: GeneratedQuest[] = Array.isArray(obj.quests) ? (obj.quests as GeneratedQuest[]) : []

      // Build documents and enforce uniqueness by normalized title
      const byTitle = new Map<string, NewQuestDoc>()
      const filledIdx = new Set<number>()
      for (let i = 0; i < Math.min(top.length, arr.length); i++) {
        const g = top[i]
        const q = arr[i] || {}
        const titleRaw = String(q.title || '').trim()
        const norm = normalizeTitle(titleRaw)
        if (existingNormSet.has(norm)) {
          // Skip items whose normalized title already exists for this user
          continue
        }
        const quantityRaw = Number(q.quantity ?? 1)
        let quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1
        const safeTitle = wordCount(titleRaw) > 7 ? titleRaw.split(/\s+/).slice(0, 7).join(' ') : titleRaw
        quantity = Math.max(1, Math.min(20, quantity))
        const explanation = String(q.explanation || '').trim()
        if (!byTitle.has(norm)) {
          byTitle.set(norm, {
            userId: session.user.id,
            goalId: String(g._id),
            goalTitle: String(g.title || ''),
            goalYear: typeof g.checkpointYear === 'number' ? g.checkpointYear : null,
            title: safeTitle,
            quantity,
            progress: 0,
            explanation,
          })
          filledIdx.add(i)
        }
      }

      // If we still have fewer than top.length (e.g., because of duplicate avoidance), do a second pass for remaining goals only
      if (filledIdx.size < top.length) {
        const remainingGoals = top.filter((_, idx) => !filledIdx.has(idx))
        if (remainingGoals.length > 0) {
          const remainingContext = remainingGoals
            .map(g => `- id: ${g._id} | title: ${g.title}${typeof g.checkpointYear === 'number' ? ` | year: ${g.checkpointYear}` : ''}`)
            .join('\n')
          const avoidTitles = Array.from(new Set([
            ...existingNormSet,
            ...Array.from(byTitle.keys()),
          ])).join(', ')
          const user2 = `Goals (closest first):\n${remainingContext}\n\nExisting quest titles to avoid (already created or completed):\n${avoidTitles || '(none)'}\n\nRules for each quest:\n- title: imperative, max 7 words, specific.\n- quantity: positive integer representing how many discrete actions to perform.\n- explanation: 1–2 short sentences explaining how this quest helps achieve the goal.\n- The quest must be doable within a day.\n- IMPORTANT: Do not repeat, paraphrase, or closely mirror any title in the avoid list; all new quest titles must be distinct.\n- IMPORTANT: Ensure each quest title is distinct across the list.\n\nReturn JSON with exact shape:\n{\n  \"quests\": [\n    { \"goalId\": string, \"goalTitle\": string, \"goalYear\": number|null, \"title\": string, \"quantity\": number, \"explanation\": string }\n  ]\n}\nReturn exactly ${remainingGoals.length} items in the array. Do not include any text outside the JSON.`

          const completion2 = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user2 }
            ],
            temperature: 0.4,
            max_tokens: 600,
          })

          const raw2 = completion2.choices[0]?.message?.content || '{}'
          let parsed2: unknown
          try {
            parsed2 = extractJson(raw2)
          } catch {
            const fallback2 = raw2.replace(/^.*?(\{[\s\S]*\}).*$/, '$1')
            parsed2 = JSON.parse(fallback2)
          }

          const obj2 = (parsed2 && typeof parsed2 === 'object') ? parsed2 as Record<string, unknown> : {}
          const arr2: GeneratedQuest[] = Array.isArray(obj2.quests) ? (obj2.quests as GeneratedQuest[]) : []

          for (let k = 0; k < Math.min(remainingGoals.length, arr2.length); k++) {
            const g = remainingGoals[k]
            const q = arr2[k] || {}
            const titleRaw = String(q.title || '').trim()
            const norm = normalizeTitle(titleRaw)
            if (existingNormSet.has(norm) || byTitle.has(norm)) continue
            const quantityRaw = Number(q.quantity ?? 1)
            let quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1
            const safeTitle = wordCount(titleRaw) > 7 ? titleRaw.split(/\s+/).slice(0, 7).join(' ') : titleRaw
            quantity = Math.max(1, Math.min(20, quantity))
            const explanation = String(q.explanation || '').trim()
            byTitle.set(norm, {
              userId: session.user.id,
              goalId: String(g._id),
              goalTitle: String(g.title || ''),
              goalYear: typeof g.checkpointYear === 'number' ? g.checkpointYear : null,
              title: safeTitle,
              quantity,
              progress: 0,
              explanation,
            })
          }
        }
      }

      const coalesced = Array.from(byTitle.values())
      if (coalesced.length === 0) {
        return NextResponse.json({ quests: [] })
      }

      const inserted: QuestLean[] = []
      for (const doc of coalesced) {
        const dup = await Quest.findOne({ userId: doc.userId, goalId: doc.goalId, title: doc.title }).lean() as QuestLean | null
        if (!dup) {
          const created = await Quest.create(doc)
          inserted.push(created.toObject() as QuestLean)
        } else {
          inserted.push(dup)
        }
      }

      list = inserted
    }

    // Only return up to the requested limit
    return NextResponse.json({ quests: list.slice(0, limit) })
  } catch (err) {
    console.error('GET /api/quests error:', err)
    return NextResponse.json({ error: 'Failed to load or generate quests' }, { status: 500 })
  }
}
