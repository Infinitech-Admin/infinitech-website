// File: components/admin/employee-types.ts
// Shared Employee type for the masterfile system.
// Only "Government ID Numbers", "Family Information", "Contact Information",
// and "Allowances" are nullable/optional — everything else is required.

export const EMPLOYEE_STATUSES = [
  "Active",
  "On Leave",
  "Suspended",
  "Resigned",
  "Terminated",
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

// Badge color per status — used on the masterfile table, the status
// dropdown, and the left-side filter tabs.
export const STATUS_BADGE_CLASSES: Record<EmployeeStatus, string> = {
  Active: "bg-green-100 text-green-700 border-green-300",
  "On Leave": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Suspended: "bg-orange-100 text-orange-700 border-orange-300",
  Resigned: "bg-slate-100 text-slate-700 border-slate-300",
  Terminated: "bg-red-100 text-red-700 border-red-300",
};

export interface EmployeeAllowance {
  label: string;
  amount: number;
}

// The set of allowance types offered on the employee form. Stored as plain
// JSON on the employee record (not a DB enum), so adding a new type later is
// just adding an entry here — no migration needed.
export const EMPLOYEE_ALLOWANCE_TYPES: { key: string; label: string }[] = [
  { key: "meal", label: "Meal Allowance" },
  { key: "load", label: "Load Allowance" },
  { key: "gas", label: "Gas Allowance" },
  { key: "transportation", label: "Transportation Allowance" },
];

export interface Employee {
  id: number;

  // Employment info — required
  id_number: string;
  department: string;
  position: string;
  date_hired: string; // YYYY-MM-DD
  status: EmployeeStatus;
  salary: string; // Laravel's decimal:2 cast serializes as a string, e.g. "45000.00"

  // Personal information — required
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  suffix?: string | null;
  birthday: string; // YYYY-MM-DD
  birthplace?: string | null;
  civil_status: string;
  gender: string;

  // Government ID numbers — nullable
  sss_number?: string | null;
  philhealth_number?: string | null;
  pagibig_number?: string | null;
  tin_number?: string | null;

  // Family information — nullable
  m_last_name?: string | null;
  m_first_name?: string | null;
  m_middle_name?: string | null;
  m_suffix?: string | null;
  f_last_name?: string | null;
  f_first_name?: string | null;
  f_middle_name?: string | null;
  f_suffix?: string | null;

  // Contact information — nullable
  mobile_number?: string | null;
  house_number?: string | null;
  street?: string | null;
  village?: string | null;
  subdivision?: string | null;
  barangay?: string | null;
  region?: string | null;
  province?: string | null;
  city_municipality?: string | null;
  zip_code?: string | null;
  email_address?: string | null;

  // Allowances — nullable JSON array
  allowances?: EmployeeAllowance[] | null;

  created_at: string;
  updated_at: string;
}

// Per-type checkbox + amount state used by the form (one entry per
// EMPLOYEE_ALLOWANCE_TYPES key). Converted to/from the plain
// EmployeeAllowance[] the API expects via allowancesToFormState /
// buildEmployeeAllowances below.
export type AllowanceFormState = Record<
  string,
  { checked: boolean; amount: string }
>;

export type EmployeeFormData = Omit<
  Employee,
  "id" | "created_at" | "updated_at" | "allowances"
> & {
  allowances: AllowanceFormState;
};

export const emptyAllowancesState = (): AllowanceFormState =>
  Object.fromEntries(
    EMPLOYEE_ALLOWANCE_TYPES.map((a) => [
      a.key,
      { checked: false, amount: "" },
    ]),
  );

// Existing employee -> form state, used when opening the Edit dialog.
export const allowancesToFormState = (
  allowances?: EmployeeAllowance[] | null,
): AllowanceFormState => {
  const state = emptyAllowancesState();
  (allowances ?? []).forEach((a) => {
    const match = EMPLOYEE_ALLOWANCE_TYPES.find((t) => t.label === a.label);
    if (match) state[match.key] = { checked: true, amount: String(a.amount) };
  });
  return state;
};

// Form state -> the array the API expects, called on submit.
export const buildEmployeeAllowances = (
  state: AllowanceFormState,
): EmployeeAllowance[] =>
  EMPLOYEE_ALLOWANCE_TYPES.filter(
    (t) => state[t.key]?.checked && state[t.key]?.amount !== "",
  ).map((t) => ({ label: t.label, amount: Number(state[t.key].amount) }));

export const emptyEmployee = (): EmployeeFormData => ({
  id_number: "",
  department: "",
  position: "",
  date_hired: "",
  status: "Active",
  salary: "",
  last_name: "",
  first_name: "",
  middle_name: "",
  suffix: "",
  birthday: "",
  birthplace: "",
  civil_status: "",
  gender: "",
  sss_number: "",
  philhealth_number: "",
  pagibig_number: "",
  tin_number: "",
  m_last_name: "",
  m_first_name: "",
  m_middle_name: "",
  m_suffix: "",
  f_last_name: "",
  f_first_name: "",
  f_middle_name: "",
  f_suffix: "",
  mobile_number: "",
  house_number: "",
  street: "",
  village: "",
  subdivision: "",
  barangay: "",
  region: "",
  province: "",
  city_municipality: "",
  zip_code: "",
  email_address: "",
  allowances: emptyAllowancesState(),
});

/** Fields that must be filled in before Save is allowed. */
export const REQUIRED_FIELDS: (keyof EmployeeFormData)[] = [
  "id_number",
  "department",
  "position",
  "date_hired",
  "status",
  "salary",
  "last_name",
  "first_name",
  "birthday",
  "civil_status",
  "gender",
];

export const getFullName = (
  e: Pick<Employee, "first_name" | "middle_name" | "last_name" | "suffix">,
) =>
  [e.first_name, e.middle_name, e.last_name, e.suffix]
    .filter(Boolean)
    .join(" ");
