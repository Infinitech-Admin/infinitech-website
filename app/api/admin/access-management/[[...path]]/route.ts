import { NextRequest, NextResponse } from "next/server";
import { getAdminDirectoryEntries } from "@/lib/admin-navigation";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

async function forward(request: NextRequest, path: string[]) {
  const token = request.cookies.get("adminToken")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const backendUrl = new URL(
    `/api/admin/access-management/${path.map(encodeURIComponent).join("/")}`,
    laravelUrl,
  );
  backendUrl.search = request.nextUrl.search;

  if (
    request.method === "GET" &&
    path.length === 1 &&
    path[0] === "directories"
  ) {
    const syncResponse = await fetch(
      new URL(`${backendUrl.pathname}/sync`, laravelUrl),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ directories: getAdminDirectoryEntries() }),
        cache: "no-store",
      },
    );
    if (!syncResponse.ok) {
      return new NextResponse(await syncResponse.text(), {
        status: syncResponse.status,
        headers: {
          "Content-Type":
            syncResponse.headers.get("content-type") || "application/json",
          "Cache-Control": "private, no-store",
        },
      });
    }
  }

  const response = await fetch(backendUrl, {
    method: request.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(request.headers.get("content-type")
        ? { "Content-Type": request.headers.get("content-type")! }
        : {}),
    },
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.text(),
    cache: "no-store",
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path || []);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path || []);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path || []);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path || []);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path || []);
}
