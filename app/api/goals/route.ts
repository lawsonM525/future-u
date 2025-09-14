import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Goal } from '@/models/Goal'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connect()
    const goals = await Goal.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ goals })
  } catch (err) {
    console.error('GET /api/goals error:', err)
    return NextResponse.json({ error: 'Failed to load goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as Partial<{
      title: string
      description: string
      status: 'pending' | 'in_progress' | 'completed'
      checkpointYear?: number
      dueDate?: string
    }>

    const title = (body.title || '').trim()
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    await connect()

    // Prevent duplicates by checking existing goals with same normalized title and same year
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
    const incomingYear = Number.isFinite(Number(body.checkpointYear)) ? Number(body.checkpointYear) : undefined

    const existing = await Goal.find({ userId: session.user.id }).select('title checkpointYear status createdAt').lean()
    const match = existing.find(g => norm(String(g.title || '')) === norm(title) && (
      (typeof incomingYear === 'number' && typeof g.checkpointYear === 'number' && g.checkpointYear === incomingYear) ||
      (incomingYear === undefined && (g.checkpointYear === undefined || g.checkpointYear === null))
    ))

    if (match) {
      // Idempotent response: return existing goal
      return NextResponse.json({ goal: match }, { status: 200 })
    }

    const goal = await Goal.create({
      userId: session.user.id,
      title,
      description: body.description?.trim() || '',
      status: body.status || 'pending',
      checkpointYear: incomingYear,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (err) {
    console.error('POST /api/goals error:', err)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
