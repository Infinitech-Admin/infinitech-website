import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";
const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
type RouteContext = { params: Promise<{ id: string }> };

async function forward(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  }
  return NextResponse.json(
    { success: false, message: "Unexpected response from Laravel." },
    { status: 502 },
  );
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(_request);
  if (authError) return authError;
  try {
    const { id } = await params;
    return forward(
      await fetch(`${laravelUrl}/api/admin/leave-requests/${id}`, {
        headers: {
          Accept: "application/json",
          ...(serviceToken ? { Authorization: `Bearer ${serviceToken}` } : {}),
        },
        cache: "no-store",
      }),
    );
  } catch (error) {
    console.error("Leave details GET failed:", error);
    return NextResponse.json(
      { message: "Unable to load leave details." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
  return update(request, params, "PUT");
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
  return update(request, params, "PATCH");
}

async function update(
  request: NextRequest,
  params: Promise<{ id: string }>,
  method: "PUT" | "PATCH",
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const formData = isMultipart ? await request.formData() : null;
    if (formData && method === "PUT") {
      formData.set("_method", "PUT");
    }
    const response = await fetch(
      `${laravelUrl}/api/admin/leave-requests/${id}`,
      {
        method: formData && method === "PUT" ? "POST" : method,
        headers: isMultipart
          ? {
              Accept: "application/json",
              ...(serviceToken
                ? { Authorization: `Bearer ${serviceToken}` }
                : {}),
            }
          : {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(serviceToken
                ? { Authorization: `Bearer ${serviceToken}` }
                : {}),
            },
        body: isMultipart ? formData : JSON.stringify(await request.json()),
      },
    );
    return forward(response);
  } catch (error) {
    console.error("Leave update failed:", error);
    return NextResponse.json(
      { message: "Unable to update the leave request." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(_request);
  if (authError) return authError;
  try {
    const { id } = await params;
    return forward(
      await fetch(`${laravelUrl}/api/admin/leave-requests/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(serviceToken ? { Authorization: `Bearer ${serviceToken}` } : {}),
        },
      }),
    );
  } catch (error) {
    console.error("Leave delete failed:", error);
    return NextResponse.json(
      { message: "Unable to delete the leave request." },
      { status: 500 },
    );
  }
}
