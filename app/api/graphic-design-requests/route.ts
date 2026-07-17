// 📁 Place this file at: app/api/graphic-design-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { notifyTeamOfNewGraphicDesignRequest } from "@/lib/graphic-design-mailer";

export async function GET() {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/graphic-design-requests`, {
      headers: { Accept: "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { code: res.status, message: data.message || "Something Went Wrong" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Graphic Design Requests Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { name, email, phone, businessName, designCategories, details } =
    await req.json();

  console.log("📩 New Graphic Design Request Received:", {
    name,
    email,
    phone,
    businessName,
    designCategories,
    details,
  });

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/graphic-design-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        businessName,
        designCategories,
        details,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Laravel API Error:", data);
      return NextResponse.json(
        {
          code: res.status,
          message: data.message || "Something Went Wrong",
          errors: data.errors ?? null,
        },
        { status: res.status },
      );
    }

    console.log("✅ Graphic design request forwarded to Laravel successfully!");

    // Fire-and-forget team notification — must never fail the submission itself.
    const record = data?.data ?? data;
    notifyTeamOfNewGraphicDesignRequest({
      id: record?.id,
      name,
      email,
      phone,
      businessName,
      designCategories,
      details,
      created_at: record?.created_at ?? new Date().toISOString(),
    }).catch((emailError) => {
      console.error("⚠️ Failed to send team notification email:", emailError);
    });

    return NextResponse.json(
      { code: 200, message: "Request Sent Successfully!", data: record },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send Graphic Design Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}
