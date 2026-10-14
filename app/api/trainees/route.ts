import { NextRequest, NextResponse } from "next/server";
import { laravelServiceHeaders } from "@/lib/laravel-service-auth";

// No trailing /api here. The paths below add it.
const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/api/trainees`, {
      method: "GET",
      headers: {
        ...laravelServiceHeaders(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        "Laravel trainees error:",
        response.status,
        body.slice(0, 300),
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch trainees",
          upstream_status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      trainees: data.trainees || data.data || [],
    });
  } catch (error) {
    console.error("Error fetching trainees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trainees" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const response = await fetch(`${LARAVEL_API_URL}/api/admin/trainees`, {
      method: "POST",
      headers: {
        ...laravelServiceHeaders(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error adding trainee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add trainee" },
      { status: 500 },
    );
  }
}
