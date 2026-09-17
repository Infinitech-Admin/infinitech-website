// File: components/admin/coe-form.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Search, CheckCircle2, XCircle } from "lucide-react";
import {
  EMPLOYEE_ALLOWANCE_TYPES,
  COMPANY_OPTIONS,
  type CoeFormData,
  type CompanyKey,
} from "./coe-types";

interface Props {
  data: CoeFormData;
  onChange: <K extends keyof CoeFormData>(
    field: K,
    value: CoeFormData[K],
  ) => void;
  /** Toggling / amount-typing for one allowance type at a time — same shape
   *  as the employee masterfile form's onAllowanceChange. */
  onAllowanceChange: (
    key: string,
    patch: Partial<{ checked: boolean; amount: string }>,
  ) => void;
  lookupStatus: "idle" | "loading" | "found" | "not_found";
  errors?: Partial<Record<keyof CoeFormData, boolean>>;
  /**
   * When true, the Employee ID Number field is shown read-only instead of as
   * a searchable input. Used when this form is launched from a specific
   * employee's row (e.g. the masterfile) so the employee is already locked
   * in — typing a different ID number there would be misleading. The
   * standalone COE page leaves this off (default false) so it can keep using
   * the field to search for an employee.
   */
  lockIdNumber?: boolean;
}

function Field({
  label,
  value,
  required,
  children,
}: {
  label: string;
  value?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children ?? (
        <Input value={value ?? ""} readOnly disabled className="bg-slate-50" />
      )}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  );
}

export function CoeForm({
  data,
  onChange,
  onAllowanceChange,
  lookupStatus,
  errors = {},
  lockIdNumber = false,
}: Props) {
  return (
    <div className="space-y-4 pt-2">
      {/* Company — decides which letterhead/logo and company name the
          generated .docx uses (see lib/coe/generate-coe-docx.ts). Not tied
          to the employee lookup since one employee record isn't scoped to
          a single company; this is picked per-certificate. */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
          Company<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Select
          value={data.company}
          onValueChange={(v) => onChange("company", v as CompanyKey)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ID Number: searchable input on the standalone COE page, read-only
          once launched from a specific employee's row */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
          Employee ID Number<span className="text-red-500 ml-0.5">*</span>
        </Label>
        {lockIdNumber ? (
          <Input
            value={data.id_number}
            readOnly
            disabled
            className="bg-slate-50 font-mono"
          />
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type ID number to autofill name, department, position..."
              value={data.id_number}
              onChange={(e) => onChange("id_number", e.target.value)}
              className={`pl-9 ${errors.employee_id ? "border-red-400" : ""}`}
            />
            {lookupStatus === "loading" && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {lookupStatus === "found" && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
            {lookupStatus === "not_found" && (
              <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
        )}
        {!lockIdNumber && lookupStatus === "not_found" && (
          <p className="text-xs text-red-500">
            No employee found with that ID number.
          </p>
        )}
      </div>

      {/* Autofilled, read-only */}
      <Row>
        <Field label="Name" value={data.employee_name} />
        <Field label="Department" value={data.department} />
      </Row>
      <Row>
        <Field label="Position" value={data.position} />
        <Field label="Date Hired" value={data.date_hired ?? ""} />
      </Row>

      {/* Salary — autofilled from the employee's current masterfile salary
          on lookup, but left as a plain editable input (not disabled) since
          the COE may need to reflect a raise/adjustment that hasn't been
          saved back to the masterfile yet. */}
      <Row>
        <Field label="Monthly Salary" required>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="20000.00"
            value={data.salary}
            onChange={(e) => onChange("salary", e.target.value)}
            className={errors.salary ? "border-red-400" : ""}
          />
        </Field>
        <div />
      </Row>

      {/* Allowance checkboxes — one per EMPLOYEE_ALLOWANCE_TYPES entry, same
          set used on the masterfile's Allowances tab, so a lookup can drop
          the employee's saved allowances straight into these checkboxes. */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
          Allowances
        </Label>
        <div className="space-y-2">
          {EMPLOYEE_ALLOWANCE_TYPES.map((type) => {
            const state = data.allowances[type.key] ?? {
              checked: false,
              amount: "",
            };
            return (
              <div key={type.key} className="flex items-center gap-2">
                <Checkbox
                  checked={state.checked}
                  onCheckedChange={(v) =>
                    onAllowanceChange(type.key, { checked: !!v })
                  }
                  id={`coe_allowance_${type.key}`}
                />
                <Label
                  htmlFor={`coe_allowance_${type.key}`}
                  className="font-normal min-w-[190px]"
                >
                  {type.label}
                </Label>
                {state.checked && (
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Amount"
                    value={state.amount}
                    onChange={(e) =>
                      onAllowanceChange(type.key, { amount: e.target.value })
                    }
                    className="w-40"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Period covered + issue date */}
      <Row>
        <Field label="Period From (from Date Hired)" value={data.period_from} />
        <Field label="Period To" required>
          <Input
            type="date"
            value={data.period_to}
            onChange={(e) => onChange("period_to", e.target.value)}
            className={errors.period_to ? "border-red-400" : ""}
          />
        </Field>
      </Row>
      <Row>
        {/* Always today — read-only, never backdated */}
        <Field label="Issued On" value={data.issued_at} />
        <div />
      </Row>

      {/* Signatory — pre-filled with the default signatory but still a
          plain editable input in case a different person needs to sign */}
      <Row>
        <Field label="Signatory Name" required>
          <Input
            placeholder="Maria Krissa Charez R. Bongon"
            value={data.signatory_name}
            onChange={(e) => onChange("signatory_name", e.target.value)}
            className={errors.signatory_name ? "border-red-400" : ""}
          />
        </Field>
        <Field label="Signatory Title" required>
          <Input
            placeholder="Executive Assistant to the CEO / Human Resource Officer"
            value={data.signatory_title}
            onChange={(e) => onChange("signatory_title", e.target.value)}
            className={errors.signatory_title ? "border-red-400" : ""}
          />
        </Field>
      </Row>
    </div>
  );
}
