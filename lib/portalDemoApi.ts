// 📁 Place this file at: lib/portalDemoApi.ts
//
// Typed client for the Portal Demo Management feature.
// Follows the same shape as the existing lib/api.ts helpers (fetchBlogPosts,
// createBlogPost, etc.) but talks to the Next.js proxy routes under
// app/api/admin/portal-demos/*, which in turn forward to the existing
// Laravel API. Adjust the base path below if your existing lib/api.ts
// already exports an API_URL / authFetch helper you'd rather reuse.

export interface PortalDemoTheme {
  primary: string;
  secondary: string;
  accent: string;
  sidebar_bg: string;
  sidebar_text: string;
  sidebar_active: string;
  header_bg: string;
  header_text: string;
  page_bg: string;
  card_bg: string;
  button_bg: string;
  button_text: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

export const DEFAULT_PORTAL_THEME: PortalDemoTheme = {
  primary: "#2563EB",
  secondary: "#1E40AF",
  accent: "#60A5FA",
  sidebar_bg: "#111827",
  sidebar_text: "#FFFFFF",
  sidebar_active: "#2563EB",
  header_bg: "#FFFFFF",
  header_text: "#111827",
  page_bg: "#F8FAFC",
  card_bg: "#FFFFFF",
  button_bg: "#2563EB",
  button_text: "#FFFFFF",
  border: "#E5E7EB",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
};

// Human-readable labels for rendering the theme editor grid.
export const THEME_FIELD_LABELS: {
  key: keyof PortalDemoTheme;
  label: string;
}[] = [
  { key: "primary", label: "Primary Color" },
  { key: "secondary", label: "Secondary Color" },
  { key: "accent", label: "Accent Color" },
  { key: "sidebar_bg", label: "Sidebar Background" },
  { key: "sidebar_text", label: "Sidebar Text" },
  { key: "sidebar_active", label: "Sidebar Active" },
  { key: "header_bg", label: "Header Background" },
  { key: "header_text", label: "Header Text" },
  { key: "page_bg", label: "Page Background" },
  { key: "card_bg", label: "Card Background" },
  { key: "button_bg", label: "Button Background" },
  { key: "button_text", label: "Button Text" },
  { key: "border", label: "Border Color" },
  { key: "success", label: "Success Color" },
  { key: "warning", label: "Warning Color" },
  { key: "danger", label: "Danger Color" },
];

export interface PortalDemoRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  best_suited_for: string | null;
  core_operating_areas: string[];
  example_workflow: string[];
  image: string | null;
  image_url: string | null;
  status: "active" | "inactive";
  role_count: number;
  theme_configuration: PortalDemoTheme;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPortalDemos {
  data: PortalDemoRecord[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface PortalDemoPayload {
  name: string;
  description: string;
  category: string | null;
  best_suited_for: string | null;
  core_operating_areas: string[];
  example_workflow: string[];
  image: string | null;
  status: "active" | "inactive";
  theme_configuration: PortalDemoTheme;
}

// ---------------------------------------------------------------------------
// Page config — this is what tells the PUBLIC demo what to actually render
// when a visitor clicks a sidebar button. Without this, a sidebar item is
// just a label; with it, the item knows whether to show a data table (with
// its own columns + sample rows, ready for Add/Edit/Delete) or a dashboard
// of stat cards.
// ---------------------------------------------------------------------------

export type PageFieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "badge"
  | "select";

// One column in a table page, and one field in its Add/Edit modal.
export interface PageField {
  key: string; // machine key, e.g. "client_name"
  label: string; // display label, e.g. "Client Name"
  type: PageFieldType;
  options?: string[]; // choices, used when type is "badge" or "select"
}

export interface StatCard {
  label: string;
  value: string;
  sublabel?: string;
  icon?: string; // lucide-react icon name
}

export interface TablePageConfig {
  page_type: "table";
  fields: PageField[];
  sample_rows: Record<string, string>[]; // each row keyed by PageField.key
}

export interface DashboardPageConfig {
  page_type: "dashboard";
  stat_cards: StatCard[];
}

export type PageConfig = TablePageConfig | DashboardPageConfig;

// A single clickable sidebar entry inside a role's demo, e.g. "Employees".
export interface SidebarMenuItem {
  name: string;
  icon?: string; // optional lucide-react icon name, e.g. "Users"
  route?: string; // demo page slug this item opens, e.g. "employees"
  page_config?: PageConfig; // what the public demo renders for this button
}

export interface PortalDemoRoleRecord {
  id: number;
  portal_demo_id: number;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  status: "active" | "inactive";
  sidebar_menu: SidebarMenuItem[];
  created_at: string;
  updated_at: string;
}

export interface PortalDemoRolePayload {
  name: string;
  description: string | null;
  status: "active" | "inactive";
  sidebar_menu: SidebarMenuItem[];
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Unexpected response from server: ${text.substring(0, 200)}`,
    );
  }
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function fetchPortalDemos(params: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedPortalDemos> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));

  const res = await fetch(`/api/admin/portal-demos?${qs.toString()}`, {
    headers: { Accept: "application/json" },
  });
  return handle<PaginatedPortalDemos>(res);
}

export async function createPortalDemo(
  payload: PortalDemoPayload,
): Promise<PortalDemoRecord> {
  const res = await fetch(`/api/admin/portal-demos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<PortalDemoRecord>(res);
}

export async function updatePortalDemo(
  id: number,
  payload: PortalDemoPayload,
): Promise<PortalDemoRecord> {
  const res = await fetch(`/api/admin/portal-demos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<PortalDemoRecord>(res);
}

export async function deletePortalDemo(id: number): Promise<void> {
  const res = await fetch(`/api/admin/portal-demos/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  await handle<{ success: boolean }>(res);
}

export async function togglePortalDemoStatus(
  id: number,
  status: "active" | "inactive",
): Promise<PortalDemoRecord> {
  const res = await fetch(`/api/admin/portal-demos/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ status }),
  });
  return handle<PortalDemoRecord>(res);
}

export async function fetchPortalDemo(id: number): Promise<PortalDemoRecord> {
  const res = await fetch(`/api/admin/portal-demos/${id}`, {
    headers: { Accept: "application/json" },
  });
  return handle<PortalDemoRecord>(res);
}

export async function fetchPortalDemoRoles(
  demoId: number,
): Promise<PortalDemoRoleRecord[]> {
  const res = await fetch(`/api/admin/portal-demos/${demoId}/roles`, {
    headers: { Accept: "application/json" },
  });
  return handle<PortalDemoRoleRecord[]>(res);
}

export async function createPortalDemoRole(
  demoId: number,
  payload: PortalDemoRolePayload,
): Promise<PortalDemoRoleRecord> {
  const res = await fetch(`/api/admin/portal-demos/${demoId}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<PortalDemoRoleRecord>(res);
}

export async function updatePortalDemoRole(
  demoId: number,
  roleId: number,
  payload: PortalDemoRolePayload,
): Promise<PortalDemoRoleRecord> {
  const res = await fetch(`/api/admin/portal-demos/${demoId}/roles/${roleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<PortalDemoRoleRecord>(res);
}

export async function deletePortalDemoRole(
  demoId: number,
  roleId: number,
): Promise<void> {
  const res = await fetch(`/api/admin/portal-demos/${demoId}/roles/${roleId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  await handle<{ success: boolean }>(res);
}

export async function reorderPortalDemoRoles(
  demoId: number,
  orderedRoleIds: number[],
): Promise<void> {
  const res = await fetch(`/api/admin/portal-demos/${demoId}/roles/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ order: orderedRoleIds }),
  });
  await handle<{ success: boolean }>(res);
}

export async function uploadPortalDemoImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append("image", file);

  // Plain fetch has no native progress event, so we fake a coarse
  // "uploading" -> "done" transition unless the caller doesn't need it.
  onProgress?.(10);
  const res = await fetch(`/api/admin/portal-demos/upload-image`, {
    method: "POST",
    body: formData,
  });
  onProgress?.(90);
  const data = await handle<{ path: string; url: string }>(res);
  onProgress?.(100);
  return data;
}
