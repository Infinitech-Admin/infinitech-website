// 📁 Place this file at: lib/portalDemoPublicApi.ts
//
// Public (no-auth) reads for the visitor-facing demo browser. Adjust
// API_BASE / endpoints to match whatever base client portalDemoApi.ts
// already uses in this project — this file intentionally has no
// dependency on the admin auth token.

import type {
  PortalDemoRecord,
  PortalDemoRoleRecord,
} from "@/lib/portalDemoApi";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export type PublicPortalDemo = PortalDemoRecord & {
  roles: PortalDemoRoleRecord[];
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

/** List only active portal demos, for the public browse grid. */
export async function fetchPublicPortalDemos(): Promise<PortalDemoRecord[]> {
  const res = await fetch(`${API_BASE}/portal-demos?status=active`, {
    cache: "no-store",
  });
  const data = await handle<{ data: PortalDemoRecord[] } | PortalDemoRecord[]>(
    res,
  );
  return Array.isArray(data) ? data : data.data;
}

/** Full demo detail (incl. active roles + their sidebar menus) by slug. */
export async function fetchPublicPortalDemoBySlug(
  slug: string,
): Promise<PublicPortalDemo> {
  const res = await fetch(`${API_BASE}/portal-demos/${slug}`, {
    cache: "no-store",
  });
  return handle<PublicPortalDemo>(res);
}
