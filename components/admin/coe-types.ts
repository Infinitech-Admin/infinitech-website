// File: components/admin/coe-types.ts

import {
  EMPLOYEE_ALLOWANCE_TYPES,
  type AllowanceFormState,
  emptyAllowancesState,
  allowancesToFormState,
  buildEmployeeAllowances,
} from "./employee-types";

export interface Allowance {
  label: string;
  amount: number;
}

export interface EmployeeLookup {
  id: number;
  id_number: string;
  full_name: string;
  department: string;
  position: string;
  date_hired: string | null;
  salary: string; // decimal:2 cast on the Laravel side -> comes back as a string, e.g. "45000.00"
  allowances: Allowance[] | null;
}

// Which employer this COE is for. Not persisted on the Laravel side — the
// admin picks it on the form, and it's carried straight through to the
// Next.js doc generator (which decides the logo + company name from it).
// Add a third entry here if a third company ever comes into play.
export type CompanyKey = "infinitech" | "abic";

export const COMPANY_OPTIONS: { value: CompanyKey; label: string }[] = [
  { value: "infinitech", label: "Infinitech Advertising Corporation" },
  { value: "abic", label: "ABIC Realty & Consultancy Corporation" },
];

export interface Coe {
  id: number;
  certificate_no: string;
  employee_id: number;
  employee_name: string;
  // Split name fields, alongside employee_name, specifically so the download
  // filename can be "Lastname_Firstname-COE-<no>" instead of stitching the
  // combined full_name apart (which is ambiguous with middle names).
  employee_first_name: string | null;
  employee_last_name: string | null;
  id_number: string;
  department: string;
  position: string;
  salary: number;
  allowances: Allowance[];
  period_from: string;
  period_to: string;
  issued_at: string;
  signatory_name: string;
  signatory_title: string;
  created_at: string;
}

export interface CoeFormData {
  id_number: string;
  employee_id: number | null;
  employee_name: string;
  department: string;
  position: string;
  date_hired: string | null;
  salary: string;
  // Which employer this COE is being issued under — see CompanyKey above.
  company: CompanyKey;
  // Reuses the exact same checked/amount map shape as the employee masterfile
  // form (one entry per EMPLOYEE_ALLOWANCE_TYPES key: meal, load, gas,
  // transportation) so a lookup can drop the employee's saved allowances
  // straight in, and any new allowance type added to the masterfile shows up
  // here automatically — no more hardcoded per-type fields to keep in sync.
  allowances: AllowanceFormState;
  period_from: string;
  period_to: string;
  issued_at: string;
  signatory_name: string;
  signatory_title: string;
}

const today = () => new Date().toISOString().slice(0, 10);

// The signatory is effectively always the same person, so it's pre-typed by
// default — still a plain editable Input in CoeForm, just not blank, so the
// common case needs zero typing but an unusual case (different signatory)
// can still overwrite it.
const DEFAULT_SIGNATORY_NAME = "MARIA KRISSA CHAREZ R. BONGON";
const DEFAULT_SIGNATORY_TITLE =
  "Executive Assistant to the CEO / Human Resource Officer";

export const emptyCoeForm = (): CoeFormData => ({
  id_number: "",
  employee_id: null,
  employee_name: "",
  department: "",
  position: "",
  date_hired: null,
  salary: "",
  company: "infinitech",
  allowances: emptyAllowancesState(),
  // Period From is auto-filled from the employee's date hired on lookup.
  // Period To is always manual — left blank so it can't be submitted unnoticed.
  period_from: "",
  period_to: "",
  // Always today — a COE is issued the day it's generated, never backdated,
  // so CoeForm renders this read-only.
  issued_at: today(),
  signatory_name: DEFAULT_SIGNATORY_NAME,
  signatory_title: DEFAULT_SIGNATORY_TITLE,
});

// Employee lookup's allowances -> the checkbox/amount map CoeForm renders.
// Re-exported here (thin wrapper over the shared helper) so callers only
// need to import from coe-types, not reach into employee-types too.
export const lookupAllowancesToFormState = allowancesToFormState;

// The employee masterfile stores meal allowance as a DAILY rate (60/80),
// but a COE always prints/stores the MONTHLY TOTAL (daily rate x 22
// working days) — see the meal-allowance dropdown in coe-form.tsx, which
// applies this same conversion when the admin picks 60/80 by hand.
//
// That dropdown conversion only fires on manual selection though. Any place
// that instead pulls allowances straight from an employee's masterfile
// record into a CoeFormData — e.g. the COE lookup effect in
// employee-masterfile/page.tsx, or any other lookup that reuses
// lookupAllowancesToFormState — needs this applied once as a separate step,
// since allowancesToFormState() alone just carries the masterfile's daily
// rate straight through unchanged.
export const MEAL_ALLOWANCE_WORKING_DAYS = 22;

export function applyMealAllowanceMonthlyTotal(
  allowances: AllowanceFormState,
): AllowanceFormState {
  const next = { ...allowances };
  for (const type of EMPLOYEE_ALLOWANCE_TYPES) {
    if (!type.label.toLowerCase().includes("meal")) continue;
    const entry = next[type.key];
    if (entry?.checked && entry.amount) {
      next[type.key] = {
        ...entry,
        amount: String(Number(entry.amount) * MEAL_ALLOWANCE_WORKING_DAYS),
      };
    }
  }
  return next;
}

// Form state -> the array the API expects, called on submit.
export const buildAllowances = (data: CoeFormData): Allowance[] =>
  buildEmployeeAllowances(data.allowances);

export const formatCurrency = (amount: number | string) => {
  const numeric = Number(amount ?? 0);
  const safeNumeric = isNaN(numeric) ? 0 : numeric;
  return `₱${safeNumeric.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Strips anything that isn't safe across Windows/macOS/email attachments,
// collapses whitespace to a single underscore, and trims stray underscores
// left over from punctuation at the edges (e.g. "O'Brien" -> "OBrien").
const sanitizeFilenamePart = (value: string): string =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");

// "Lastname_Firstname-COE-CE-0052.docx". Falls back to the combined
// employee_name (also sanitized) if first/last aren't available, so a
// record from before this field existed still downloads a sane filename
// instead of throwing.
export const buildCoeFilename = (coe: {
  employee_first_name?: string | null;
  employee_last_name?: string | null;
  employee_name: string;
  certificate_no: string;
}): string => {
  const last = coe.employee_last_name
    ? sanitizeFilenamePart(coe.employee_last_name)
    : "";
  const first = coe.employee_first_name
    ? sanitizeFilenamePart(coe.employee_first_name)
    : "";

  const namePart =
    last && first
      ? `${last}_${first}`
      : sanitizeFilenamePart(coe.employee_name) || "Employee";

  const certPart =
    sanitizeFilenamePart(coe.certificate_no.replace(/^[A-Za-z]+-?/, "")) ||
    sanitizeFilenamePart(coe.certificate_no) ||
    "0000";

  return `${namePart}-COE-${certPart}.docx`;
};

// Re-exported for convenience so CoeForm doesn't need a second import line
// just for the list of allowance types to render.
export { EMPLOYEE_ALLOWANCE_TYPES };
