import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface CartItem {
  planName: string
  service: string
  serviceTitle: string
  price: number
  billingPeriod: "monthly" | "yearly"
}

export async function POST(request: Request) {
  try {
    const { to, subject, cart, total, dateStr, timeStr, receiptNo } = await request.json()

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const itemsHtml = cart
      .map(
        (item: CartItem) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500; color: #1f2937;">${item.serviceTitle} - ${item.planName}</div>
          <div style="font-size: 12px; color: #6b7280;">1 × ₱${item.price.toLocaleString()}.00</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #1f2937;">
          ₱${item.price.toLocaleString()}.00
        </td>
      </tr>
    `,
      )
      .join("")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; padding: 24px 20px; border-bottom: 1px solid #e5e7eb;">
              <img src="cid:logo" alt="Infinitech" style="height: 60px; margin-bottom: 12px;">
              <h1 style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937; text-transform: uppercase;">
                Infinitech Advertising Corporation
              </h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
                311 Campos Rueda building, Urban Avenue,<br>
                Makati City, Metro Manila, 1206
              </p>
            </div>

            <!-- Total Amount -->
            <div style="text-align: center; padding: 24px 20px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 32px; font-weight: bold; color: #1f2937;">₱${total.toLocaleString()}.00</div>
              <div style="font-size: 12px; color: #f59e0b; margin-top: 4px;">Total</div>
            </div>

            <!-- Info Section -->
            <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">
              <div style="color: #6b7280;"><span style="color: #f59e0b;">Employee:</span> Sales Staff</div>
              <div style="color: #6b7280;">POS: Online</div>
              <div style="color: #6b7280; margin-top: 12px;"><span style="color: #f59e0b;">Customer:</span> ${to}</div>
              <div style="color: #6b7280;">Makati City, Metro Manila, 1206, Philippines</div>
            </div>

            <!-- Items -->
            <div style="padding: 16px 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 16px 0 8px; font-weight: bold; color: #1f2937;">Total</td>
                  <td style="padding: 16px 0 8px; text-align: right; font-weight: bold; color: #1f2937;">₱${total.toLocaleString()}.00</td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <a href="https://www.infinitechphil.com" style="color: #3b82f6; font-size: 12px; text-decoration: none;">www.infinitechphil.com</a>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">+639622530149 / (02)7001-6157</div>
              <div style="font-size: 11px; color: #3b82f6;">infinitechcorp.ph@gmail.com</div>
              <div style="display: flex; justify-content: space-between; margin-top: 16px; font-size: 11px; color: #9ca3af;">
                <span>${dateStr} ${timeStr}</span>
                <span>${receiptNo}</span>
              </div>
            </div>

          </div>
        </body>
      </html>
    `

    // Fetch the logo image and convert to base64
    const logoResponse = await fetch("https://www.infinitechphil.com/images/logo.png")
    const logoBuffer = await logoResponse.arrayBuffer()
    const logoBase64 = Buffer.from(logoBuffer).toString('base64')

    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          content: logoBase64,
          encoding: 'base64',
          cid: 'logo' // Content ID referenced in the HTML as src="cid:logo"
        }
      ]
    })

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
