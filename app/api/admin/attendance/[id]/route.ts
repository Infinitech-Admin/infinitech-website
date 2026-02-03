import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

    const response = await fetch(`${laravelUrl}/api/admin/attendance/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Delete Attendance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete attendance record",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
