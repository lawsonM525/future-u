import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
import { parseReportContent } from '@/lib/reportParser'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Types for Exa response (subset)
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

interface StrategyResourceItem {
  text: string
  results: Array<{
    title: string
    url: string
    snippet?: string
    author?: string | null
    publishedDate?: string | null
    favicon?: string
    image?: string
  }>
}

interface StrategyResourcesGroup {
  title: string
  details: StrategyResourceItem[]
}

function pickTop(results: any[], limit: number) {
  const out: StrategyResourceItem['results'] = []
  for (const r of results.slice(0, limit)) {
    const item: StrategyResourceItem['results'][number] = {
      title: r.title,
      url: r.url,
      snippet: r.summary || (typeof r.text === 'string' ? r.text.slice(0, 240) : undefined),
      author: r.author ?? null,
      publishedDate: r.publishedDate ?? null,
      favicon: r.favicon,
      image: r.image,
    }
    out.push(item)
  }
  return out
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const perBullet = Math.max(1, Math.min(10, Number(searchParams.get('limit')) || 2))

    // Ensure API key
    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server missing EXA_API_KEY' }, { status: 500 })
    }

    await connect()
    const report = await Report.findOne({ userId: session.user.id }).sort({ createdAt: -1 })
    if (!report) {
      return NextResponse.json({ strategies: [] as StrategyResourcesGroup[] }, { status: 200 })
    }

    const parsed = parseReportContent(String(report.content || ''))
    const strategies = parsed.strategies || []

    // For each strategy detail sentence, query Exa
    const groups: StrategyResourcesGroup[] = []

    for (const s of strategies) {
      const details = Array.isArray(s.details) ? s.details.filter(Boolean) : []
      const detailResults: StrategyResourceItem[] = []

      const queries = details.map((text) => ({ title: s.title, text }))

      const responses = await Promise.all(
        queries.map(async ({ text }) => {
          const body = {
            query: text,
            type: 'auto',
            numResults: perBullet,
            contents: {
              text: true,
            },
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
            return { text, results: [] as ExaResult[] }
          }
          const json = await res.json()
          const results: ExaResult[] = Array.isArray(json.results) ? json.results : []
          return { text, results }
        })
      )

      for (const r of responses) {
        detailResults.push({ text: r.text, results: pickTop(r.results, perBullet) })
      }

      groups.push({ title: s.title, details: detailResults })
    }

    return NextResponse.json({ strategies: groups })
  } catch (error) {
    console.error('strategy-resources error:', error)
    return NextResponse.json({ error: 'Failed to fetch strategy resources' }, { status: 500 })
  }
}
