import { type NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

type RouteContext = { params: Promise<{ id: string }> };

async function forward(
  request: NextRequest,
  employeeId: string,
  method: "GET" | "POST",
) {
  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { success: false, message: "Employee service is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${employeeId}/id-issuances`,
      {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${serviceToken}`,
          ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        ...(method === "POST"
          ? { body: JSON.stringify(await request.json()) }
          : {}),
        cache: "no-store",
      },
    );

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error(`Employee ID issuance ${method} proxy failed:`, error);

    return NextResponse.json(
      { success: false, message: "Unable to reach the employee service." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { success: false, message: "Employee not found." },
      { status: 404 },
    );
  }

  return forward(request, id, "GET");
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { success: false, message: "Employee not found." },
      { status: 404 },
    );
  }

  return forward(request, id, "POST");
}
