// 📁 Place this file at: app/api/blog-posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/blog-posts`, {
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
    console.error("❌ Fetch Blog Posts Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { title, description, content, imageUrl, videoUrl, category, author } =
    await req.json();

  console.log("📩 New Blog Post Received:", {
    title,
    description,
    content,
    imageUrl,
    videoUrl,
    category,
    author,
  });

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/blog-posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        category,
        author,
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

    console.log("✅ Blog post forwarded to Laravel successfully!");

    return NextResponse.json(
      {
        code: 200,
        message: "Blog Post Created Successfully!",
        data: data?.data ?? data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Send Blog Post Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}
