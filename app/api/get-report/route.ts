import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { Report } from '@/models/Report'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

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
        { error: 'Report not found. Please complete the quiz first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      report: report.data,
      careers: report.careers
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}