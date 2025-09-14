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
    const count = await Goal.countDocuments({ userId: session.user.id })
    return NextResponse.json({ count })
  } catch (err) {
    console.error('GET /api/goals/count error:', err)
    return NextResponse.json({ error: 'Failed to load goal count' }, { status: 500 })
  }
}
