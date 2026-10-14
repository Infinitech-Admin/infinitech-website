import { NextRequest, NextResponse } from "next/server";
import { laravelServiceHeaders } from "@/lib/laravel-service-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const API_URL =
  process.env.LARAVEL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

async function forward(
  request: NextRequest,
  { params }: RouteContext,
  method: "PATCH" | "DELETE",
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_URL}/api/website-inquiries/${id}`, {
      method,
      headers: {
        ...laravelServiceHeaders(),
        Accept: "application/json",
        ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "PATCH"
        ? { body: JSON.stringify(await request.json()) }
        : {}),
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Website inquiry ${method} proxy failed:`, error);
    return NextResponse.json(
      { message: "Unable to process website inquiry request." },
      { status: 500 },
    );
  }
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PATCH");
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return forward(request, context, "DELETE");
}
