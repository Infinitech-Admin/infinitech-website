// File: app/api/video-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

// Streams a video from the Laravel backend through our own origin, so the
// browser can read it (fetch / <video> + canvas) without hitting CORS.
// Only allow proxying videos that actually live on our own API host --
// don't turn this into an open proxy for arbitrary URLs.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const allowedHost = new URL(API_URL).host;
  if (target.host !== allowedHost) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  const upstream = await fetch(target.toString());
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `Upstream fetch failed: ${upstream.status}` },
      { status: 502 },
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
