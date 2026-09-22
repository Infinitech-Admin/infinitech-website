// File: app/api/portal-demos/[slug]/route.ts
//
// Public single-demo fetch, keyed by slug (not id) since that's what the
// visitor-facing URL (/portal-demos/{slug}) has. Returns the demo with its
// active roles (and each role's sidebar_menu) nested in one response.

import { type NextRequest } from "next/server";
import { proxyJson } from "@/lib/laravelProxy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyJson({
    method: "GET",
    path: `/api/portal-demos/${encodeURIComponent(slug)}`,
  });
}
