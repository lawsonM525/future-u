import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'
import { GuestReport } from '@/models/GuestReport'
import { newReportToken, hashReportToken, privateReportHeaders } from '@/lib/guest-report-access'
import { allowRequest, requestAddress } from '@/lib/request-limit'
import { validateQuizSubmission } from '@/lib/quiz-validation'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const submission = validateQuizSubmission(await request.json().catch(() => null))
    if (!submission) return NextResponse.json({ error: 'Please answer the quiz questions before generating your report.' }, { status: 400 })
    await connect()
    if (!await allowRequest(`guest-create:${requestAddress(request)}`, 5)) {
      return NextResponse.json({ error: 'You have created several reports. Please try again in an hour.' }, { status: 429, headers: { 'Retry-After': '3600' } })
    }
    const token = newReportToken()
    await GuestReport.create({ ...submission, tokenHash: hashReportToken(token) })
    return NextResponse.json({ url: `/results/${token}` }, { status: 201, headers: privateReportHeaders })
  } catch (error) {
    console.error('Unable to create guest report:', error)
    return NextResponse.json({ error: 'Could not start your report. Your quiz answers are still saved. Please try again.' }, { status: 500 })
  }
}
