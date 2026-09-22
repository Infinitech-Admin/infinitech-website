// File: app/api/admin/portal-demos/[id]/status/route.ts

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

// PATCH /api/admin/portal-demos/{id}/status — { status: "active" | "inactive" }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return proxyJson({
    method: "PATCH",
    path: `/api/admin/portal-demos/${id}/status`,
    body,
  });
}
