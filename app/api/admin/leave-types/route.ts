import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const apiUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";
  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  try {
    const response = await fetch(`${apiUrl}/api/admin/leave-types`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(serviceToken ? { Authorization: `Bearer ${serviceToken}` } : {}),
      },
      body: JSON.stringify(await request.json()),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Leave type POST failed:", error);
    return NextResponse.json(
      { message: "Unable to save the leave type." },
      { status: 500 },
    );
  }
}
