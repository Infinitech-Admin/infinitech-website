// File: app/api/admin/contracts/[id]/route.ts

import type { NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";
import { getAdminToken } from "@/lib/adminToken";

// Next.js 15+: `params` is a Promise. (On Next 14 use `{ params }: { params: { id: string } }` and drop the await.)
type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/contracts/:id
export async function GET(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyJson({
    method: "GET",
    path: `/api/admin/contracts/${encodeURIComponent(id)}`,
    serviceToken: getAdminToken(request),
  });
}

// PUT /api/admin/contracts/:id
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyJson({
    method: "PUT",
    path: `/api/admin/contracts/${encodeURIComponent(id)}`,
    body: await request.json().catch(() => undefined),
    serviceToken: getAdminToken(request),
  });
}

// DELETE /api/admin/contracts/:id
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyJson({
    method: "DELETE",
    path: `/api/admin/contracts/${encodeURIComponent(id)}`,
    serviceToken: getAdminToken(request),
  });
}
