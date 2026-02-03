import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000/api";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/api/trainees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch trainees from Laravel API");
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
      { status: 500 }
    );
  }
}
