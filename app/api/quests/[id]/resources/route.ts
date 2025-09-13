import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Quest } from '@/models/Quest'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface ExaResult {
  title: string
  url: string
  author?: string | null
  publishedDate?: string | null
  text?: string
  summary?: string
  favicon?: string
  image?: string
}

function toPills(results: ExaResult[], limit = 8) {
  return results.slice(0, limit).map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.summary || (typeof r.text === 'string' ? r.text.slice(0, 200) : undefined),
    favicon: r.favicon,
    image: r.image
  }))
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server missing EXA_API_KEY' }, { status: 500 })
    }

    await connect()
    const quest = await Quest.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    const query = `Resources to ${quest.title} for goal: ${quest.goalTitle}. Practical guides, templates, scripts, step-by-step.`

    const body = {
      query,
      type: 'auto',
      numResults: 12,
      contents: { text: true },
      moderation: true,
    }

    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ resources: [] })
    }

    const json = await res.json()
    const results: ExaResult[] = Array.isArray(json.results) ? json.results : []

    return NextResponse.json({ resources: toPills(results) })
  } catch (err) {
    console.error('GET /api/quests/[id]/resources error:', err)
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}
