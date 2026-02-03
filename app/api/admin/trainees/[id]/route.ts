import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000/api";

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// DELETE - Remove a trainee (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getAuthToken(request);
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const traineeId = params.id;
    
    const response = await fetch(`${LARAVEL_API_URL}/api/admin/trainees/${traineeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (response.status === 404) {
      return NextResponse.json(
        { success: false, error: "Trainee not found" },
        { status: 404 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || "Failed to delete trainee" },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: data.message || "Trainee removed successfully",
    });
  } catch (error) {
    console.error("Error deleting trainee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete trainee" },
      { status: 500 }
    );
  }
}
