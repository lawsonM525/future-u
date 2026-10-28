import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { User } from '@/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (process.env.NODE_ENV === 'production') return new NextResponse(null, { status: 404 })
  try {
    await connect()
    const users = await User.find({}).select('email name').limit(5)
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
