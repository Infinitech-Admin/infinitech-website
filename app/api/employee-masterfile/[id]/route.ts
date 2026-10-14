// File: app/api/employee-masterfile/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
  if (!serviceToken) {
    return NextResponse.json(
      { success: false, message: "Employee service is not configured." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${id}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${serviceToken}`,
        },
        cache: "no-store",
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employee-masterfile/:id GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
  if (!serviceToken) {
    return NextResponse.json(
      { success: false, message: "Employee service is not configured." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") ?? "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();

    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${id}`,
      {
        method: isMultipart ? "POST" : "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${serviceToken}`,
          ...(!isMultipart ? { "Content-Type": "application/json" } : {}),
        },
        body: isMultipart ? body : JSON.stringify(body),
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employee-masterfile/:id PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return PUT(request, context);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
  if (!serviceToken) {
    return NextResponse.json(
      { success: false, message: "Employee service is not configured." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${serviceToken}`,
        },
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employee-masterfile/:id DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}
