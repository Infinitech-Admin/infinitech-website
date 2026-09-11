// File: components/admin/coe-form.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader, Search, CheckCircle2, XCircle } from "lucide-react";
import type { CoeFormData } from "./coe-types";

interface Props {
  data: CoeFormData;
  onChange: <K extends keyof CoeFormData>(
    field: K,
    value: CoeFormData[K],
  ) => void;
  lookupStatus: "idle" | "loading" | "found" | "not_found";
  errors?: Partial<Record<keyof CoeFormData, boolean>>;
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

export function CoeForm({ data, onChange, lookupStatus, errors = {} }: Props) {
  return (
    <div className="space-y-4 pt-2">
      {/* ID Number lookup */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
          Employee ID Number<span className="text-red-500 ml-0.5">*</span>
        </Label>
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
        {lookupStatus === "not_found" && (
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

      {/* Manual input */}
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

      {/* Allowance checkboxes */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
          Allowances
        </Label>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={data.meal_checked}
            onCheckedChange={(v) => onChange("meal_checked", !!v)}
            id="meal_checked"
          />
          <Label htmlFor="meal_checked" className="font-normal">
            Meal Allowance
          </Label>
          {data.meal_checked && (
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Amount"
              value={data.meal_amount}
              onChange={(e) => onChange("meal_amount", e.target.value)}
              className="w-36 ml-2"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={data.transportation_checked}
            onCheckedChange={(v) => onChange("transportation_checked", !!v)}
            id="transportation_checked"
          />
          <Label htmlFor="transportation_checked" className="font-normal">
            Transportation Allowance
          </Label>
          {data.transportation_checked && (
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Amount"
              value={data.transportation_amount}
              onChange={(e) =>
                onChange("transportation_amount", e.target.value)
              }
              className="w-36 ml-2"
            />
          )}
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
        <Field label="Issued On" required>
          <Input
            type="date"
            value={data.issued_at}
            onChange={(e) => onChange("issued_at", e.target.value)}
            className={errors.issued_at ? "border-red-400" : ""}
          />
        </Field>
        <div />
      </Row>

      {/* Signatory */}
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
