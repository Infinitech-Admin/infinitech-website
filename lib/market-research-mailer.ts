// 📁 Place this file at: lib/market-research-mailer.ts
import {
  getTransporter,
  getFromAddress,
  getTeamReceivers,
  toHtmlEmail,
} from "./mailer-core";

export interface MarketResearchRequestData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  details?: string | null;
  created_at: string;
}

export interface SendMarketResearchEmailParams {
  to: string;
  subject: string;
  message: string;
  requestData?: MarketResearchRequestData;
}

/**
 * Sends a reply email to the person who requested a market research report.
 */
export async function sendMarketResearchEmail({
  to,
  subject,
  message,
}: SendMarketResearchEmailParams): Promise<void> {
  const client = getTransporter();

  await client.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text: message,
    html: toHtmlEmail("Market Research Report Requests", message),
  });
}

/**
 * Notifies the internal team (SMTP_RECEIVER) whenever a new market research
 * report request comes in.
 */
export async function notifyTeamOfNewMarketResearchRequest(
  request: MarketResearchRequestData,
): Promise<void> {
  const receivers = getTeamReceivers();
  if (receivers.length === 0) return; // no-op if not configured

  const client = getTransporter();

  const message = `New market research report request received.

Name: ${request.name}
Email: ${request.email}
Phone: ${request.phone || "N/A"}
Company: ${request.company || "N/A"}
Research Focus: ${request.details || "N/A"}
Submitted: ${new Date(request.created_at).toLocaleString()}`;

  await client.sendMail({
    from: getFromAddress(),
    to: receivers,
    subject: `New Market Research Request - ${request.company || request.name}`,
    text: message,
    html: toHtmlEmail("New Market Research Request", message),
  });
}
