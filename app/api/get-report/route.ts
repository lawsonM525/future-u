import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

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

    // Fetch both report and careers data in parallel
    const [report, careers] = await Promise.all([
      redis.get(`report:${reportId}`),
      redis.get(`report:${reportId}:careers`)
    ])
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found. Please complete the quiz first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ report, careers })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
} 