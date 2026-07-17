// 📁 Place this file at: app/api/send-social-media-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendSocialMediaEmail } from "@/lib/social-media-mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, message, requestId, requestData } = body ?? {};

    if (!to || !subject || !message) {
      return NextResponse.json(
        { code: 422, message: "to, subject, and message are required." },
        { status: 422 },
      );
    }

    await sendSocialMediaEmail({ to, subject, message, requestData });

    return NextResponse.json(
      {
        code: 200,
        message: "Email sent successfully.",
        requestId: requestId ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send Social Media Email Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email.";

    return NextResponse.json(
      { code: 500, message: `Failed to send email. ${message}` },
      { status: 500 },
    );
  }
}
