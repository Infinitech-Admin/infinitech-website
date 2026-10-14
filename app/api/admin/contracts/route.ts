// File: app/api/admin/contracts/route.ts

import type { NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";
import { getAdminToken } from "@/lib/adminToken";

// GET /api/admin/contracts?search=&service=
export async function GET(request: NextRequest) {
  return proxyJson({
    method: "GET",
    path: "/api/admin/contracts",
    query: request.nextUrl.searchParams,
    serviceToken: getAdminToken(request),
  });
}

// POST /api/admin/contracts
// Body: { client_name, service, term, contract_value, start_date, commissions[] }
export async function POST(request: NextRequest) {
  const token = getAdminToken(request);
  console.log("[contracts POST] token?", !!token, token?.slice(0, 6));
  const res = await proxyJson({
    method: "POST",
    path: "/api/admin/contracts",
    body: await request.json().catch(() => undefined),
    serviceToken: token,
  });
  console.log("[contracts POST] laravel status:", res.status);
  return res;
}
