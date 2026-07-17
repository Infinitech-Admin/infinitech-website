import { NextRequest, NextResponse } from "next/server";
import { sendInquiryEmail } from "@/lib/website-audit-mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, message, inquiryId, inquiryData } = body ?? {};

    if (!to || !subject || !message) {
      return NextResponse.json(
        { code: 422, message: "to, subject, and message are required." },
        { status: 422 },
      );
    }

    await sendInquiryEmail({ to, subject, message, inquiryData });

    return NextResponse.json(
      {
        code: 200,
        message: "Email sent successfully.",
        inquiryId: inquiryId ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send Inquiry Email Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email.";

    return NextResponse.json(
      { code: 500, message: `Failed to send email. ${message}` },
      { status: 500 },
    );
  }
}
