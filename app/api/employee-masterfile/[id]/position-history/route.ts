import { type NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${id}/position-history`,
      {
        headers: {
          Accept: "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
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
