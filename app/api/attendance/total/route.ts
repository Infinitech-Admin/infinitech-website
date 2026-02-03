import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name parameter required" },
        { status: 400 }
      );
    }

    const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

    const response = await fetch(
      `${laravelUrl}/api/attendance/total?name=${encodeURIComponent(name)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch total hours");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching total hours:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch total hours" },
      { status: 500 }
    );
  }
}
