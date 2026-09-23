// File: lib/admin-auth.ts
//
// Gate for our own Next.js admin API routes. The login route
// (app/api/admin/login/route.ts) issues an opaque random token — it has no
// meaning to Laravel, and there's no session store to look it up against.
// It's an httpOnly cookie set by our own server after a correct password
// check, so its mere presence (cookie OR the Bearer header the client also
// stores from the login response) is what we treat as "logged in".
//
// This is intentionally lightweight to match the current single-shared-
// password admin login. If you add per-admin accounts later, swap this for
// a real session/JWT check.

import { NextRequest, NextResponse } from "next/server";

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const cookieToken = request.cookies.get("adminToken")?.value;
  const headerToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null; // authenticated, continue
}
