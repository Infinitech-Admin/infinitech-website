// File: app/api/admin/contract-installments/[id]/route.ts

import type { NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";
import { getAdminToken } from "@/lib/adminToken";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/contract-installments/:id
// Body: { amount_paid, paid_date, remarks }
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyJson({
    method: "PUT",
    path: `/api/admin/contract-installments/${encodeURIComponent(id)}`,
    body: await request.json().catch(() => undefined),
    serviceToken: getAdminToken(request),
  });
}
