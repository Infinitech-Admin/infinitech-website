// File: app/api/portal-demos/route.ts
//
// Public counterpart to app/api/admin/portal-demos/route.ts — no auth, and
// it calls Laravel's public /api/portal-demos (PortalDemoPublicController),
// not /api/admin/portal-demos. Only ever returns active demos.

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

// GET /api/portal-demos?search=&category=&page=&per_page=
export async function GET(request: NextRequest) {
  return proxyJson({
    method: "GET",
    path: "/api/portal-demos",
    query: request.nextUrl.searchParams,
  });
}
