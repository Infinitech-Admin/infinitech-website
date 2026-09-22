// File: app/api/admin/portal-demos/[id]/roles/[roleId]/route.ts

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

type RouteParams = { params: Promise<{ id: string; roleId: string }> };

// PUT /api/admin/portal-demos/{id}/roles/{roleId}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, roleId } = await params;
  const body = await request.json();
  return proxyJson({
    method: "PUT",
    path: `/api/admin/portal-demos/${id}/roles/${roleId}`,
    body,
  });
}

// DELETE /api/admin/portal-demos/{id}/roles/{roleId}
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, roleId } = await params;
  return proxyJson({
    method: "DELETE",
    path: `/api/admin/portal-demos/${id}/roles/${roleId}`,
  });
}
