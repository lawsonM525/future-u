import { NextResponse } from 'next/server'
import { sendCareerReport } from '@/app/utils/email'

export async function GET() {
  try {
    await sendCareerReport(
      'mlawsy525@gmail.com',
      'Michelle',
      `Here's your test career strategy report!

Career Strategy:
1. Focus on developing your technical skills in software development
2. Build a portfolio of projects that demonstrate your abilities
3. Network with other professionals in the tech industry

Similar Career Paths:
- Software Engineer (95% match)
- Full Stack Developer (90% match)
- DevOps Engineer (85% match)

This is just a test email to verify the email sending functionality is working correctly.`
    )

    return NextResponse.json({ success: true, message: 'Test email sent!' })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
