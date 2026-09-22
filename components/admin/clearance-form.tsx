// File: components/admin/clearance-form.tsx
"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ClearanceEmployeeInfo,
  type ClearanceFormData,
  type SectionCPresetKey,
  SECTION_C_PRESETS,
  moveRow,
  newPropertyRow,
  newUnitRow,
  normalizeItems,
  patchRow,
  prepareClearance,
  removeRow,
  sectionCRows,
  splitItems,
} from "@/components/admin/clearance-types";

interface StepProps {
  data: ClearanceFormData;
  onChange: (next: ClearanceFormData) => void;
  /** keys: `${rowId}.unit` / `${rowId}.items` */
  errors?: Record<string, boolean>;
  disabled?: boolean;
}

interface ClearanceFormProps extends StepProps {
  /** 0 = A, 1 = B, 2 = C, 3 = Review */
  step: number;
  employee: ClearanceEmployeeInfo;
  onEditStep: (step: number) => void;
}

const errorClass = "border-red-500 focus-visible:ring-red-500";

// ── small building blocks ──────────────────────────────────────────────

function SectionCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-2.5 border-b">
        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      <div className="p-3 sm:p-4 space-y-3">{children}</div>
    </section>
  );
}

function RowControls({
  index,
  total,
  onMove,
  onRemove,
  disabled,
}: {
  index: number;
  total: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="Move up"
        disabled={disabled || index === 0}
        onClick={() => onMove(index - 1)}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="Move down"
        disabled={disabled || index === total - 1}
        onClick={() => onMove(index + 1)}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        title="Remove"
        disabled={disabled}
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AutoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || "—"}</p>
    </div>
  );
}

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={onClick}
    >
      <Pencil className="h-3 w-3 mr-1" /> Edit
    </Button>
  );
}

const EmployeeGrid = ({ employee }: { employee: ClearanceEmployeeInfo }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
    <AutoField label="Employee Name" value={employee.employee_name} />
    <AutoField label="Employee ID" value={employee.id_number} />
    <AutoField label="Position" value={employee.position} />
    <AutoField label="Department" value={employee.department} />
  </div>
);

// ── Step 1 · Section A ─────────────────────────────────────────────────

function EmployeeStep({ employee }: { employee: ClearanceEmployeeInfo }) {
  return (
    <SectionCard
      title="A. Employee and Separation Information"
      action={
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Auto-filled
        </span>
      }
    >
      <EmployeeGrid employee={employee} />
      <p className="text-xs text-muted-foreground">
        Pulled from the masterfile. To change these, edit the employee record.
      </p>
    </SectionCard>
  );
}

// ── Step 2 · Section B ─────────────────────────────────────────────────

