import nodemailer, { type Transporter } from "nodemailer";

export interface WebsiteInquiryData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website: string;
  details?: string | null;
  created_at: string;
}

export interface SendInquiryEmailParams {
  to: string;
  subject: string;
  message: string;
  inquiryData?: WebsiteInquiryData;
}

let transporter: Transporter | null = null;

/**
 * Lazily creates (and caches) the SMTP transporter.
 * Throws a clear error if required env vars are missing, so the API route
 * can surface a useful message instead of a generic 500.
 */
function getTransporter(): Transporter {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured: SMTP_USER and SMTP_PASS are required.",
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Converts plain-text message (with \n line breaks) into a simple HTML body.
 */
function toHtml(message: string): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; font-size: 18px; margin: 0;">Website Audit Inquiries</h1>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        ${escaped
          .split("\n")
          .map((line) => `<p style="margin: 0 0 12px;">${line || "&nbsp;"}</p>`)
          .join("")}
      </div>
    </div>
  `;
}

/**
 * Sends a reply email to the person who submitted a website audit inquiry.
 */
export async function sendInquiryEmail({
  to,
  subject,
  message,
}: SendInquiryEmailParams): Promise<void> {
  const client = getTransporter();

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await client.sendMail({
    from,
    to,
    subject,
    text: message,
    html: toHtml(message),
  });
}

/**
 * Optional: notifies the internal team (SMTP_RECEIVER, comma-separated)
 * whenever a new website audit inquiry comes in. Call this from wherever
 * new inquiries are created if you want internal alerts.
 */
export async function notifyTeamOfNewInquiry(
  inquiry: WebsiteInquiryData,
): Promise<void> {
  const receivers = process.env.SMTP_RECEIVER;
  if (!receivers) return; // no-op if not configured

  const client = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const message = `New website audit inquiry received.

Name: ${inquiry.name}
Email: ${inquiry.email}
Phone: ${inquiry.phone || "N/A"}
Company: ${inquiry.company || "N/A"}
Website: ${inquiry.website}
Focus Areas: ${inquiry.details || "N/A"}
Submitted: ${new Date(inquiry.created_at).toLocaleString()}`;

  await client.sendMail({
    from,
    to: receivers.split(",").map((r) => r.trim()),
    subject: `New Website Audit Inquiry - ${inquiry.company || inquiry.name}`,
    text: message,
    html: toHtml(message),
  });
}

/**
 * Verifies SMTP credentials/connection. Useful for a health-check route
 * or for debugging "Failed to send email" errors.
 */
export async function verifySmtpConnection(): Promise<boolean> {
  const client = getTransporter();
  await client.verify();
  return true;
}
