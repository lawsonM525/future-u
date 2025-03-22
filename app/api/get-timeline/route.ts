import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { Timeline } from '@/models/Timeline'
import { auth } from '@/app/utils/authOptions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await connect()

    // Find the most recent timeline for this user
    const timeline = await Timeline.findOne({ 
      userId: session.user.id 
    }).sort({ createdAt: -1 })
    
    if (!timeline) {
      return NextResponse.json(
        { error: 'No timeline found. Please complete a quiz first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      checkpoints: timeline.checkpoints
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
