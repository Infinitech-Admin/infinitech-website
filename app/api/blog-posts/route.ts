import { NextRequest, NextResponse } from "next/server";

const FIELDS = [
  "title",
  "description",
  "content",
  "thumbnail",
  "images",
  "video_path",
  "category",
  "author",
  "is_published",
  "published_at",
] as const;

function laravelHeaders(req: NextRequest, json = false) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (json) headers["Content-Type"] = "application/json";
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;
  return headers;
}

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    // Forward search / page / per_page / category / is_published
    const qs = req.nextUrl.searchParams.toString();
    const res = await fetch(`${apiUrl}/api/blog-posts${qs ? `?${qs}` : ""}`, {
      headers: laravelHeaders(req),
      cache: "no-store",
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
    console.error("❌ Fetch Blog Posts Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const body = await req.json();

    // Only forward fields Laravel's validator knows about
    const payload: Record<string, unknown> = {};
    for (const key of FIELDS) {
      if (key in body) payload[key] = body[key];
    }

    const res = await fetch(`${apiUrl}/api/blog-posts`, {
      method: "POST",
      headers: laravelHeaders(req, true),
      body: JSON.stringify(payload),
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
        code: 201,
        message: "Blog Post Created Successfully!",
        data: data?.data ?? data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Send Blog Post Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}