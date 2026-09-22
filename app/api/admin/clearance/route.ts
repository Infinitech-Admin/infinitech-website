// File: app/api/admin/clearance/route.ts

import { type NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

/**
 * Laravel sometimes answers with an HTML error page (Ignition) instead of
 * JSON. This guard converts that into a clean JSON response.
 */
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
    return NextResponse.json(JSON.parse(text), {
      status: response.status,
    });
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
  console.error(`❌ clearance ${label} error:`, error);

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

/**
 * Pass the admin token through so Laravel can authorize the call.
 */
function authHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get("authorization");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (auth) {
    headers.Authorization = auth;
  }

  return headers;
}

// GET /api/admin/clearance?search=
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search");

    const url = new URL(`${laravelUrl}/api/admin/clearance`);

    if (search) {
      url.searchParams.set("search", search);
    }

    const response = await fetch(url.toString(), {
      headers: authHeaders(request),
      cache: "no-store",
    });

    return forward(response, "clearance GET");
  } catch (error) {
    return failed(error, "GET");
  }
}

// POST /api/admin/clearance
// Body is the ClearancePayload from the wizard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${laravelUrl}/api/admin/clearance`, {
      method: "POST",
      headers: {
        ...authHeaders(request),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return forward(response, "clearance POST");
  } catch (error) {
    return failed(error, "POST");
  }
}
