// 📁 Place this file at: lib/publicPortalDemoApi.ts
import { PortalDemoTheme } from "@/lib/portalDemoApi";

export interface PublicPortalDemoRole {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

export interface PublicPortalDemo {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  best_suited_for: string | null;
  core_operating_areas: string[];
  example_workflow: string[];
  image_url: string | null;
  roles_count: number;
  theme_configuration: PortalDemoTheme;
  roles?: PublicPortalDemoRole[];
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Unexpected response from server.");
  }
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message || "Request failed.";
    throw new Error(message);
  }
  return data as T;
}

export async function fetchPublicPortalDemos(): Promise<PublicPortalDemo[]> {
  const res = await fetch(`/api/portal-demos`, {
    headers: { Accept: "application/json" },
  });
  const data = await handle<{ data: PublicPortalDemo[] }>(res);
  return data.data;
}

export async function fetchPublicPortalDemo(
  slug: string,
): Promise<PublicPortalDemo> {
  const res = await fetch(`/api/portal-demos/${slug}`, {
    headers: { Accept: "application/json" },
  });
  return handle<PublicPortalDemo>(res);
}
