// File: app/api/admin/portal-demos/[id]/route.ts

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/admin/portal-demos/{id}
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyJson({ method: "GET", path: `/api/admin/portal-demos/${id}` });
}

// PUT /api/admin/portal-demos/{id}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  return proxyJson({
    method: "PUT",
    path: `/api/admin/portal-demos/${id}`,
    body,
  });
}

// DELETE /api/admin/portal-demos/{id}
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyJson({
    method: "DELETE",
    path: `/api/admin/portal-demos/${id}`,
  });
}
