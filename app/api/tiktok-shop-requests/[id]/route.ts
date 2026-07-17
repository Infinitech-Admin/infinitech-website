// 📁 Place this file at: app/api/tiktok-shop-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/tiktok-shop-requests/${id}`, {
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
    console.error("❌ Fetch TikTok Shop Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

// Partial update — e.g. changing status ("pending" -> "contacted" -> "approved")
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json();

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/tiktok-shop-requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
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

    return NextResponse.json(
      {
        code: 200,
        message: "Request Updated Successfully!",
        data: data?.data ?? data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Update TikTok Shop Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/tiktok-shop-requests/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { code: res.status, message: data.message || "Something Went Wrong" },
        { status: res.status },
      );
    }

    return NextResponse.json(
      { code: 200, message: "Request Deleted Successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Delete TikTok Shop Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}
