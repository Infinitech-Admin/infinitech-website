import { type NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { proxyJson } from "@/lib/laravelProxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { message: "Blog service is not configured." },
      { status: 500 },
    );
  }

  const { id } = await params;
  const body = await request.json();

  return proxyJson({
    method: "PUT",
    path: `/api/blog-posts/${id}`,
    body,
    serviceToken,
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { message: "Blog service is not configured." },
      { status: 500 },
    );
  }

  const { id } = await params;

  return proxyJson({
    method: "DELETE",
    path: `/api/blog-posts/${id}`,
    serviceToken,
  });
}
