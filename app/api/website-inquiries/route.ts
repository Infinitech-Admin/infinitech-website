import { NextRequest, NextResponse } from "next/server";
import { laravelServiceHeaders } from "@/lib/laravel-service-auth";

const API_URL =
  process.env.LARAVEL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

async function forward(request: NextRequest, method: "GET" | "POST") {
  try {
    const response = await fetch(`${API_URL}/api/website-inquiries`, {
      method,
      headers: {
        ...laravelServiceHeaders(),
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: JSON.stringify(await request.json()) } : {}),
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

export function GET(request: NextRequest) {
  return forward(request, "GET");
}

export function POST(request: NextRequest) {
  return forward(request, "POST");
}
