import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000";

// GET - Fetch all trainees (No auth)
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/api/admin/trainees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch trainees");
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

// POST - Add new trainee (No auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${LARAVEL_API_URL}/api/admin/trainees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || "Failed to add trainee" },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: data.message || "Trainee added successfully",
      trainee: data.trainee || data.data,
    });
  } catch (error) {
    console.error("Error adding trainee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add trainee" },
      { status: 500 }
    );
  }
}
