// 📁 Place this file at: app/api/send-graphic-design-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendGraphicDesignEmail } from "@/lib/graphic-design-mailer";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message, requestId } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { code: 400, message: "Missing required fields: to, subject, message" },
        { status: 400 },
      );
    }

    await sendGraphicDesignEmail({ to, subject, message });

    console.log(
      `✅ Email sent to ${to} for graphic design request #${requestId ?? "-"}`,
    );

    return NextResponse.json(
      { code: 200, message: "Email sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send Graphic Design Email Error:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to send email. Check SMTP configuration." },
      { status: 500 },
    );
  }
}
