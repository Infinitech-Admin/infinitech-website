// File: app/api/admin/employee-clearance/next-number/route.ts
//
// GET -> proxies to Laravel to preview the next certificate number
// (e.g. "CL - 0056") so the admin dialog can display it before Generate
// is clicked. Read-only, does not reserve anything.

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL;
// Shared secret between THIS Next.js server and Laravel — see the download
// route for why this isn't the admin's adminToken.
const LARAVEL_SERVICE_TOKEN = process.env.LARAVEL_SERVICE_TOKEN;

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  if (!LARAVEL_API_URL) {
    return NextResponse.json(
      { message: "LARAVEL_API_URL is not configured" },
      { status: 500 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${LARAVEL_API_URL}/api/employee-clearance/next-number`,
      {
        headers: {
          Accept: "application/json",
          ...(LARAVEL_SERVICE_TOKEN
            ? { Authorization: `Bearer ${LARAVEL_SERVICE_TOKEN}` }
            : {}),
        },
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Could not reach the clearance certificate service" },
      { status: 502 },
    );
  }

  const payload = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? { message: "Failed to look up the next certificate number" },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload);
}
