// 📁 Place this file at: lib/tiktok-shop-mailer.ts
//
// NOTE: This mirrors the expected shape of your existing
// `lib/market-research-mailer.ts`. If that file already sets up a shared
// transporter/client (nodemailer, Resend, SES, etc.), reuse it here instead
// of the nodemailer setup below — just swap the send call.

import nodemailer from "nodemailer";

interface TikTokShopNotificationPayload {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  productCategories?: string[];
  details?: string;
  created_at: string;
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

export async function notifyTeamOfNewTikTokShopRequest(
  payload: TikTokShopNotificationPayload,
) {
  const teamEmail = process.env.TEAM_NOTIFICATION_EMAIL;
  if (!teamEmail) {
    console.warn(
      "⚠️ TEAM_NOTIFICATION_EMAIL not set — skipping notification email.",
    );
    return;
  }

  const categories = payload.productCategories?.length
    ? payload.productCategories.join(", ")
    : "—";

  const html = `
    <h2>New TikTok Shop Opening Request</h2>
    <p><strong>Request ID:</strong> ${payload.id ?? "N/A"}</p>
    <p><strong>Name:</strong> ${payload.name}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Phone:</strong> ${payload.phone || "—"}</p>
    <p><strong>Business Name:</strong> ${payload.businessName || "—"}</p>
    <p><strong>Product Categories:</strong> ${categories}</p>
    <p><strong>Details:</strong><br/>${(payload.details || "—").replace(/\n/g, "<br/>")}</p>
    <p><strong>Submitted:</strong> ${payload.created_at}</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: teamEmail,
    subject: `New TikTok Shop Request from ${payload.name}`,
    html,
  });
}
