import nodemailer from "nodemailer";

interface GraphicDesignNotificationPayload {
  id?: number | string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  designCategories?: string;
  details?: string;
  created_at?: string;
}

interface SendGraphicDesignEmailPayload {
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

// Used by app/api/graphic-design-requests/route.ts to alert the team
// when a new request comes in.
export async function notifyTeamOfNewGraphicDesignRequest(
  payload: GraphicDesignNotificationPayload,
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
    designCategories,
    details,
    created_at,
  } = payload;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM || `"Design Requests" <${process.env.SMTP_USER}>`,
    to: teamEmail,
    subject: `New Graphic Design Request from ${name}`,
    html: `
      <h2>New Graphic Design Request</h2>
      <p><strong>ID:</strong> ${id ?? "-"}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Business Name:</strong> ${businessName || "-"}</p>
      <p><strong>Design Categories:</strong> ${designCategories || "-"}</p>
      <p><strong>Details:</strong></p>
      <p>${details || "-"}</p>
      <p><strong>Submitted At:</strong> ${created_at || new Date().toISOString()}</p>
    `,
  });
}

// Used by app/api/send-graphic-design-email/route.ts — the admin's
// "compose and send" email dialog, sent directly to the requester.
export async function sendGraphicDesignEmail(
  payload: SendGraphicDesignEmailPayload,
) {
  const { to, subject, message } = payload;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Design Team" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: message.replace(/\n/g, "<br />"),
    text: message,
  });
}
