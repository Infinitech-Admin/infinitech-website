// File: app/api/admin/employees/lookup/route.ts
import { type NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  console.log(
    "🔥 HIT: /api/admin/employees/lookup",
    request.nextUrl.searchParams.get("id_number"),
  );

  try {
    const idNumber = request.nextUrl.searchParams.get("id_number");

    if (!idNumber) {
      return NextResponse.json(
        { success: false, message: "id_number is required" },
        { status: 400 },
      );
    }

    const url = new URL(`${laravelUrl}/api/admin/employees/lookup`);
    url.searchParams.set("id_number", idNumber);

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await response.text();

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error(
        "❌ Laravel returned HTML error page for employees/lookup GET",
      );
      return NextResponse.json(
        {
          success: false,
          message: "Laravel backend error",
          hint: "Check: 1) Is Laravel running? 2) Database connected? 3) Check storage/logs/laravel.log",
        },
        { status: 500 },
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON response from Laravel",
          error: text.substring(0, 200),
        },
        { status: 500 },
      );
    }

    // 404 (employee not found) is expected while typing — pass it through as-is.
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employees/lookup GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend",
        error: error instanceof Error ? error.message : String(error),
        hint: "Is Laravel running? Check LARAVEL_API_URL in .env.local",
      },
      { status: 500 },
    );
  }
}
