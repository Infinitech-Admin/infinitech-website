import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const LARAVEL_URL = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

// ─── Nodemailer transporter ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
})

// ─── Admin notification email ─────────────────────────────────────────────
function adminEmailHTML(data: {
  full_name: string
  email: string
  mobile: string
  website_url: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1e293b}
    .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#0d1b3e 0%,#1a306e 100%);padding:28px 36px;display:flex;align-items:center;gap:14px}
    .hdr-icon{width:44px;height:44px;background:rgba(245,166,35,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
    .hdr h1{color:#fff;font-size:18px;font-weight:700}
    .hdr p{color:rgba(255,255,255,.6);font-size:12px;margin-top:3px}
    .bar{height:3px;background:linear-gradient(90deg,#f5a623,#e8891a)}
    .body{padding:28px 36px}
    .badge{display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:3px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:20px}
    .field{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f1f5f9}
    .field:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
    .lbl{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px}
    .val{font-size:15px;color:#1e293b;font-weight:500}
    .val a{color:#1a306e;text-decoration:none;font-weight:600}
    .url-box{background:#f0f4ff;border:1px solid #c7d2fe;border-radius:8px;padding:10px 14px;margin-top:6px}
    .url-box a{color:#1a306e;font-weight:700;font-size:14px;word-break:break-all}
    .footer{padding:18px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-icon">🔍</div>
      <div>
        <h1>New SEO Audit Request</h1>
        <p>Submitted via the website contact form.</p>
      </div>
    </div>
    <div class="bar"></div>
    <div class="body">
      <span class="badge">⚡ New Inquiry</span>
      <div class="field"><div class="lbl">Full Name</div><div class="val">${data.full_name}</div></div>
      <div class="field"><div class="lbl">Email</div><div class="val"><a href="mailto:${data.email}">${data.email}</a></div></div>
      <div class="field"><div class="lbl">Mobile</div><div class="val">${data.mobile}</div></div>
      <div class="field">
        <div class="lbl">Website to Audit</div>
        <div class="url-box"><a href="${data.website_url}" target="_blank">${data.website_url}</a></div>
      </div>
    </div>
    <div class="footer">Infinitech &mdash; Automated notification. Do not reply.</div>
  </div>
</body>
</html>`
}

// ─── Client confirmation email ────────────────────────────────────────────
function clientEmailHTML(full_name: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1e293b}
    .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#0d1b3e 0%,#1a306e 100%);padding:32px 36px;text-align:center}
    .hdr h1{color:#fff;font-size:20px;font-weight:800}
    .hdr p{color:rgba(255,255,255,.6);font-size:13px;margin-top:5px}
    .bar{height:3px;background:linear-gradient(90deg,#f5a623,#e8891a)}
    .body{padding:36px;text-align:center}
    .emoji{font-size:48px;display:block;margin-bottom:14px}
    .body h2{color:#0d1b3e;font-size:20px;font-weight:700;margin-bottom:8px}
    .body p{color:#64748b;font-size:14px;line-height:1.75;margin-bottom:10px}
    .box{background:linear-gradient(135deg,#fef9ec,#fef3c7);border:1px solid #f5a623;border-radius:10px;padding:14px 18px;margin:20px 0;text-align:left}
    .box-title{font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}
    .box p{color:#78350f;font-size:13px;line-height:1.6;margin:0}
    .note{font-size:12px;color:#94a3b8;margin-top:6px}
    .footer{padding:18px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>SEO Audit Request Confirmed</h1>
      <p>Thank you for reaching out to Infinitech!</p>
    </div>
    <div class="bar"></div>
    <div class="body">
      <span class="emoji">🎉</span>
      <h2>Thanks, ${full_name}!</h2>
      <p>We've successfully received your free SEO audit request.<br/>Our specialists are already reviewing your submission.</p>
      <div class="box">
        <div class="box-title">⏱ What Happens Next?</div>
        <p>Our SEO team will conduct a comprehensive analysis of your website and deliver a detailed report with actionable insights within <strong>24–48 business hours</strong>.</p>
      </div>
      <p class="note">🔒 Your information is secure and will never be shared.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Infinitech. All rights reserved.</div>
  </div>
</body>
</html>`
}

// ─── POST /api/seo-audit ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, mobile, website_url } = body

    if (!full_name || !email || !mobile || !website_url) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 })
    }

    const payload = { full_name, email, mobile, website_url }

    // 1. Save to Laravel DB
    const laravelRes = await fetch(`${LARAVEL_URL}/api/seo-audits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    })

    const laravelData = await laravelRes.json()

    if (!laravelRes.ok) {
      return NextResponse.json(
        { success: false, message: laravelData.message || "Failed to save audit request.", errors: laravelData.errors },
        { status: laravelRes.status }
      )
    }

    // 2. Send admin notification via Nodemailer
    const adminEmail = process.env.SMTP_RECEIVER || process.env.ADMIN_EMAIL || "infinitech.justin2024@gmail.com"

    await transporter.sendMail({
      from: `"SEO Audit Bot" <${process.env.SMTP_USERNAME}>`,
      to: adminEmail,
      subject: `🔍 New SEO Audit Request — ${full_name}`,
      html: adminEmailHTML(payload),
    })

    // 3. Send client confirmation via Nodemailer
    await transporter.sendMail({
      from: `"Infinitech SEO" <${process.env.SMTP_USERNAME}>`,
      to: email,
      subject: "Your SEO Audit Request Has Been Received ✅",
      html: clientEmailHTML(full_name),
    })

    return NextResponse.json({ success: true, message: "Audit request submitted successfully." }, { status: 200 })
  } catch (error) {
    console.error("SEO Audit route error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong.", error: String(error) },
      { status: 500 }
    )
  }
}

// ─── GET /api/seo-audit ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") || "1"
    const res  = await fetch(`${LARAVEL_URL}/api/seo-audits?page=${page}`, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch records.", error: String(error) }, { status: 500 })
  }
}
