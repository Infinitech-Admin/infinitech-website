// File: app/api/admin/portal-demos/route.ts

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

// GET /api/admin/portal-demos?search=&page=&per_page= — list, forwarded as-is
export async function GET(request: NextRequest) {
  return proxyJson({
    method: "GET",
    path: "/api/admin/portal-demos",
    query: request.nextUrl.searchParams,
  });
}

// POST /api/admin/portal-demos — create
export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    method: "POST",
    path: "/api/admin/portal-demos",
    body,
  });
}
