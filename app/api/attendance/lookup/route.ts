import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ record: null });
  }

  try {
    // Replace with your Laravel backend URL
    const response = await fetch(
      `${process.env.LARAVEL_API_URL}/api/attendance/lookup?name=${encodeURIComponent(name)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { record: null, error: "Failed to fetch attendance record" },
      { status: 500 }
    );
  }
}
