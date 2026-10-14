import type { NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";
import { getAdminToken } from "@/lib/adminToken";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyJson({
    method: "DELETE",
    path: `/api/admin/trainees/${id}`,
    serviceToken: getAdminToken(request),
  });
}
