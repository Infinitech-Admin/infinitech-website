import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface SocialMedia {
  platform: string
  url: string
}

interface JuanTapSurveyData {
  id: number
  juantap_survey_id: string
  email: string
  username: string
  address: string
  phone_number: string
  display_name: string
  first_name: string
  last_name: string
  position: string
  website: string
  social_media: SocialMedia[] | string
  profile_image: string
  profile_image_url: string
  delivery_address: string
  receiver_phone_number: string
  created_at: string
}

export async function POST(request: Request) {
  try {
    const { to, subject, message, juantap_survey_id, displayName, surveyData } = await request.json()

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Parse social media if it's a string
    const parseSocialMedia = (social_media: SocialMedia[] | string): SocialMedia[] => {
      if (!social_media) return []
      if (typeof social_media === "string") {
        try {
          return JSON.parse(social_media) as SocialMedia[]
        } catch {
          return []
        }
      }
      return Array.isArray(social_media) ? social_media : []
    }

    const survey = surveyData as JuanTapSurveyData
    const socialMediaArray = parseSocialMedia(survey?.social_media)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header with Gradient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; padding: 40px 20px;">
              <div style="background: white; width: 80px; height: 80px; margin: 0 auto 16px; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <span style="font-size: 32px; font-weight: bold; color: #667eea;">JT</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">
                JuanTap
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                Digital Profile Platform
              </p>
            </div>

            <!-- Survey ID Badge -->
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                Survey ID: ${juantap_survey_id}
              </div>
            </div>

            <!-- Message Content -->
            <div style="padding: 32px 24px;">
              <div style="margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1f2937;">
                  Hello ${displayName || 'Valued User'}! 👋
                </h2>
                <div style="font-size: 15px; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">
${message}
                </div>
              </div>

              ${survey ? `
              <!-- Survey Information Card -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
                  📋 Your Submitted Information
                </h3>
                
                ${survey.display_name ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Display Name</div>
                  <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${survey.display_name}</div>
                </div>
                ` : ''}

                ${survey.first_name || survey.last_name ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Name</div>
                  <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${survey.first_name || ''} ${survey.last_name || ''}</div>
                </div>
                ` : ''}

                ${survey.position ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Position</div>
                  <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${survey.position}</div>
                </div>
                ` : ''}

                ${survey.email ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Email</div>
                  <div style="font-size: 14px; color: #3b82f6;">${survey.email}</div>
                </div>
                ` : ''}

                ${survey.phone_number ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Phone</div>
                  <div style="font-size: 14px; color: #1f2937;">${survey.phone_number}</div>
                </div>
                ` : ''}

                ${survey.delivery_address ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Delivery Address</div>
                  <div style="font-size: 14px; color: #1f2937;">${survey.delivery_address}</div>
                </div>
                ` : ''}

                ${survey.receiver_phone_number ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Receiver Phone</div>
                  <div style="font-size: 14px; color: #1f2937;">${survey.receiver_phone_number}</div>
                </div>
                ` : ''}

                ${socialMediaArray && socialMediaArray.length > 0 ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Social Media</div>
                  ${socialMediaArray.map((social: SocialMedia) => `
                    <div style="margin-bottom: 6px;">
                      <a href="${social.url.startsWith('http') ? social.url : `https://${social.url}`}" 
                         style="color: #3b82f6; font-size: 13px; text-decoration: none;">
                        ${social.platform}: ${social.url}
                      </a>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
              </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 24px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                Need help? Contact our support team
              </p>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                © ${new Date().getFullYear()} JuanTap. All rights reserved.
              </div>
            </div>

          </div>

          <!-- Security Notice -->
          <div style="max-width: 600px; margin: 16px auto 0; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
              🔒 <strong>Security Notice:</strong> This email contains personal information. Please keep it confidential.
            </p>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"JuanTap" <${process.env.SMTP_USERNAME}>`,
      to,
      subject,
      html: htmlContent,
      text: message, // Plain text fallback
    })

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
