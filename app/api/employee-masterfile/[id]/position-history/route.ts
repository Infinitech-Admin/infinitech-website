import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      `${laravelUrl}/api/employee-masterfile/${id}/position-history`,
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
    console.error("❌ employee position history GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}
