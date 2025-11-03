import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, ticket_number, email, message, subject, status } = body

    console.log("📧 Reply request received:", { ticketId, ticket_number, email, subject, status })

    if (!email || !message) {
      console.error("❌ Missing required fields:", { email: !!email, message: !!message })
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (!ticketId) {
      console.error("❌ Missing ticketId")
      return NextResponse.json({ message: "Ticket ID is required" }, { status: 400 })
    }

    // Create transporter with correct settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
      console.log("✅ SMTP connection verified")
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError)
      throw new Error("Email service configuration error")
    }

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
              <!-- Main Ticket Container - Landscape (Wider) -->
              <table width="1000" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);">
                
                <!-- Ticket Perforation Left -->
                <tr>
                  <td style="background: linear-gradient(0deg, transparent 0%, transparent 45%, #f0f4f8 45%, #f0f4f8 55%, transparent 55%), linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #0369a1 100%); background-size: 100% 20px, 100% 100%; width: 8px; height: 100%;"></td>
                  
                  <!-- Main Content Area -->
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Left Section: Ticket Info (Narrower stub) -->
                        <td width="240" style="background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); padding: 30px 25px; vertical-align: top; border-right: 3px dashed #ffffff;">
                          <!-- Logo -->
                          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                            <tr>
                              <td align="center">
                                <div style="background-color: #ffffff; padding: 15px 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); display: inline-block;">
                                  <img src="cid:logo" alt="Infinitech" style="width: 140px; height: auto; display: block;" />
                                </div>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Ticket Number -->
                          <div style="margin-bottom: 25px;">
                            <p style="margin: 0 0 6px 0; color: #e0f2fe; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">TICKET NUMBER</p>
                            <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1.5px; font-family: 'Courier New', monospace; word-break: break-all; line-height: 1.2;">${ticket_number}</p>
                          </div>
                          
                          <!-- Status Badge -->
                          <div style="margin-bottom: 25px;">
                            <p style="margin: 0 0 8px 0; color: #e0f2fe; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">STATUS</p>
                            <span style="display: inline-block; background-color: ${getStatusColor(status)}; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
                              ${status.replace("_", " ")}
                            </span>
                          </div>
                          
                          <!-- Divider -->
                          <div style="border-top: 2px solid rgba(255, 255, 255, 0.3); margin: 20px 0;"></div>
                          
                          <!-- Date -->
                          <p style="margin: 0; color: #e0f2fe; font-size: 10px; font-weight: 600;">
                            ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </td>
                        
                        <!-- Right Section: Message Content (Much wider) -->
                        <td style="padding: 30px 45px; vertical-align: top; background-color: #ffffff;">
                          <!-- Header -->
                          <h1 style="margin: 0 0 6px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Support Response</h1>
                          <p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px;">Hello! 👋 We've responded to your ticket.</p>
                          
                          <!-- Subject -->
                          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; border-left: 4px solid #0891b2;">
                            <p style="margin: 0 0 4px 0; color: #0369a1; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">▸ REGARDING</p>
                            <p style="margin: 0; color: #0c4a6e; font-size: 14px; font-weight: 600; line-height: 1.4;">
                              ${subject}
                            </p>
                          </div>
                          
                          <!-- Response -->
                          <div style="margin-bottom: 18px;">
                            <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                              ✉️ OUR RESPONSE:
                            </p>
                            <div style="background-color: #fafafa; border: 2px solid #e2e8f0; border-left: 4px solid #0891b2; border-radius: 8px; padding: 18px;">
                              <p style="margin: 0; color: #1e293b; font-size: 13px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                            </div>
                          </div>
                          
                          <!-- Help Note -->
                          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 12px 16px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 11px; line-height: 1.6; font-weight: 500;">
                              <strong>💡 Need more help?</strong> Simply reply to this email and we'll get back to you ASAP.
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <!-- Ticket Perforation Right -->
                  <td style="background: linear-gradient(0deg, transparent 0%, transparent 45%, #f0f4f8 45%, #f0f4f8 55%, transparent 55%), #1e293b; background-size: 100% 20px, 100% 100%; width: 8px;"></td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td colspan="3" style="background-color: #1e293b; padding: 20px 40px; text-align: center;">
                    <p style="margin: 0 0 5px 0; color: #cbd5e1; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">
                      INFINITECH SUPPORT TEAM
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                      © ${new Date().getFullYear()} Infinitech. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
              
              <!-- Bottom Notice -->
              <table width="1000" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td style="text-align: center; padding: 0 20px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
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
    console.log("📨 Sending email to:", email)

    const logoPath = `${process.cwd()}/public/images/logo.png`
    console.log("📁 Logo path:", logoPath)

    await transporter.sendMail({
      from: `"Infinitech Support Team" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Re: ${subject} [Ticket: ${ticket_number}]`,
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    })
    console.log("✅ Email sent successfully")

    // Update ticket status in Laravel backend
    console.log("🔄 Updating ticket status in backend:", { ticketId, status })
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support-tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error("❌ Failed to update ticket status:", errorText)
    } else {
      console.log("✅ Ticket status updated successfully")
    }

    return NextResponse.json({ message: "Reply sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("💥 Error sending reply:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to send reply" },
      { status: 500 },
    )
  }
}
