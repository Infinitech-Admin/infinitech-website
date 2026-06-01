// app/api/testimonials/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── GET /api/testimonials?page=home|solutions|both ───────────────────────────
export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") || "home";

    const response = await fetch(`${API_URL}/api/testimonials?page=${page}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Laravel returned ${response.status}`);

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch testimonials", data: [] },
      { status: 500 },
    );
  }
}

// ─── POST /api/testimonials (public submission form) ─────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position, company, message, page } = body;

    // Basic server-side guard
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name and message are required." },
        { status: 422 },
      );
    }

    const response = await fetch(`${API_URL}/api/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        position: position?.trim() || null,
        company: company?.trim() || null,
        message: message.trim(),
        page: page || "solutions",
        // is_active defaults to false so it needs admin approval before showing
        is_active: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit testimonial.",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
