import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
import { auth } from '@/app/utils/authOptions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    console.log('Session/user ID:', session?.user?.id)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await connect()

    // Find the most recent report for this user
    const report = await Report.findOne({ 
      userId: session.user.id 
    }).sort({ createdAt: -1 })
    
    console.log('Found report:', {
      id: report?._id?.toString(),
      userId: report?.userId,
      contentLength: report?.content?.length,
      createdAt: report?.createdAt
    })
    
    if (!report) {
      return NextResponse.json(
        { error: 'No reports found. Please complete a quiz first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      reportId: report._id.toString(),
      reportContent: report.content,
      createdAt: report.createdAt
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}