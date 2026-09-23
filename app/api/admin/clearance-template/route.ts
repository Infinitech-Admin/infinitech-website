// File: app/api/admin/clearance-template/route.ts

import { type NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

async function forward(response: Response, label: string) {
  const text = await response.text();

  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    console.error(`❌ Laravel returned HTML error page for ${label}`);
    return NextResponse.json(
      {
        success: false,
        message: "Laravel backend error",
        hint: "Check: 1) Is Laravel running? 2) Database connected? 3) Check storage/logs/laravel.log",
      },
      { status: 500 },
    );
  }

  try {
    return NextResponse.json(JSON.parse(text), { status: response.status });
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
}

function failed(error: unknown, label: string) {
  console.error(`❌ clearance-template ${label} error:`, error);
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

function authHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get("authorization");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth) headers.Authorization = auth;
  return headers;
}

// GET /api/admin/clearance-template
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${laravelUrl}/api/admin/clearance-template`, {
      headers: authHeaders(request),
      cache: "no-store",
    });
    return forward(response, "clearance-template GET");
  } catch (error) {
    return failed(error, "GET");
  }
}

// PUT /api/admin/clearance-template
// Body: { units: {unit, items}[], properties: {item}[] }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${laravelUrl}/api/admin/clearance-template`, {
      method: "PUT",
      headers: {
        ...authHeaders(request),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return forward(response, "clearance-template PUT");
  } catch (error) {
    return failed(error, "PUT");
  }
}
