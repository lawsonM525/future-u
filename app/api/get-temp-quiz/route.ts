import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { QuizTemp } from '@/models/QuizTemp'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tempId = searchParams.get('tempId')

    if (!tempId) {
      return NextResponse.json(
        { error: 'Temp ID is required' },
        { status: 400 }
      )
    }

    await connect()

    const quizTemp = await QuizTemp.findById(tempId)

    if (!quizTemp) {
      return NextResponse.json(
        { error: 'Temporary quiz data not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      answers: quizTemp.answers,
      quizType: quizTemp.quizType
    })
  } catch (error) {
    console.error('Error retrieving temporary quiz data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve quiz data' },
      { status: 500 }
    )
  }
}
