import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Goal } from '@/models/Goal'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json().catch(() => ({})) as Partial<{
      title: string
      description: string
      status: 'pending' | 'in_progress' | 'completed'
      checkpointYear?: number
      dueDate?: string | null
    }>

    await connect()
    const goal = await Goal.findOne({ _id: id, userId: session.user.id })
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    if (typeof body.title === 'string') goal.title = body.title.trim() || goal.title
    if (typeof body.description === 'string') goal.description = body.description.trim()
    if (body.status === 'pending' || body.status === 'in_progress' || body.status === 'completed') {
      goal.status = body.status
      if (body.status === 'completed') {
        goal.completedAt = goal.completedAt ?? new Date()
      } else {
        goal.completedAt = null
      }
    }

    if (typeof body.checkpointYear !== 'undefined') {
      const year = Number(body.checkpointYear)
      goal.checkpointYear = Number.isFinite(year) ? year : undefined
    }

    if (typeof body.dueDate !== 'undefined') {
      goal.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }

    await goal.save()

    return NextResponse.json({ goal })
  } catch (err) {
    console.error('PATCH /api/goals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    await connect()
    const res = await Goal.deleteOne({ _id: id, userId: session.user.id })
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/goals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
