import nodemailer from "nodemailer";

interface PaidAdsNotificationPayload {
  id?: number | string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  adPlatforms?: string;
  monthlyBudget?: string;
  details?: string;
  created_at?: string;
}

interface SendPaidAdsEmailPayload {
  to: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function notifyTeamOfNewPaidAdsRequest(
  payload: PaidAdsNotificationPayload,
) {
  const teamEmail = process.env.TEAM_NOTIFICATION_EMAIL;
  if (!teamEmail) {
    console.warn(
      "⚠️ TEAM_NOTIFICATION_EMAIL is not configured, skipping notification.",
    );
    return;
  }

  const {
    id,
    name,
    email,
    phone,
    businessName,
    adPlatforms,
    monthlyBudget,
    details,
    created_at,
  } = payload;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM || `"Paid Ads Requests" <${process.env.SMTP_USER}>`,
    to: teamEmail,
    subject: `New Paid Ads Request from ${name}`,
    html: `
      <h2>New Paid Ads Request</h2>
      <p><strong>ID:</strong> ${id ?? "-"}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Business Name:</strong> ${businessName || "-"}</p>
      <p><strong>Ad Platforms:</strong> ${adPlatforms || "-"}</p>
      <p><strong>Monthly Budget:</strong> ${monthlyBudget || "-"}</p>
      <p><strong>Details:</strong></p>
      <p>${details || "-"}</p>
      <p><strong>Submitted At:</strong> ${created_at || new Date().toISOString()}</p>
    `,
  });
}

export async function sendPaidAdsEmail(payload: SendPaidAdsEmailPayload) {
  const { to, subject, message } = payload;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Ads Team" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: message.replace(/\n/g, "<br />"),
    text: message,
  });
}
