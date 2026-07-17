import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, phone, company, website, details } = await req.json();

  console.log("📩 New Website Inquiry Received:", {
    name,
    email,
    phone,
    company,
    website,
    details,
  });

  try {
    const apiUrl = process.env.LARAVEL_API_URL;

    if (!apiUrl) {
      throw new Error("LARAVEL_API_URL is not configured");
    }

    const res = await fetch(`${apiUrl}/api/website-inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, phone, company, website, details }),
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

    console.log("✅ Website inquiry forwarded to Laravel successfully!");
    return NextResponse.json(
      { code: 200, message: "Inquiry Sent Successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send Website Inquiry Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}
