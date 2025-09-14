import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { QuizTemp } from '@/models/QuizTemp'
import { auth } from '@/app/utils/authOptions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { tempId } = await request.json()

    if (!tempId) {
      return NextResponse.json(
        { error: 'Temporary quiz ID is required' },
        { status: 400 }
      )
    }

    await connect()

    // Find the temporary quiz data
    const quizTemp = await QuizTemp.findById(tempId)

    if (!quizTemp) {
      return NextResponse.json(
        { error: 'Temporary quiz data not found or expired' },
        { status: 404 }
      )
    }

    // Associate the quiz with the user
    quizTemp.userId = session.user.id
    await quizTemp.save()

    // Call the process-quiz endpoint to process the quiz
    const processResponse = await fetch(new URL('/api/process-quiz', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass the authentication cookie
        Cookie: request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        answers: quizTemp.answers,
        quizType: quizTemp.quizType
      })
    })

    if (!processResponse.ok) {
      const errorData = await processResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to process quiz' },
        { status: processResponse.status }
      )
    }

    // Mark as processed
    quizTemp.processed = true
    await quizTemp.save()

    const responseData = await processResponse.json()

    // Fire-and-forget timeline generation to enrich dashboard ASAP
    try {
      await fetch(new URL('/api/generate-timeline', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          reportId: responseData.reportId,
          answers: quizTemp.answers,
          quizType: quizTemp.quizType
        })
      }).catch((e) => {
        console.error('Failed to trigger timeline generation from process-temp-quiz:', e)
      })
    } catch (e) {
      console.error('Error initiating timeline generation (temp):', e)
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error processing temporary quiz:', error)
    return NextResponse.json(
      { error: 'Failed to process quiz' },
      { status: 500 }
    )
  }
}
