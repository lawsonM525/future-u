import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { QuizTemp } from '@/models/QuizTemp'
import { Report } from '@/models/Report'
import { auth } from '@/app/utils/authOptions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 300

// Supports quizzes completed before guest results were introduced.
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const { tempId } = await request.json().catch(() => ({}))
  if (typeof tempId !== 'string' || !/^[a-f0-9]{24}$/i.test(tempId)) return NextResponse.json({ error: 'A valid temporary quiz ID is required' }, { status: 400 })
  let locked = false
  try {
    await connect()
    const existing = await QuizTemp.findById(tempId)
    if (!existing || (existing.userId && existing.userId !== session.user.id)) return NextResponse.json({ error: 'Quiz not found or expired' }, { status: 404 })
    if (existing.processed) {
      const report = existing.reportId
        ? await Report.findOne({ _id: existing.reportId, userId: session.user.id })
        : await Report.findOne({ userId: session.user.id, quizType: existing.quizType, createdAt: { $gte: existing.createdAt } }).sort({ createdAt: -1 })
      if (report) return NextResponse.json({ reportId: String(report._id) })
    }
    const quiz = await QuizTemp.findOneAndUpdate({
      _id: tempId,
      $and: [
        { $or: [{ userId: null }, { userId: session.user.id }] },
        { $or: [{ processingStartedAt: { $exists: false } }, { processingStartedAt: { $lt: new Date(Date.now() - 240_000) } }] },
      ],
    }, { $set: { userId: session.user.id, processingStartedAt: new Date() } }, { new: true })
    if (!quiz) return NextResponse.json({ error: 'Your report is already processing. Please wait a moment, then retry.' }, { status: 409 })
    locked = true
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 190_000)
    try {
      const response = await fetch(new URL('/api/process-quiz', request.url), {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') || '' },
        body: JSON.stringify({ answers: quiz.answers, quizType: quiz.quizType }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not process your report')
      await QuizTemp.updateOne({ _id: tempId }, { $set: { processed: true, reportId: data.reportId }, $unset: { processingStartedAt: 1 } })
      // The dashboard generates the timeline independently. Never hold the sign-in callback open for it.
      return NextResponse.json(data)
    } finally { clearTimeout(timer) }
  } catch (error) {
    if (locked) await QuizTemp.updateOne({ _id: tempId }, { $unset: { processingStartedAt: 1 } }).catch(() => {})
    console.error('Could not process temporary quiz:', error)
    return NextResponse.json({ error: 'Could not finish your report. Your answers are saved. Please retry.' }, { status: 500 })
  }
}
