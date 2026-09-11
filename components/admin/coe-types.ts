// File: components/admin/coe-types.ts

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
}

export interface Coe {
  id: number;
  certificate_no: string;
  employee_id: number;
  employee_name: string;
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
  meal_checked: boolean;
  meal_amount: string;
  transportation_checked: boolean;
  transportation_amount: string;
  period_from: string;
  period_to: string;
  issued_at: string;
  signatory_name: string;
  signatory_title: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export const emptyCoeForm = (): CoeFormData => ({
  id_number: "",
  employee_id: null,
  employee_name: "",
  department: "",
  position: "",
  date_hired: null,
  salary: "",
  meal_checked: false,
  meal_amount: "",
  transportation_checked: false,
  transportation_amount: "",
  // Period From is auto-filled from the employee's date hired on lookup.
  // Period To is always manual — left blank so it can't be submitted unnoticed.
  period_from: "",
  period_to: "",
  issued_at: today(),
  signatory_name: "",
  signatory_title: "",
});

// Builds the allowances array the API expects from the two checkboxes.
// Add more entries here if more allowance types are introduced later.
export const buildAllowances = (data: CoeFormData): Allowance[] => {
  const allowances: Allowance[] = [];
  if (data.meal_checked && data.meal_amount) {
    allowances.push({ label: "Meal", amount: Number(data.meal_amount) });
  }
  if (data.transportation_checked && data.transportation_amount) {
    allowances.push({
      label: "Transportation",
      amount: Number(data.transportation_amount),
    });
  }
  return allowances;
};

export const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
