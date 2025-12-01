import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || '1'
    const status = searchParams.get('status') || ''

    const queryParams = new URLSearchParams({
      page,
      ...(status && { status }),
    })

    console.log('🔍 Fetching inquiries from:', `${API_URL}/api/inquiries?${queryParams}`)

    const response = await fetch(`${API_URL}/api/inquiries?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('❌ Laravel API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      throw new Error(`Laravel API returned ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Inquiries fetched successfully:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('💥 Error in GET /api/inquiries:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiries', error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    console.log('📝 Creating new inquiry:', { name, email, phone })

    // 1. Save to Laravel database
    const dbResponse = await fetch(`${API_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, message }),
    })

    const dbData = await dbResponse.json()

    if (!dbData.success) {
      console.error('❌ Database save failed:', dbData)
      return NextResponse.json(dbData, { status: dbResponse.status })
    }

    console.log('✅ Inquiry saved to database')

    // 2. Send email via nodemailer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      const htmlContent = `
        <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; line-height: 1.5; background-color:#f5f6fa; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border:1px solid #e6ebf1; border-radius:8px; padding:24px;">
            <div style="text-align:center; margin-bottom:24px;">
              <img src="cid:logo" alt="Infinitech" height="100" style="display:block; margin:0 auto;" />
            </div>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <p style="color:#525f7f; font-size:16px; line-height:24px;">Dear Infinitech Team,</p>
            <p style="color:#525f7f; font-size:16px; line-height:24px;">
              A new inquiry has been submitted through your website. Below are the details:
            </p>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Name:</strong> ${name}</p>
            <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Email:</strong> ${email}</p>
            <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Phone:</strong> ${phone}</p>
            <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Message:</strong></p>
            <p style="color:#525f7f; font-size:16px; line-height:24px;">${message}</p>

            <hr style="border-color:#e6ebf1; margin:20px 0;" />

            <p style="color:#525f7f; font-size:16px; line-height:24px;">
              Please follow up with the client promptly to address their inquiry.
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
        from: `"${name}" <${process.env.SMTP_USERNAME}>`,
        to: process.env.SMTP_RECEIVER,
        subject: '📩 New Inquiry - Infinitech Advertising Corporation',
        html: htmlContent,
        attachments: [
          {
            filename: 'logo.png',
            path: process.env.LOGO_PATH || './public/images/logo.png',
            cid: 'logo',
          },
        ],
      })

      console.log('✅ Email sent successfully!')

    } catch (emailError) {
      console.error('⚠️ Email failed but inquiry saved:', emailError)
      // Still return success since inquiry was saved
      return NextResponse.json({
        success: true,
        message: 'Inquiry saved successfully! (Email notification pending)',
        data: dbData.data
      }, { status: 201 })
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully!',
      data: dbData.data
    }, { status: 201 })

  } catch (error) {
    console.error('💥 Error in POST /api/inquiries:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit inquiry', error: String(error) },
      { status: 500 }
    )
  }
}
