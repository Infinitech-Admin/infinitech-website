// 📁 Place this file at: components/portal-demo-admin/formState.ts
import { DEFAULT_PORTAL_THEME, PortalDemoTheme } from "@/lib/portalDemoApi";
import type { LocalRole } from "./types";

export type FormState = {
  id: number | null;
  name: string;
  description: string;
  category: string;
  best_suited_for: string;
  core_operating_areas: string[];
  example_workflow: string[];
  image: string | null;
  image_url: string | null;
  status: "active" | "inactive";
  theme_configuration: PortalDemoTheme;
  // Only used while the demo doesn't have an id yet (brand-new demo).
  // Once the demo + roles are created together at the end of the wizard,
  // this is cleared and the server-backed roles list takes over.
  localRoles: LocalRole[];
};

export const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
  category: "",
  best_suited_for: "",
  core_operating_areas: [],
  example_workflow: [],
  image: null,
  image_url: null,
  status: "active",
  theme_configuration: DEFAULT_PORTAL_THEME,
  localRoles: [],
};

export const STEPS: { id: number; label: string }[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Card Content" },
  { id: 3, label: "Appearance" },
  { id: 4, label: "Roles & Sidebar" },
];

let localRoleCounter = 0;
export const makeLocalId = () => `local-${Date.now()}-${localRoleCounter++}`;
