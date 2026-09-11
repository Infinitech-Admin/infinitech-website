// components/portal-demo/types.ts
export type PortalIconKey =
  | "briefcase"
  | "chart"
  | "cart"
  | "wrench"
  | "calendar"
  | "users"
  | "megaphone";

export interface DepartmentSnapshot {
  label: string;
  value: string;
  helper: string;
  icon: PortalIconKey;
}

export interface PortalRole {
  id: string;
  name: string;
  blurb: string;
  /** Nav items this role is allowed to see, keyed against DASHBOARD_NAV ids */
  visibleNav?: string[];
}

export interface PortalStat {
  label: string;
  value: string;
  helper: string;
}

export interface PortalQueueRow {
  name: string;
  subject: string;
  status: string;
  statusTone: "default" | "warning" | "success" | "primary";
  progress: number;
}

export interface PortalTask {
  title: string;
  meta: string;
  done?: boolean;
}

export interface Portal {
  id: string;
  index: string;
  categoryLabel: string;
  icon: PortalIconKey;
  accent: string; // tailwind gradient "from-* to-*" or hex used inline
  title: string;
  description: string;
  bestSuitedFor: string;
  coreOperatingAreas: string[];
  exampleWorkflow: string[];
  roles: PortalRole[];
  stats: PortalStat[];
  departmentSnapshots: DepartmentSnapshot[];
  queue: PortalQueueRow[];
  tasks: PortalTask[];
  heroHeadline: string;
  heroBody: string;
  focusItems: { label: string; helper: string; value: string }[];
}
