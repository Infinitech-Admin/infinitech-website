import nodemailer from "nodemailer"
import { type NextRequest, NextResponse } from "next/server"

interface SurveyEmailRequest {
  to: string
  subject: string
  message: string
  surveyId: number
  companyName: string
  contactPerson: string
  surveyData: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: SurveyEmailRequest = await request.json()
    const { to, subject, message, surveyId, companyName, contactPerson } = body

    // Get SMTP credentials from environment variables
    const smtpUsername = process.env.SMTP_USERNAME
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com"
    const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587")
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUsername

    if (!smtpUsername || !smtpPassword) {
      console.error("Missing SMTP credentials in environment variables")
      return NextResponse.json({ error: "Email service not configured properly" }, { status: 500 })
    }

    // Parse recipient emails (comma-separated or single)
    const recipientEmails = to
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)
    if (recipientEmails.length === 0) {
      return NextResponse.json({ error: "No valid recipient emails provided" }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    })

    // Convert plain text message to HTML with proper formatting
    const formattedMessage = message.replace(/\n/g, "<br>")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9fafb;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .message-box {
            background: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .survey-ref {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Message from INFINITECH ADVERTISING CORPORATION</h1>
            <p>Regarding Survey #${surveyId} - ${companyName || "N/A"}</p>
          </div>
          
          <div class="content">
            <div class="message-box">
              ${formattedMessage}
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 13px; margin: 0;">
                <strong>Survey Reference:</strong> <span class="survey-ref">#${surveyId}</span>
              </p>
              <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">
                <strong>Company:</strong> ${companyName || "N/A"}
              </p>
              <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">
                <strong>Contact:</strong> ${contactPerson || "N/A"}
              </p>
            </div>

            <div class="footer">
              <p>This email was sent from INFINITECH ADVERTISING CORPORATION</p>
              <p>© ${new Date().getFullYear()} All Rights Reserved</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email to all recipients
    const info = await transporter.sendMail({
      from: fromEmail,
      to: recipientEmails.join(", "),
      subject: subject || `Survey Follow-up - #${surveyId} | ${companyName}`,
      html: emailHtml,
      text: message,
    })

    console.log("Email sent successfully:", info.messageId)

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        messageId: info.messageId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email", details: String(error) }, { status: 500 })
  }
}
