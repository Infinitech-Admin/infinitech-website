// File: lib/laravelProxy.ts
//
// Shared helper for the app/api/admin/portal-demos/** proxy routes. Same
// pattern as app/api/admin/coe/[id]/download/route.ts: forward to Laravel,
// detect an HTML error page (Laravel down / crashed), parse JSON, relay the
// status code and body back to the browser.

import { NextResponse } from "next/server";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

interface ProxyJsonOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string; // e.g. "/api/admin/portal-demos/12/roles"
  query?: URLSearchParams;
  body?: unknown; // JSON-serializable; omit for GET/DELETE with no body
  serviceToken?: string;
}

export async function proxyJson({
  method,
  path,
  query,
  body,
  serviceToken,
}: ProxyJsonOptions): Promise<NextResponse> {
  const qs = query && query.toString() ? `?${query.toString()}` : "";
  const url = `${laravelUrl}${path}${qs}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(serviceToken
          ? { Authorization: `Bearer ${serviceToken}` }
          : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    return relayJsonResponse(response, `${method} ${path}`);
  } catch (error) {
    return connectionError(error, `${method} ${path}`);
  }
}

// Separate from proxyJson because file uploads can't be JSON.stringify'd —
// the FormData (with the File inside) is forwarded to Laravel as-is.
export async function proxyFormData({
  path,
  formData,
  serviceToken,
}: {
  path: string;
  formData: FormData;
  serviceToken?: string;
}): Promise<NextResponse> {
  const url = `${laravelUrl}${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(serviceToken ? { Authorization: `Bearer ${serviceToken}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });

    return relayJsonResponse(response, `POST ${path}`);
  } catch (error) {
    return connectionError(error, `POST ${path}`);
  }
}

async function relayJsonResponse(
  response: Response,
  label: string,
): Promise<NextResponse> {
  const text = await response.text();

  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    console.error(`❌ Laravel returned an HTML error page for ${label}`);
    return NextResponse.json(
      {
        success: false,
        message: "Laravel backend error",
        hint: "Check: 1) Is Laravel running? 2) Database connected? 3) Check storage/logs/laravel.log",
      },
      { status: 500 },
    );
  }

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON response from Laravel",
        error: text.substring(0, 200),
      },
      { status: 500 },
    );
  }

  return NextResponse.json(data as object, { status: response.status });
}

function connectionError(error: unknown, label: string): NextResponse {
  console.error(`❌ Laravel proxy error [${label}]:`, error);
  return NextResponse.json(
    {
      success: false,
      message: "Failed to reach Laravel backend",
      error: error instanceof Error ? error.message : String(error),
      hint: "Is Laravel running? Check LARAVEL_API_URL in .env.local",
    },
    { status: 500 },
  );
}
