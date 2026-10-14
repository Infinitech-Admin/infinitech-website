import { type NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { proxyFormData } from "@/lib/laravelProxy";

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { message: "Upload service is not configured." },
      { status: 500 },
    );
  }

  const formData = await request.formData();

  return proxyFormData({
    path: "/api/uploads/image",
    formData,
    serviceToken,
  });
}
