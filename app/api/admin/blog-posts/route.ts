import { type NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { proxyJson } from "@/lib/laravelProxy";

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { message: "Blog service is not configured." },
      { status: 500 },
    );
  }

  const body = await request.json();

  return proxyJson({
    method: "POST",
    path: "/api/blog-posts",
    body,
    serviceToken,
  });
}
