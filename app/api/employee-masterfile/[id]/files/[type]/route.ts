import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const { id, type } = await params;
  if (!/^\d+$/.test(id) || !["profile-image", "signature"].includes(type)) {
    return NextResponse.json(
      { message: "Employee image not found." },
      { status: 404 },
    );
  }

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
  if (!serviceToken) {
    return NextResponse.json(
      { message: "Employee service is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${id}/files/${type}`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: response.status === 404 ? "Employee image not found." : "Unable to load employee image." },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return NextResponse.json(
        { message: "Employee image has an unsupported format." },
        { status: 415 },
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Employee image proxy failed:", error);
    return NextResponse.json(
      { message: "Unable to load employee image." },
      { status: 500 },
    );
  }
}
