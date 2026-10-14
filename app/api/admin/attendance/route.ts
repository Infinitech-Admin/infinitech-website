import { NextRequest, NextResponse } from "next/server";
import { laravelServiceHeaders } from "@/lib/laravel-service-auth";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${LARAVEL_API_URL}/api/admin/attendance${request.nextUrl.search}`,
      {
        headers: {
          ...laravelServiceHeaders(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Attendance proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to connect to Laravel backend" },
      { status: 500 },
    );
  }
}
