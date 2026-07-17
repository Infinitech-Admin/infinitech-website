// 📁 Place this file at: lib/mailer-core.ts
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Lazily creates (and caches) the shared SMTP transporter used across
 * all mailer modules (website-audit-mailer, market-research-mailer, etc).
 */
export function getTransporter(): Transporter {
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
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export function getFromAddress(): string | undefined {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
}

export function getTeamReceivers(): string[] {
  const receivers = process.env.SMTP_RECEIVER;
  if (!receivers) return [];
  return receivers.split(",").map((r) => r.trim());
}

/** Converts a plain-text message (with \n line breaks) into simple branded HTML. */
export function toHtmlEmail(heading: string, message: string): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; font-size: 18px; margin: 0;">${heading}</h1>
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

/** Verifies SMTP credentials/connection — useful for a health-check route. */
export async function verifySmtpConnection(): Promise<boolean> {
  const client = getTransporter();
  await client.verify();
  return true;
}
