// File: components/admin/employee-types.ts
// Shared Employee type for the masterfile system.
// Only "Government ID Numbers", "Family Information", and "Contact Information"
// are nullable/optional — everything else is required.

export interface Employee {
  id: number;

  // Employment info — required
  id_number: string;
  department: string;
  position: string;
  date_hired: string; // YYYY-MM-DD

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

  created_at: string;
  updated_at: string;
}

export type EmployeeFormData = Omit<
  Employee,
  "id" | "created_at" | "updated_at"
>;

export const emptyEmployee = (): EmployeeFormData => ({
  id_number: "",
  department: "",
  position: "",
  date_hired: "",
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
});

/** Fields that must be filled in before Save is allowed. */
export const REQUIRED_FIELDS: (keyof EmployeeFormData)[] = [
  "id_number",
  "department",
  "position",
  "date_hired",
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
