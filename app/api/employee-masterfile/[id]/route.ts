// File: app/api/employee-masterfile/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${params.id}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employee-masterfile/:id GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employee-masterfile/:id PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${params.id}`,
      {
        method: "DELETE",
        headers: { Accept: "application/json" },
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ employee-masterfile/:id DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reach backend" },
      { status: 500 },
    );
  }
}
