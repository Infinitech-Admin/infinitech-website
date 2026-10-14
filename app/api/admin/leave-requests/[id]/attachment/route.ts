import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";
const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdminAuth(_request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const response = await fetch(
      `${laravelUrl}/api/admin/leave-requests/${id}/attachment`,
      {
        headers: serviceToken
          ? { Authorization: `Bearer ${serviceToken}` }
          : {},
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        { message: "Attachment not found." },
        { status: response.status },
      );
    }
    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition":
          response.headers.get("content-disposition") || "attachment",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Leave attachment GET failed:", error);
    return NextResponse.json(
      { message: "Unable to download attachment." },
      { status: 500 },
    );
  }
}
