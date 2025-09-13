import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Quest } from '@/models/Quest'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    await connect()
    const quest = await Quest.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    return NextResponse.json({ quest })
  } catch (err) {
    console.error('GET /api/quests/[id] error:', err)
    return NextResponse.json({ error: 'Failed to load quest' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as Partial<{
      progress: number
      delta: number
    }>

    await connect()
    const quest = await Quest.findOne({ _id: params.id, userId: session.user.id })
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    const quantity = Math.max(1, Number(quest.quantity) || 1)

    if (typeof body.progress === 'number') {
      const n = Math.floor(body.progress)
      quest.progress = Math.max(0, Math.min(quantity, n))
    } else if (typeof body.delta === 'number') {
      const next = Math.floor((quest.progress || 0) + body.delta)
      quest.progress = Math.max(0, Math.min(quantity, next))
    }

    if (quest.progress >= quantity) {
      quest.completedAt = quest.completedAt ?? new Date()
      quest.progress = quantity
    } else if (quest.progress < quantity) {
      quest.completedAt = null
    }

    await quest.save()

    return NextResponse.json({ quest })
  } catch (err) {
    console.error('PATCH /api/quests/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 })
  }
}
