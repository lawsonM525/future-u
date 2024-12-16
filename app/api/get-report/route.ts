import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

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
    const [reportResponse, careersResponse] = await Promise.all([
      supabase
        .from('reports')
        .select('data')
        .eq('id', reportId)
        .single(),
      supabase
        .from('careers')
        .select('data')
        .eq('report_id', reportId)
        .single()
    ])
    
    if (reportResponse.error || !reportResponse.data) {
      return NextResponse.json(
        { error: 'Report not found. Please complete the quiz first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      report: reportResponse.data.data,
      careers: careersResponse.data?.data || null
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
} 