import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { ticketId, email, message, subject, status } = await request.json()

    if (!email || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Send email to user
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #06b6d4, #0c4a6e); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Support Ticket Response</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p>Hi,</p>
          <p>We've responded to your support ticket regarding: <strong>${subject}</strong></p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0;">
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            Ticket ID: #${ticketId} | Status: ${status}
          </p>
        </div>
        <div style="background: #1e293b; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">© 2025 Support Team. All rights reserved.</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Re: ${subject}`,
      html: htmlContent,
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
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to send reply" },
      { status: 500 },
    )
  }
}
