import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { QuizTemp } from '@/models/QuizTemp'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function POST(request: Request) {
  try {
    const { answers, quizType } = await request.json()

    if (!answers || !quizType) {
      return NextResponse.json(
        { error: 'Answers and quiz type are required' },
        { status: 400 }
      )
    }

    await connect()

    const quizTemp = new QuizTemp({
      answers,
      quizType
    })

    await quizTemp.save()

    return NextResponse.json({ 
      tempId: quizTemp._id.toString()
    })
  } catch (error) {
    console.error('Error saving temporary quiz data:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz data' },
      { status: 500 }
    )
  }
}
