import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const LARAVEL_URL = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
})

function replyEmailHTML(data: {
  full_name: string
  body: string
  subject: string
  website_url: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1e293b}
    .wrap{max-width:580px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#0d1b3e 0%,#1a306e 100%);padding:28px 36px}
    .hdr h1{color:#fff;font-size:18px;font-weight:700}
    .hdr p{color:rgba(255,255,255,.6);font-size:12px;margin-top:3px}
    .bar{height:3px;background:linear-gradient(90deg,#f5a623,#e8891a)}
    .body{padding:28px 36px}
    .greeting{font-size:15px;color:#1e293b;margin-bottom:16px}
    .message-box{background:#f8fafc;border-left:3px solid #f5a623;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap}
    .site-ref{font-size:12px;color:#94a3b8;margin-top:16px}
    .site-ref a{color:#1a306e}
    .footer{padding:18px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>Reply from Infinitech</h1>
      <p>Re: SEO Audit — ${data.website_url}</p>
    </div>
    <div class="bar"></div>
    <div class="body">
      <p class="greeting">Hi ${data.full_name},</p>
      <div class="message-box">${data.body}</div>
      <p class="site-ref">This reply is regarding your SEO audit request for: <a href="${data.website_url}">${data.website_url}</a></p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Infinitech. All rights reserved.</div>
  </div>
</body>
</html>`
}

// POST /api/seo-audit/[id]/reply
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reply_body, subject, full_name, email, website_url } = body
    const auditId = params.id

    if (!reply_body?.trim()) {
      return NextResponse.json({ success: false, message: "Reply body is required." }, { status: 400 })
    }

    const adminEmail = process.env.SMTP_USERNAME || process.env.ADMIN_EMAIL || ""
    const replySubject = subject || `Re: SEO Audit — ${website_url}`

    // 1. Save reply to Laravel DB
    const laravelRes = await fetch(`${LARAVEL_URL}/api/seo-audits/${auditId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        body: reply_body,
        subject: replySubject,
        from_email: adminEmail,
      }),
    })

    const laravelData = await laravelRes.json()

    if (!laravelRes.ok) {
      return NextResponse.json(
        { success: false, message: laravelData.message || "Failed to save reply.", errors: laravelData.errors },
        { status: laravelRes.status }
      )
    }

    // 2. Send email via Nodemailer
    await transporter.sendMail({
      from: `"Infinitech SEO" <${adminEmail}>`,
      to: email,
      subject: replySubject,
      html: replyEmailHTML({ full_name, body: reply_body, subject: replySubject, website_url }),
    })

    return NextResponse.json({
      success: true,
      message: "Reply sent and saved.",
      data: laravelData.data,
    })
  } catch (error) {
    console.error("SEO Audit reply error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong.", error: String(error) },
      { status: 500 }
    )
  }
}
