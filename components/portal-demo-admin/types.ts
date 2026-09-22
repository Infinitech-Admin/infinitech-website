// 📁 Place this file at: components/portal-demo-admin/types.ts
import type { SidebarMenuItem } from "@/lib/portalDemoApi";

/**
 * A role that only exists in the wizard's local state, not yet saved to the
 * server. Used while creating a BRAND NEW portal demo, so that no database
 * row is created until the whole wizard (including roles) is complete.
 */
export type LocalRole = {
  localId: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  sidebar_menu: SidebarMenuItem[];
};

/**
 * Shape both a locally-staged role and a server-persisted
 * PortalDemoRoleRecord can be normalized into, so the UI components don't
 * need to know which one they're rendering.
 */
export type RoleLike = {
  id: number | string;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  sidebar_menu: SidebarMenuItem[];
};

export type RolePayload = {
  name: string;
  description: string;
  status: "active" | "inactive";
  sidebar_menu: SidebarMenuItem[];
};

/**
 * Abstracts "how roles get added/edited/removed/reordered" so the same
 * StepRoles / RoleEditorPanel UI works for:
 *   - a brand new demo (roles live only in React state, no id yet)
 *   - an existing demo (roles are persisted immediately via the API)
 */
export type RolesController = {
  roles: RoleLike[];
  loading: boolean;
  reordering: boolean;
  add: (payload: RolePayload) => Promise<void> | void;
  update: (id: number | string, payload: RolePayload) => Promise<void> | void;
  remove: (id: number | string) => Promise<void> | void;
  reorder: (orderedIds: (number | string)[]) => Promise<void> | void;
};

export const emptyRolePayload: RolePayload = {
  name: "",
  description: "",
  status: "active",
  sidebar_menu: [],
};
