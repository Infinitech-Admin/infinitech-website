import { type NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

type RouteContext = { params: Promise<{ segments?: string[] }> };

async function forward(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "POST" | "PUT",
) {
  const authError = requireAdminAuth(request);

  if (authError) {
    console.log("[websites] blocked by requireAdminAuth");
    return authError;
  }

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { message: "Website directory service is not configured." },
      { status: 500 },
    );
  }

  const { segments = [] } = await context.params;
  const path = segments.map(encodeURIComponent).join("/");
  const target = new URL(
    `${laravelUrl}/api/admin/websites${path ? `/${path}` : ""}`,
  );

  request.nextUrl.searchParams.forEach((value, key) =>
    target.searchParams.set(key, value),
  );

  try {
    const hasBody = method !== "GET";
    const response = await fetch(target, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${serviceToken}`,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? JSON.stringify(await request.json()) : undefined,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      console.error(
        `Website API returned a non-JSON response (${response.status}).`,
      );

      return NextResponse.json(
        { message: "Unexpected response from the website service." },
        { status: 502 },
      );
    }

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error(`Website API ${method} request failed:`, error);

    return NextResponse.json(
      { message: "Unable to reach the website service." },
      { status: 502 },
    );
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return forward(request, context, "GET");
}

export function POST(request: NextRequest, context: RouteContext) {
  return forward(request, context, "POST");
}

export function PUT(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PUT");
}