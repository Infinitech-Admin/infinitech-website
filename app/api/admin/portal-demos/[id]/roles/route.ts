// File: app/api/admin/portal-demos/[id]/roles/route.ts

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/admin/portal-demos/{id}/roles
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyJson({
    method: "GET",
    path: `/api/admin/portal-demos/${id}/roles`,
  });
}

// POST /api/admin/portal-demos/{id}/roles
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  return proxyJson({
    method: "POST",
    path: `/api/admin/portal-demos/${id}/roles`,
    body,
  });
}
