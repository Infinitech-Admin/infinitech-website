// 📁 Place this file at: app/api/send-tiktok-shop-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface SendEmailBody {
  to: string;
  subject: string;
  message: string;
  requestId?: number;
  requestData?: Record<string, unknown>;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { to, subject, message, requestId }: SendEmailBody = await req.json();

  if (!to || !subject || !message) {
    return NextResponse.json(
      { code: 400, message: "Missing required fields: to, subject, message" },
      { status: 400 },
    );
  }

  try {
    const html = message
      .split("\n")
      .map((line) => (line.trim() === "" ? "<br/>" : `<p>${line}</p>`))
      .join("");

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: message,
    });

    console.log(
      `✅ TikTok Shop email sent to ${to}${requestId ? ` (request #${requestId})` : ""}`,
    );

    return NextResponse.json(
      { code: 200, message: "Email sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send TikTok Shop Email Error:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to send email. Check SMTP configuration." },
      { status: 500 },
    );
  }
}
