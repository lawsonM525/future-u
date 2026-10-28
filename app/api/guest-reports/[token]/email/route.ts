import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connect } from '@/lib/mongodb'
import { GuestReport } from '@/models/GuestReport'
import { hashReportToken, normalizeEmail, privateReportHeaders } from '@/lib/guest-report-access'
import { allowRequest, requestAddress } from '@/lib/request-limit'

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const tokenHash = hashReportToken(params.token)
  if (!tokenHash) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
  const email = normalizeEmail((await request.json().catch(() => ({}))).email)
  if (!email) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email is temporarily unavailable. Keep this page bookmarked or sign in to save your report.' }, { status: 503 })
  try {
    await connect()
    const report = await GuestReport.findOne({ tokenHash, content: { $exists: true, $ne: '' } })
    if (!report) return NextResponse.json({ error: 'Your report is not ready yet.' }, { status: 404 })
    if (!await allowRequest(`report-email:${tokenHash}`, 3) || !await allowRequest(`report-email-ip:${requestAddress(request)}`, 5) || !await allowRequest(`report-email-to:${email}`, 3)) {
      return NextResponse.json({ error: 'Several emails have been requested. Check your inbox or try again in an hour.' }, { status: 429 })
    }
    // Use a configured origin, never a caller-provided Host header or redirect URL.
    const origin = new URL(process.env.NEXTAUTH_URL || 'https://www.future-u.app').origin
    const link = `${origin}/results/${params.token}`
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: 'Future U <reports@future-u.app>', to: email,
      subject: 'Your Future U report is ready to revisit',
      text: `Here is your Future U report: ${link}\n\nYou can reopen it without signing in. Keep this link private: anyone with it can view the report. Sign in from the report to save it to your dashboard and track your goals.\n\nYou requested this email on Future U. If this was not you, you can ignore it.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Your Future U report</h1><p>Your results are ready whenever you want to revisit them.</p><p><a href="${link}" style="display:inline-block;background:#f4d348;color:#111;padding:14px 20px;border-radius:24px;text-decoration:none">Open my report</a></p><p>No sign-in is required. Keep this link private: anyone with it can view your report.</p><p>Want to save it to your dashboard and track your goals? Sign in from your report.</p><p style="color:#777;font-size:12px">You requested this email on Future U. If this was not you, you can ignore it.</p></div>`,
    })
    if (error) throw error
    return NextResponse.json({ success: true }, { headers: privateReportHeaders })
  } catch (error) {
    console.error('Unable to email guest report link:', error)
    return NextResponse.json({ error: 'The email could not be sent. Please try again, or bookmark this page.' }, { status: 502 })
  }
}
