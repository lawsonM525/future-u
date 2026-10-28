import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { GuestReport } from '@/models/GuestReport'
import { Timeline } from '@/models/Timeline'
import { generateCareerReport } from '@/lib/generate-career-report'
import { generateTimeline } from '@/lib/generate-timeline'
import type { TimelineCheckpoint } from '@/types/timeline'
import { hashReportToken, privateReportHeaders } from '@/lib/guest-report-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 300
type Context = { params: { token: string } }

function publicReport(report: { status: string; content?: string; summary?: string; checkpoints?: TimelineCheckpoint[]; timelineError?: boolean; attempts: number; generationStartedAt?: Date }) {
  return {
    status: report.status,
    content: report.content || '',
    summary: report.summary || '',
    checkpoints: report.checkpoints || [],
    timelineError: report.timelineError || false,
    canRetry: report.attempts < 3,
    stale: report.status === 'processing' && Date.now() - new Date(report.generationStartedAt || 0).getTime() > 300_000,
  }
}

export async function GET(_request: Request, { params }: Context) {
  const tokenHash = hashReportToken(params.token)
  if (!tokenHash) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
  try {
    await connect()
    const report = await GuestReport.findOne({ tokenHash })
    if (!report) return NextResponse.json({ error: 'Report not found. Check your email link or take the quiz again.' }, { status: 404 })
    return NextResponse.json(publicReport(report), { headers: privateReportHeaders })
  } catch {
    return NextResponse.json({ error: 'Could not load your report. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Context) {
  const tokenHash = hashReportToken(params.token)
  if (!tokenHash) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
  let startedAt: Date | undefined
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 240_000)
  try {
    await connect()
    const { retryTimeline } = await request.json().catch(() => ({}))
    startedAt = new Date()
    const eligible = [
      { status: { $in: ['pending', 'failed'] } },
      { status: 'processing', generationStartedAt: { $lt: new Date(Date.now() - 300_000) } },
      ...(retryTimeline === true ? [{ status: 'ready', timelineError: true }] : []),
    ]
    const report = await GuestReport.findOneAndUpdate(
      { tokenHash, attempts: { $lt: 3 }, $or: eligible },
      { $set: { status: 'processing', generationStartedAt: startedAt }, $inc: { attempts: 1 } },
      { new: true }
    )
    if (!report) {
      const existing = await GuestReport.findOne({ tokenHash })
      if (!existing) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
      return NextResponse.json(publicReport(existing), { status: existing.status === 'processing' ? 202 : 200, headers: privateReportHeaders })
    }
    if (!report.content) {
      const generated = await generateCareerReport({ answers: report.answers, signal: controller.signal })
      report.content = generated.reportContent
      report.summary = generated.summary
      report.archetypeTag = generated.archetypeTag
      report.userProfile = generated.userProfile
      await GuestReport.updateOne({ tokenHash, generationStartedAt: startedAt }, { $set: {
        content: report.content, summary: report.summary, archetypeTag: report.archetypeTag, userProfile: report.userProfile,
      } })
    }
    try {
      report.checkpoints = await generateTimeline({ reportContent: report.content, userProfile: report.userProfile, quizType: report.quizType, signal: controller.signal })
      report.timelineError = false
    } catch (error) {
      console.error('Guest timeline generation failed:', error)
      report.timelineError = true
    }
    await GuestReport.updateOne({ tokenHash, generationStartedAt: startedAt }, { $set: {
      status: 'ready', checkpoints: report.checkpoints, timelineError: report.timelineError,
    } })
    // A visitor may save their report while its roadmap is still generating.
    const current = await GuestReport.findOne({ tokenHash })
    if (current?.userId && report.checkpoints.length) {
      await Timeline.findOneAndUpdate({ reportId: String(report._id), userId: current.userId }, { $set: { checkpoints: report.checkpoints } }, { upsert: true })
    }
    return NextResponse.json(publicReport({ ...report.toObject(), status: 'ready' }), { headers: privateReportHeaders })
  } catch (error) {
    console.error('Guest report generation failed:', error)
    if (startedAt) await GuestReport.updateOne({ tokenHash, generationStartedAt: startedAt }, { $set: { status: 'failed' } }).catch(() => {})
    return NextResponse.json({ error: 'Your answers are safe, but the report could not finish. Please try again.' }, { status: 500, headers: privateReportHeaders })
  } finally {
    clearTimeout(timer)
  }
}
