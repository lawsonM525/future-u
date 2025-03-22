import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'
import { sendCareerReport } from '@/app/utils/email'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    // Check authentication
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get report ID from request
    const { reportId } = await request.json()
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connect()

    // Find the report
    const report = await Report.findById(reportId)
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Send email
    await sendCareerReport(
      session.user.email,
      session.user.name,
      report.data
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending report:', error)
    return NextResponse.json(
      { error: 'Failed to send report' },
      { status: 500 }
    )
  }
}
