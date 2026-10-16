// File: app/api/admin/employees/lookup/route.ts
import { type NextRequest, NextResponse } from "next/server";

const laravelUrl =
  process.env.LARAVEL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

// Palitan kung iba ang pangalan ng cookie mo (hal. "auth_token", "access_token")
const TOKEN_COOKIE_NAME = "token";

function buildAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };

  // 1) Bearer token galing sa incoming Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  } else {
    // 2) Bearer token na nakatago sa cookie
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // 3) Sanctum SPA (cookie-based session)
  const cookie = request.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;

  const xsrf = request.cookies.get("XSRF-TOKEN")?.value;
  if (xsrf) headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);

  headers["Referer"] = request.headers.get("referer") ?? request.nextUrl.origin;

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const idNumber = request.nextUrl.searchParams.get("id_number");

    if (!idNumber) {
      return NextResponse.json(
        { success: false, message: "id_number is required" },
        { status: 400 },
      );
    }

    const url = new URL(`${laravelUrl}/api/admin/employees/lookup`);
    url.searchParams.set("id_number", idNumber);

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders(request),
      cache: "no-store",
    });

    const text = await response.text();

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error(
        "❌ Laravel returned HTML error page for employees/lookup GET",
        response.status,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Laravel backend error",
          hint: "Check: 1) Is Laravel running? 2) Database connected? 3) Check storage/logs/laravel.log",
        },
        { status: 500 },
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON response from Laravel",
          error: text.substring(0, 200),
        },
        { status: 500 },
      );
    }

    if (response.status === 401) {
      console.warn(
        "⚠️ Laravel returned 401 for employees/lookup. Auth not forwarded or token expired.",
      );
    }

    // 404 (employee not found) is expected while typing, pass through as-is.
    // 401 is also passed through so the client can redirect to login.
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employees/lookup GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend",
        error: error instanceof Error ? error.message : String(error),
        hint: "Is Laravel running? Check LARAVEL_API_URL in .env.local",
      },
      { status: 500 },
    );
  }
}
