// File: components/admin/clearance-types.ts
//
// Pure TypeScript (no React, no Node APIs) so it can be imported by the
// client form, the API route, and the docx/pdf builders alike.
//
// Section A  -> auto-filled from the masterfile record (not editable here)
// Section B  -> CRUD: Responsible Unit + Clearance Items to Verify
//               (Status / Remarks / Verified By stay fixed in the template)
// Section C  -> CRUD: Item / Account / Property
//               (the other 3 columns stay blank for handwriting)
// Sections D, E, F -> fixed text from the template
//
// Company (Infinitech / ABIC) is picked per-certificate, the same way the
// COE does it — see coe-types.ts's CompanyKey. It only decides which
// letterhead the generated file uses; it is never sent to Laravel or saved
// on the clearance record.

import { type CompanyKey, COMPANY_OPTIONS } from "@/components/admin/coe-types";

export type { CompanyKey };
export { COMPANY_OPTIONS };

// ── Form / payload shapes ──────────────────────────────────────────────

export interface ClearanceEmployeeInfo {
  employee_id: number; // masterfile row id (handy for Laravel later)
  employee_name: string;
  id_number: string;
  position: string;
  department: string;
}

/** Section B row. `items` is ONE string, entries separated by ";" */
export interface ClearanceUnitRow {
  id: string; // client-side key only
  unit: string;
  items: string;
}

/** Section C row */
export interface ClearancePropertyRow {
  id: string;
  item: string;
}

export interface ClearanceFormData {
  units: ClearanceUnitRow[];
  properties: ClearancePropertyRow[];
  /** Which employer's letterhead this clearance is generated under. */
  company: CompanyKey;
}

/** What the client POSTs to the Laravel-backed save route. */
export interface ClearancePayload {
  employee: ClearanceEmployeeInfo;
  units: { unit: string; items: string }[];
  properties: { item: string }[];
}

/** Document format the wizard can generate. */
export type ClearanceDocFormat = "docx" | "pdf";

export const CLEARANCE_FORMAT_OPTIONS: {
  value: ClearanceDocFormat;
  label: string;
}[] = [
  { value: "docx", label: "Word (.docx)" },
  { value: "pdf", label: "PDF" },
];

/**
 * What the client POSTs to the download route. Same shape as
 * ClearancePayload plus the two fields that only matter for building the
 * file — company (letterhead) and format (docx/pdf) — neither of which is
 * persisted on the Laravel side.
 */
export interface ClearanceDownloadPayload extends ClearancePayload {
  company: CompanyKey;
  format: ClearanceDocFormat;
}

// ── Saved record, as Laravel returns it ────────────────────────────────

export interface ClearanceRecord {
  id: number;
  clearance_no: string;
  employee: ClearanceEmployeeInfo;
  units: { unit: string; items: string }[];
  properties: { item: string }[];
  created_at: string | null;
  updated_at: string | null;
}

// ── Wizard steps (used by the dialog + stepper) ────────────────────────

export const CLEARANCE_STEPS = [
  { label: "Employee (A)" },
  { label: "Departments (B)" },
  { label: "Property (C)" },
  { label: "Review" },
] as const;

// ── Row helpers (generic, used by both editors) ────────────────────────

let seq = 0;
// Not crypto.randomUUID(): that throws on plain-http intranet deployments.
export const uid = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

export const newUnitRow = (unit = "", items = ""): ClearanceUnitRow => ({
  id: uid(),
  unit,
  items,
});

export const newPropertyRow = (item = ""): ClearancePropertyRow => ({
  id: uid(),
  item,
});

export const patchRow = <T extends { id: string }>(
  rows: T[],
  id: string,
  patch: Partial<T>,
): T[] => rows.map((r) => (r.id === id ? { ...r, ...patch } : r));

export const removeRow = <T extends { id: string }>(rows: T[], id: string) =>
  rows.filter((r) => r.id !== id);

export const moveRow = <T>(rows: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= rows.length) return rows;
  const next = rows.slice();
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
};

// ── ";" separated items ────────────────────────────────────────────────

/** "a;b ;; c" -> ["a", "b", "c"] */
export const splitItems = (text: string): string[] =>
  text
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

/** Tidy spacing: "a;b ;; c" -> "a; b; c" (line breaks / extra spaces collapse). */
export const normalizeItems = (text: string): string =>
  splitItems(text.replace(/\s+/g, " ")).join("; ");

// ── Defaults (copied from the uploaded IT / Multimedia templates) ──────

export const DEFAULT_SECTION_B: { unit: string; items: string }[] = [
  {
    unit: "Immediate Supervisor",
    items:
      "Completion and acceptance of project turnover; pending edits and revisions; shoot schedules; client deliverables; file organization; endorsement of ongoing assignments",
  },
  {
    unit: "Multimedia",
    items:
      "Camera, lenses, lights, audio equipment and accessories; memory cards and storage drives; raw footage/photos; project files and exports; editing templates/presets; Adobe/Canva and media-library access; account deactivation",
  },
  {
    unit: "Administration",
    items:
      "Company ID; office/accommodation keys; access cards; uniform; files/documents; equipment and supplies",
  },
  {
    unit: "Accounting",
    items:
      "Cash advances; reimbursements; loans; company funds; approved accommodation/utilities or other documented financial accountabilities",
  },
  {
    unit: "Human Resources",
    items:
      "Timekeeping and leave records; exit documents; company records; return of HR-issued items; completion of applicable requirements",
  },
];

