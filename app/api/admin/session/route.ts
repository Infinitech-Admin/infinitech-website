import { NextRequest, NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const response = await fetch(`${laravelUrl}/api/admin/session`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json();
  return NextResponse.json(body, {
    status: response.status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value;
  const response = token
    ? await fetch(`${laravelUrl}/api/admin/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
    : null;
  const result = NextResponse.json(
    response && !response.ok ? { message: "Unable to revoke the session." } : { message: "Logged out." },
    {
      status: response && !response.ok ? response.status : 200,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
  result.cookies.delete("adminToken");
  return result;
}