function DepartmentalStep({
  data,
  onChange,
  errors = {},
  disabled,
}: StepProps) {
  const { units } = data;
  const setUnits = (next: typeof units) => onChange({ ...data, units: next });

  return (
    <SectionCard
      title="B. Departmental Clearance"
      hint="Status, Remarks and Verified By are fixed in the form."
    >
      {units.map((row, index) => {
        const count = splitItems(row.items).length;
        return (
          <div key={row.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center gap-1">
              <Input
                placeholder="Responsible Unit (e.g. Accounting)"
                value={row.unit}
                disabled={disabled}
                className={`min-w-0 font-medium ${errors[`${row.id}.unit`] ? errorClass : ""}`}
                onChange={(e) =>
                  setUnits(patchRow(units, row.id, { unit: e.target.value }))
                }
              />
              <RowControls
                index={index}
                total={units.length}
                disabled={disabled}
                onMove={(to) => setUnits(moveRow(units, index, to))}
                onRemove={() => setUnits(removeRow(units, row.id))}
              />
            </div>
            <textarea
              rows={4}
              placeholder="Clearance items to verify — separate each item with ;"
              value={row.items}
              disabled={disabled}
              className={`flex w-full min-w-0 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                errors[`${row.id}.items`] ? errorClass : ""
              }`}
              onChange={(e) =>
                setUnits(patchRow(units, row.id, { items: e.target.value }))
              }
              // tidy "a;b ;; c" into "a; b; c" once the user leaves the box
              onBlur={() =>
                setUnits(
                  patchRow(units, row.id, { items: normalizeItems(row.items) }),
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              {count} item{count === 1 ? "" : "s"} · separate with{" "}
              <code className="font-mono">;</code>
            </p>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setUnits([...units, newUnitRow()])}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Responsible Unit
      </Button>
    </SectionCard>
  );
}

// ── Step 3 · Section C ─────────────────────────────────────────────────

function PropertyStep({ data, onChange, disabled }: StepProps) {
  const { properties } = data;
  const setProps = (next: typeof properties) =>
    onChange({ ...data, properties: next });

  return (
    <SectionCard
      title="C. Property and Access Turnover"
      hint="Date Returned, Condition and Checked By stay blank for handwriting."
      action={
        <Select
          value=""
          disabled={disabled}
          onValueChange={(key) =>
            onChange({
              ...data,
              properties: sectionCRows(key as SectionCPresetKey),
            })
          }
        >
          <SelectTrigger className="h-8 w-full sm:w-[190px] text-xs">
            <SelectValue placeholder="Load preset list…" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SECTION_C_PRESETS) as SectionCPresetKey[]).map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {SECTION_C_PRESETS[key].label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      }
    >
      {properties.map((row, index) => (
        <div key={row.id} className="flex items-center gap-1">
          <Input
            placeholder="Item / Account / Property"
            value={row.item}
            disabled={disabled}
            className="min-w-0"
            onChange={(e) =>
              setProps(patchRow(properties, row.id, { item: e.target.value }))
            }
          />
          <RowControls
            index={index}
            total={properties.length}
            disabled={disabled}
            onMove={(to) => setProps(moveRow(properties, index, to))}
            onRemove={() => setProps(removeRow(properties, row.id))}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setProps([...properties, newPropertyRow()])}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Item
      </Button>
    </SectionCard>
  );
}

// ── Step 4 · Review ────────────────────────────────────────────────────

function ReviewStep({
  employee,
  data,
  onEditStep,
}: Pick<ClearanceFormProps, "employee" | "data" | "onEditStep">) {
  // Same cleanup the download uses, so what you see is what gets printed.
  const { units, properties } = prepareClearance(data);

  return (
    <div className="space-y-4">
      <SectionCard
        title="A. Employee"
        action={<EditLink onClick={() => onEditStep(0)} />}
      >
        <EmployeeGrid employee={employee} />
      </SectionCard>

      <SectionCard
        title={`B. Departmental Clearance (${units.length})`}
        action={<EditLink onClick={() => onEditStep(1)} />}
      >
        {units.map((u, i) => (
          <div key={i} className="rounded-md border p-3">
            <p className="text-sm font-semibold">{u.unit}</p>
            <p className="mt-1 text-xs text-muted-foreground break-words">
              <span className="font-medium">
                {splitItems(u.items).length} items:
              </span>{" "}
              {u.items}
            </p>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title={`C. Property and Access (${properties.length})`}
        action={<EditLink onClick={() => onEditStep(2)} />}
      >
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5 text-sm">
          {properties.map((p, i) => (
            <li key={i} className="break-words">
              {p.item}
            </li>
          ))}
        </ul>
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        Sections D (Outstanding Accountabilities), E (Employee Declaration) and
        F (Final HR Certification) are printed as-is from the template.
      </p>
    </div>
  );
}

// ── Public component: renders whichever step is active ────────────────

export function ClearanceForm({
  step,
  employee,
  data,
  onChange,
  errors,
  disabled,
  onEditStep,
}: ClearanceFormProps) {
  const stepProps = { data, onChange, errors, disabled };

  switch (step) {
    case 0:
      return <EmployeeStep employee={employee} />;
    case 1:
      return <DepartmentalStep {...stepProps} />;
    case 2:
      return <PropertyStep {...stepProps} />;
    default:
      return (
        <ReviewStep employee={employee} data={data} onEditStep={onEditStep} />
      );
  }
}
