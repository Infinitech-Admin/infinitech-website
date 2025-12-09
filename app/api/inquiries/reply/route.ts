import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inquiryId, email, name, message, status } = body

    // 1. Update status in database if provided
    if (status) {
      await fetch(`${API_URL}/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
    }

    // 2. Send email reply via nodemailer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const htmlContent = `
        <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; line-height: 1.5; background-color:#f5f6fa; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border:1px solid #e6ebf1; border-radius:8px; padding:24px;">
            <div style="text-align:center; margin-bottom:24px;">
              <img src="cid:logo" alt="Infinitech" height="100" style="display:block; margin:0 auto;" />
            </div>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <p style="color:#525f7f; font-size:16px; line-height:24px;">Dear ${name},</p>
            <p style="color:#525f7f; font-size:16px; line-height:24px;">
              Thank you for contacting Infinitech Advertising Corporation. We have reviewed your inquiry and here is our response:
            </p>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <div style="background-color:#f7fafc; padding:20px; border-radius:8px; border-left:4px solid #06b6d4;">
              <p style="color:#525f7f; font-size:16px; line-height:24px; margin:0;">${message}</p>
            </div>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <p style="color:#525f7f; font-size:16px; line-height:24px;">
              If you have any further questions, please don't hesitate to reach out to us.
            </p>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <p style="color:#8898aa; font-size:12px; line-height:16px; text-align:center; margin:20px auto;">
              Unit 311, Campos Rueda Building, 101 Urban Ave, Makati, 1206 Metro Manila<br/>
              LandLine: (02) 7001-6157 | Mobile: +63962-253-0149<br/>
              Email: infinitechadvertisingcorp@gmail.com<br/>
              Office Hours: Monday to Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: `"Infinitech Advertising Corporation" <${process.env.SMTP_USERNAME}>`,
        to: email,
        subject: 'Re: Your Inquiry - Infinitech Advertising Corporation',
        html: htmlContent,
        attachments: [
          {
            filename: 'logo.png',
            path: process.env.LOGO_PATH || './public/images/logo.png',
            cid: 'logo',
          },
        ],
      })

      console.log('✅ Reply email sent successfully to:', email)

      return NextResponse.json({
        success: true,
        message: 'Reply sent successfully!',
      }, { status: 200 })

    } catch (emailError) {
      console.error('⚠️ Email failed:', emailError)
      return NextResponse.json({
        success: false,
        message: 'Failed to send email reply',
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Error in reply route:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send reply', error: String(error) },
      { status: 500 }
    )
  }
}
