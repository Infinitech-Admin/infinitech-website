// File: app/api/admin/contract-commissions/[id]/route.ts

import type { NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";
import { getAdminToken } from "@/lib/adminToken";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/contract-commissions/:id
// Body: { release_date: "YYYY-MM-DD" | null }
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyJson({
    method: "PUT",
    path: `/api/admin/contract-commissions/${encodeURIComponent(id)}`,
    body: await request.json().catch(() => undefined),
    serviceToken: getAdminToken(request),
  });
}
