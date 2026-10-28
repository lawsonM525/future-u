import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { Timeline } from '@/models/Timeline'
import { alignLegacyTimeline } from '@/lib/timeline-years'
import { Report } from '@/models/Report'
import { auth } from '@/app/utils/authOptions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

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
    const report = await Report.findOne({ userId: session.user.id }).sort({ createdAt: -1 })
    const timeline = report ? await Timeline.findOne({
      userId: session.user.id,
      $or: [
        { reportId: String(report._id) },
        // Legacy timelines have no report ID, but must postdate the current report.
        { reportId: { $exists: false }, createdAt: { $gte: report.createdAt } },
      ],
    }).sort({ createdAt: -1 }) : null
    
    if (!timeline) {
      return NextResponse.json(
        { checkpoints: [] },
        { status: 200 }
      )
    }

    return NextResponse.json({
      checkpoints: alignLegacyTimeline(timeline.checkpoints, timeline.createdAt)
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
