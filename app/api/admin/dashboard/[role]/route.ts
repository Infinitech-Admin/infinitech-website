// app/api/admin/dashboard/[role]/route.ts
import { NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ role: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get("adminToken")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { role } = await params;
  const backendUrl = new URL(
    `/api/admin/dashboard/${encodeURIComponent(role)}`,
    laravelUrl,
  );

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Backend unreachable." },
      { status: 502 },
    );
  }
}
