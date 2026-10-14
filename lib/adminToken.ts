// lib/adminToken.ts
// Token for calls to Laravel: the Authorization header if present,
// otherwise the "adminToken" cookie (same one app/api/admin/session uses).
import type { NextRequest } from "next/server";

export function getAdminToken(request: NextRequest): string | undefined {
  const fromHeader = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  return fromHeader || request.cookies.get("adminToken")?.value || undefined;
}
