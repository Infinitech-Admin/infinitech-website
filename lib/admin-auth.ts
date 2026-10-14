import { NextRequest, NextResponse } from "next/server";

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  if (request.headers.get("x-admin-authorized") !== "true") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}
