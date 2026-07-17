// 📁 Place this file at: lib/social-media-mailer.ts
import {
  getTransporter,
  getFromAddress,
  getTeamReceivers,
  toHtmlEmail,
} from "./mailer-core";

export interface SocialMediaRequestData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  platforms?: string | null;
  details?: string | null;
  created_at: string;
}

export interface SendSocialMediaEmailParams {
  to: string;
  subject: string;
  message: string;
  requestData?: SocialMediaRequestData;
}

/**
 * Sends a reply email to the person who requested social media management.
 */
export async function sendSocialMediaEmail({
  to,
  subject,
  message,
}: SendSocialMediaEmailParams): Promise<void> {
  const client = getTransporter();

  await client.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text: message,
    html: toHtmlEmail("Social Media Management Requests", message),
  });
}

/**
 * Notifies the internal team (SMTP_RECEIVER) whenever a new social media
 * management request comes in.
 */
export async function notifyTeamOfNewSocialMediaRequest(
  request: SocialMediaRequestData,
): Promise<void> {
  const receivers = getTeamReceivers();
  if (receivers.length === 0) return; // no-op if not configured

  const client = getTransporter();

  const message = `New social media management request received.

Name: ${request.name}
Email: ${request.email}
Phone: ${request.phone || "N/A"}
Company: ${request.company || "N/A"}
Platforms: ${request.platforms || "N/A"}
Goals: ${request.details || "N/A"}
Submitted: ${new Date(request.created_at).toLocaleString()}`;

  await client.sendMail({
    from: getFromAddress(),
    to: receivers,
    subject: `New Social Media Management Request - ${request.company || request.name}`,
    text: message,
    html: toHtmlEmail("New Social Media Management Request", message),
  });
}
