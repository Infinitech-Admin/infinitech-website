import { NextRequest, NextResponse } from "next/server";

// POST - Time In
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, time_in } = body;

    if (!full_name || !time_in) {
      return NextResponse.json(
        { success: false, message: "Full name and time in are required" },
        { status: 400 }
      );
    }

    // Replace with your Laravel backend URL
    const response = await fetch(
      `${process.env.LARAVEL_API_URL}/api/attendance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ full_name, time_in }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to save time in" },
      { status: 500 }
    );
  }
}

// PUT - Time Out
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, time_out } = body;

    if (!full_name || !time_out) {
      return NextResponse.json(
        { success: false, message: "Full name and time out are required" },
        { status: 400 }
      );
    }

    // Replace with your Laravel backend URL
    const response = await fetch(
      `${process.env.LARAVEL_API_URL}/api/attendance`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ full_name, time_out }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to save time out" },
      { status: 500 }
    );
  }
}
