// File: app/api/admin/contracts/[id]/payments/route.ts

import type { NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";
import { getAdminToken } from "@/lib/adminToken";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/contracts/:id/payments
// Body: { amount, date_received, remarks? }
export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyJson({
    method: "POST",
    path: `/api/admin/contracts/${encodeURIComponent(id)}/payments`,
    body: await request.json().catch(() => undefined),
    serviceToken: getAdminToken(request),
  });
}
