import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SENDER_EMAIL = 'reports@future-u.app'  // You can use any subdomain like hello@, noreply@, etc.
const SENDER_NAME = 'Future U'

export async function sendCareerReport(email: string, name: string, reportContent: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: 'Your Career Strategy Report from Future U',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your Career Strategy Report</h1>
          <p>Hi ${name},</p>
          <p>Thank you for completing the Future U career assessment. Here's your personalized career strategy report:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${reportContent.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 20px;">
            To view this report online and access more features, visit 
            <a href="${process.env.NEXTAUTH_URL}/report/strategy">your dashboard</a>.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            This email was sent by Future U. If you didn't request this report, 
            please ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}