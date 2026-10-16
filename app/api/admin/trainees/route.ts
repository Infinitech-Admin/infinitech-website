import { NextRequest, NextResponse } from "next/server";
import { laravelServiceHeaders } from "@/lib/laravel-service-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${laravelUrl}/api/admin/trainees`, {
      headers: {
        ...laravelServiceHeaders(),
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
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
    const body = await request.json();

    const response = await fetch(`${laravelUrl}/api/admin/trainees`, {
      method: "POST",
      headers: {
        ...laravelServiceHeaders(),
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
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
