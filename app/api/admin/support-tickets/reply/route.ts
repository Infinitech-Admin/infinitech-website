import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { ticketId, email, message, subject, status } = await request.json()

    if (!email || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create transporter with correct settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // Use SSL for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Verify transporter configuration
    await transporter.verify()

    // Status badge color
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "open":
          return "#10b981"
        case "in_progress":
          return "#f59e0b"
        case "resolved":
          return "#0891b2"
        case "closed":
          return "#6b7280"
        default:
          return "#0891b2"
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Ticket Response</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #0369a1 100%); padding: 40px 40px 30px 40px; text-align: center; position: relative;">
                    <!-- Logo on white background -->
                    <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #ffffff; padding: 15px 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                          <img src="cid:logo" alt="Infinitech" style="width: 120px; height: auto; display: block;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Support Ticket Response</h1>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <!-- Greeting -->
                    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 600;">Hello! 👋</h2>
                    <p style="margin: 0 0 25px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                      Great news! We've responded to your support ticket.
                    </p>
                    
                    <!-- Ticket Subject Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; border: 2px solid #bae6fd;">
                          <p style="margin: 0 0 8px 0; color: #0369a1; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Regarding</p>
                          <p style="margin: 0; color: #0c4a6e; font-size: 17px; font-weight: 600; line-height: 1.4;">
                            ${subject}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Response Message -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">Our Response:</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #ffffff; border: 2px solid #e2e8f0; border-left: 5px solid #0891b2; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
                          <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${message}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Ticket Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 10px; padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="padding-right: 10px;">
                                <p style="margin: 0 0 5px 0; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Ticket ID</p>
                                <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">#${ticketId}</p>
                              </td>
                              <td width="50%" style="padding-left: 10px; text-align: right;">
                                <p style="margin: 0 0 5px 0; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
                                <span style="display: inline-block; background-color: ${getStatusColor(status)}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: capitalize;">
                                  ${status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA or Note -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 18px; border-left: 4px solid #f59e0b;">
                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                            <strong>💡 Need more help?</strong> Simply reply to this email and we'll get back to you as soon as possible.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1e293b; padding: 30px 40px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #cbd5e1; font-size: 15px; font-weight: 600;">
                      Infinitech Support Team
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                      © ${new Date().getFullYear()} Infinitech. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
              
              <!-- Spacer -->
              <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td style="text-align: center; padding: 0 20px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                      This email was sent to ${email}. If you have any questions, please don't hesitate to contact us.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Send email to user with logo attachment
    await transporter.sendMail({
      from: `"Infinitech Support Team" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Re: ${subject}`,
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: "./public/images/logo.png",
          cid: "logo",
        },
      ],
    })

    // Update ticket status in Laravel backend
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support-tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!updateResponse.ok) {
      console.error("[v0] Failed to update ticket status in backend")
    }

    return NextResponse.json({ message: "Reply sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error sending reply:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to send reply" },
      { status: 500 },
    )
  }
}