export type SectionCPresetKey = "it" | "multimedia" | "basic";

export const SECTION_C_PRESETS: Record<
  SectionCPresetKey,
  { label: string; items: string[] }
> = {
  it: {
    label: "IT Department",
    items: [
      "Company ID / Access Card",
      "Office / Accommodation Keys",
      "Laptop / Device / Accessories",
      "Company Email / Cloud Storage",
      "Repository / Source Code / Project Files",
      "Hosting / Database / Client Credentials",
      "Social Media / Marketing Accounts",
      "Documents / Records / Uniform",
      // "Other: __________________________",
    ],
  },
  multimedia: {
    label: "Multimedia Department",
    items: [
      "Company ID / Access Card",
      "Office / Accommodation Keys",
      "Camera / Lenses / Accessories",
      "Lights / Audio / Production Equipment",
      "Memory Cards / Storage Drives",
      "Raw Footage / Photos / Source Assets",
      "Project Files / Edited Masters / Exports",
      "Adobe / Canva / Media-Library Accounts",
      "Social Media / Client Assets / Other",
    ],
  },
  // Fallback for other departments: only the rows both templates share.
  basic: {
    label: "Basic (ID & keys)",
    items: ["Company ID / Access Card", "Office / Accommodation Keys"],
  },
};

/** Picks the Section C starting list from the employee's department name. */
export const pickSectionCPreset = (department: string): SectionCPresetKey => {
  if (/\bIT\b|information tech/i.test(department)) return "it";
  if (/multimedia/i.test(department)) return "multimedia";
  return "basic";
};

export const sectionCRows = (key: SectionCPresetKey) =>
  SECTION_C_PRESETS[key].items.map((item) => newPropertyRow(item));

export const emptyClearanceForm = (department = ""): ClearanceFormData => ({
  units: DEFAULT_SECTION_B.map((r) => newUnitRow(r.unit, r.items)),
  properties: sectionCRows(pickSectionCPreset(department)),
  // Same default as emptyCoeForm() in coe-types.ts.
  company: "infinitech",
});

/** Turns a saved record's rows back into editable form state (gives each row an id). */
export const formToData = (
  units: { unit: string; items: string }[],
  properties: { item: string }[],
  company: CompanyKey = "infinitech",
): ClearanceFormData => ({
  units: units.length
    ? units.map((u) => newUnitRow(u.unit, u.items))
    : [newUnitRow()],
  properties: properties.length
    ? properties.map((p) => newPropertyRow(p.item))
    : [newPropertyRow()],
  company,
});

// ── Validation / cleanup before sending ────────────────────────────────

export interface PreparedClearance {
  /** keys look like `${rowId}.unit` / `${rowId}.items` */
  errors: Record<string, boolean>;
  units: ClearancePayload["units"];
  properties: ClearancePayload["properties"];
  company: CompanyKey;
}

/**
 * - fully empty rows are dropped silently
 * - a Section B row needs BOTH a unit and at least one item
 * - each list needs at least one row
 */
export const prepareClearance = (
  data: ClearanceFormData,
): PreparedClearance => {
  const errors: Record<string, boolean> = {};
  const units: PreparedClearance["units"] = [];
  const properties: PreparedClearance["properties"] = [];

  for (const row of data.units) {
    const unit = row.unit.trim();
    const items = normalizeItems(row.items);
    if (!unit && !items) continue;
    if (!unit) errors[`${row.id}.unit`] = true;
    if (!items) errors[`${row.id}.items`] = true;
    units.push({ unit, items });
  }

  for (const row of data.properties) {
    const item = row.item.trim();
    if (item) properties.push({ item });
  }

  return { errors, units, properties, company: data.company };
};

// ── Filename ───────────────────────────────────────────────────────────

/** Employee_Clearance_26-0093_Chrissa_May_P_Canedo.docx (or .pdf) */
export const buildClearanceFilename = (
  name: string,
  idNumber: string,
  format: ClearanceDocFormat = "docx",
) => {
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // ñ -> n
      .replace(/[^A-Za-z0-9-]+/g, "_")
      .replace(/^_+|_+$/g, "");
  return `Employee_Clearance_${clean(idNumber)}_${clean(name)}.${format}`;
};

// ── Thin CRUD callers (used by the list page) ──────────────────────────

const authHeaders = () => {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchClearances = async (
  search = "",
): Promise<ClearanceRecord[]> => {
  const url = search
    ? `/api/admin/clearance?search=${encodeURIComponent(search)}`
    : "/api/admin/clearance";
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Failed to load clearances");
  }
  return json.data as ClearanceRecord[];
};

export const deleteClearance = async (id: number): Promise<void> => {
  const res = await fetch(`/api/admin/clearance/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Failed to delete the clearance");
  }
};
