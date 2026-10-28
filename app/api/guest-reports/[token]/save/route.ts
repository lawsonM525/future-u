import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { GuestReport } from '@/models/GuestReport'
import { Report } from '@/models/Report'
import { Timeline } from '@/models/Timeline'
import { hashReportToken, privateReportHeaders } from '@/lib/guest-report-access'

export async function POST(_request: Request, { params }: { params: { token: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save this report.' }, { status: 401 })
  const tokenHash = hashReportToken(params.token)
  if (!tokenHash) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
  try {
    await connect()
    // Claim atomically. Opening an emailed link never claims a report automatically.
    const guest = await GuestReport.findOneAndUpdate(
      { tokenHash, content: { $exists: true, $ne: '' }, $or: [{ userId: null }, { userId: session.user.id }] },
      { $set: { userId: session.user.id } }, { new: true }
    )
    if (!guest) return NextResponse.json({ error: 'This report is unavailable or already saved to another account.' }, { status: 409 })
    // Reuse the guest record ID, so repeated callbacks cannot duplicate account reports.
    await Report.findOneAndUpdate({ _id: guest._id, userId: session.user.id }, { $setOnInsert: {
      userId: session.user.id, content: guest.content, summary: guest.summary, archetypeTag: guest.archetypeTag,
      userProfile: guest.userProfile, quizType: guest.quizType, careers: [], createdAt: new Date(),
    } }, { upsert: true })
    if (guest.checkpoints?.length) {
      await Timeline.findOneAndUpdate({ reportId: String(guest._id), userId: session.user.id }, { $setOnInsert: { checkpoints: guest.checkpoints } }, { upsert: true })
    }
    return NextResponse.json({ url: '/dashboard' }, { headers: privateReportHeaders })
  } catch (error) {
    console.error('Unable to save guest report:', error)
    return NextResponse.json({ error: 'Could not save your report. Your results are still available here. Please try again.' }, { status: 500 })
  }
}
