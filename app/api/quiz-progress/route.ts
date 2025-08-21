import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuizProgress } from '@/models/QuizProgress'
import dbConnect from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const quizType = searchParams.get('quizType')

    if (quizType) {
      // Get specific quiz progress
      const progress = await QuizProgress.findOne({
        userId: session.user.id,
        quizType,
        status: 'in_progress'
      })

      return NextResponse.json({ progress })
    } else {
      // Get all quiz progress for user
      const allProgress = await QuizProgress.find({
        userId: session.user.id
      }).sort({ lastUpdatedAt: -1 })

      return NextResponse.json({ progress: allProgress })
    }
  } catch (error) {
    console.error('Error fetching quiz progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const {
      quizType,
      currentQuestionIndex,
      answers,
      completedSections,
      status = 'in_progress'
    } = body

    // Find existing progress or create new
    let progress = await QuizProgress.findOne({
      userId: session.user.id,
      quizType,
      status: 'in_progress'
    })

    if (progress) {
      // Update existing progress
      progress.currentQuestionIndex = currentQuestionIndex
      progress.answers = answers
      progress.completedSections = completedSections
      progress.lastUpdatedAt = new Date()
      
      if (status === 'completed') {
        progress.status = 'completed'
        progress.completedAt = new Date()
      }

      // Update metadata
      if (progress.metadata) {
        progress.metadata.pauseCount = (progress.metadata.pauseCount || 0) + 1
      }
    } else {
      // Create new progress
      progress = new QuizProgress({
        userId: session.user.id,
        quizType,
        currentQuestionIndex,
        answers,
        completedSections,
        status,
        metadata: {
          userAgent: request.headers.get('user-agent') || undefined,
          deviceType: detectDeviceType(request.headers.get('user-agent') || '')
        }
      })
    }

    await progress.save()

    return NextResponse.json({ 
      success: true, 
      progressId: progress._id,
      status: progress.status 
    })
  } catch (error) {
    console.error('Error saving quiz progress:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz progress' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const quizType = searchParams.get('quizType')

    if (!quizType) {
      return NextResponse.json(
        { error: 'Quiz type is required' },
        { status: 400 }
      )
    }

    // Mark progress as abandoned instead of deleting
    const result = await QuizProgress.updateOne(
      {
        userId: session.user.id,
        quizType,
        status: 'in_progress'
      },
      {
        status: 'abandoned',
        lastUpdatedAt: new Date()
      }
    )

    return NextResponse.json({ 
      success: true,
      modified: result.modifiedCount 
    })
  } catch (error) {
    console.error('Error deleting quiz progress:', error)
    return NextResponse.json(
      { error: 'Failed to delete quiz progress' },
      { status: 500 }
    )
  }
}

function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return 'mobile'
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet'
  }
  return 'desktop'
}