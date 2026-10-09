// File: components/admin/employee-form.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EMPLOYEE_ALLOWANCE_TYPES,
  EMPLOYEE_STATUSES,
  type EmployeeFormData,
  type PositionHistoryEntry,
} from "./employee-types";
import { Button } from "@/components/ui/button";

interface Props {
  data: EmployeeFormData;
  onChange: (
    field: keyof EmployeeFormData,
    value: string | PositionHistoryEntry[],
  ) => void;
  showPositionChangeSection?: boolean;
  /** Toggling / amount-typing for one allowance type at a time. */
  onAllowanceChange: (
    key: string,
    patch: Partial<{ checked: boolean; amount: string }>,
  ) => void;
  /** field names the caller marked invalid (missing/required) after a failed submit attempt */
  errors?: Partial<Record<keyof EmployeeFormData, boolean>>;
}

// Which fields live under which tab — used to render each tab and to flag a
// tab red if one of its fields failed validation.
const SECTION_FIELDS: Record<string, (keyof EmployeeFormData)[]> = {
  employee: [
    "id_number",
    "department",
    "position",
    "date_hired",
    "status",
    "salary",
    "last_name",
    "first_name",
    "middle_name",
    "suffix",
    "birthday",
    "birthplace",
    "civil_status",
    "gender",
  ],
  allowances: [],
  government: [
    "sss_number",
    "philhealth_number",
    "pagibig_number",
    "tin_number",
  ],
  family: [
    "m_last_name",
    "m_first_name",
    "m_middle_name",
    "m_suffix",
    "f_last_name",
    "f_first_name",
    "f_middle_name",
    "f_suffix",
  ],
  contact: [
    "mobile_number",
    "email_address",
    "house_number",
    "street",
    "village",
    "subdivision",
    "barangay",
    "region",
    "province",
    "city_municipality",
    "zip_code",
  ],
};

// ─── building blocks: plain vertical label-above-input, no more squeezed grid ──

function Field({
  label,
  field,
  data,
  onChange,
  required,
  invalid,
  type = "text",
  min,
  step,
}: {
  label: string;
  field: keyof EmployeeFormData;
  data: EmployeeFormData;
  onChange: Props["onChange"];
  required?: boolean;
  invalid?: boolean;
  type?: string;
  min?: number;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
        min={min}
        step={step}
        value={(data[field] as string) ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        className={invalid ? "border-red-400 focus-visible:ring-red-400" : ""}
      />
    </div>
  );
}

function SelectField({
  label,
  field,
  data,
  onChange,
  options,
  required,
  invalid,
}: {
  label: string;
  field: keyof EmployeeFormData;
  data: EmployeeFormData;
  onChange: Props["onChange"];
  options: string[];
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Select
        value={(data[field] as string) ?? ""}
        onValueChange={(v) => onChange(field, v)}
      >
        <SelectTrigger className={invalid ? "border-red-400" : ""}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        {/*
          The `!` prefix forces these classes to win over whatever
          select.tsx sets, via Tailwind's !important. Solid navy background
          + white text guarantees the panel is fully opaque and readable
          no matter what's rendered behind it, and it's visually distinct
          from the white page so it's obvious it's a dropdown, not a
          rendering glitch.
        */}
        <SelectContent
          position="popper"
          sideOffset={4}
          className="z-[999] w-[--radix-select-trigger-width] !bg-slate-900 !border-slate-700 !opacity-100 !text-white shadow-xl"
        >
          {options.map((o) => (
            <SelectItem
              key={o}
              value={o}
              className="!text-white focus:!bg-slate-700 focus:!text-white"
            >
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-purple-600 pt-1">
      {children}
    </p>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  );
}

function PositionChangeSection({
  data,
  onChange,
}: {
  data: EmployeeFormData;
  onChange: Props["onChange"];
}) {
  const action = data.position_action || "";
  const [historyOpen, setHistoryOpen] = useState(false);
  const positionHistory = [...(data.position_history ?? [])].sort((a, b) =>
    b.effective_date.localeCompare(a.effective_date),
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
            Position Change
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={action === "Promote" ? "default" : "outline"}
              onClick={() => onChange("position_action", "Promote")}
            >
              Promote
            </Button>
            <Button
              type="button"
              size="sm"
              variant={action === "Demote" ? "default" : "outline"}
              onClick={() => onChange("position_action", "Demote")}
            >
              Demote
            </Button>
          </div>
        </div>
        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setHistoryOpen(true)}
          >
            Position History
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
              {positionHistory.length}
            </span>
          </Button>
          
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Position History Log</DialogTitle>
                <DialogDescription>
                  Previous promotions and demotions for this employee.
                </DialogDescription>
              </DialogHeader>
              {positionHistory.length ? (
                <div className="space-y-3">
                  {positionHistory.map((entry, index) => (
                    <div
                      key={`${entry.action}-${entry.new_position}-${entry.effective_date}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <div className="min-w-0">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            entry.action === "Promote"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {entry.action}
                        </span>
                        <p className="mt-1 break-words font-medium text-slate-800 dark:text-slate-100">
                          {entry.old_position || "Unknown position"}
                          <span className="mx-2 text-slate-400" aria-hidden="true">
                            →
                          </span>
                          {entry.new_position}
                        </p>
                      </div>
                      <time
                        dateTime={entry.effective_date}
                        className="shrink-0 text-sm text-slate-500 dark:text-slate-400"
                      >
                        {new Date(
                          `${entry.effective_date}T00:00:00`,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No position history has been recorded yet.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Row>
        <Field
          label="New Position"
          field="new_position"
          data={data}
          onChange={onChange}
        />
        <Field
          label={action ? `${action} Date` : "Date Promoted / Demoted"}
          field="position_effective_date"
          data={data}
          onChange={onChange}
          type="date"
        />
      </Row>

    </div>
  );
}

/**
 * Employee Masterfile form, split into tabs so each section (Employee Info,
 * Allowances, Government IDs, Family Info, Contact Info) is viewed on its own
 * instead of everything crammed into one wide two-column grid.
 */
export function EmployeeForm({
  data,
  onChange,
  onAllowanceChange,
  errors = {},
  showPositionChangeSection = false,
}: Props & { showPositionChangeSection?: boolean }) {
  const invalid = (f: keyof EmployeeFormData) => !!errors[f];
  const sectionHasError = (section: string) =>
    SECTION_FIELDS[section].some((f) => errors[f]);

  return (
    <Tabs defaultValue="employee" className="w-full">
      {/*
        `flex flex-wrap` instead of the fixed-height `grid grid-cols-5`:
        shadcn's default TabsList is h-10, so once "Government IDs" (the
        longest label) got squeezed into a narrow grid column and wrapped
        onto two lines, the list's height stayed fixed at h-10 and the
        wrapped second line spilled out over the content below it. Letting
        the list wrap onto its own second row (and grow to fit it) while
        keeping each label itself on one line fixes it on both mobile and
        desktop.
      */}
      <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-1 p-1">
        <TabsTrigger
          value="employee"
          className={`flex-1 whitespace-nowrap text-xs sm:text-sm ${sectionHasError("employee") ? "text-red-500" : ""
            }`}
        >
          Employee Info
        </TabsTrigger>
        <TabsTrigger
          value="allowances"
          className="flex-1 whitespace-nowrap text-xs sm:text-sm"
        >
          Allowances
        </TabsTrigger>
        <TabsTrigger
          value="government"
          className={`flex-1 whitespace-nowrap text-xs sm:text-sm ${sectionHasError("government") ? "text-red-500" : ""
            }`}
        >
          Government IDs
        </TabsTrigger>
        <TabsTrigger
          value="family"
          className={`flex-1 whitespace-nowrap text-xs sm:text-sm ${sectionHasError("family") ? "text-red-500" : ""
            }`}
        >
          Family Info
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className={`flex-1 whitespace-nowrap text-xs sm:text-sm ${sectionHasError("contact") ? "text-red-500" : ""
            }`}
        >
          Contact Info
        </TabsTrigger>
      </TabsList>

      {/* ── Employee + Personal Information ── */}
      <TabsContent value="employee" className="space-y-4 pt-4">
        <Row>
          <Field
            label="ID Number"
            field="id_number"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("id_number")}
          />
          <Field
            label="Department"
            field="department"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("department")}
          />
        </Row>
        <Row>
          <Field
            label="Position"
            field="position"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("position")}
          />
          <Field
            label="Date Hired"
            field="date_hired"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("date_hired")}
            type="date"
          />
        </Row>

        {showPositionChangeSection && (
          <PositionChangeSection data={data} onChange={onChange} />
        )}

        <Row>
          <SelectField
            label="Status"
            field="status"
            data={data}
            onChange={onChange}
            options={[...EMPLOYEE_STATUSES]}
            required
            invalid={invalid("status")}
          />
          <Field
            label="Monthly Salary"
            field="salary"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("salary")}
            type="number"
            min={0}
            step="0.01"
          />
        </Row>

        <SubHeading>Personal Information</SubHeading>
        <Row>
          <Field
            label="Last Name"
            field="last_name"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("last_name")}
          />
          <Field
            label="First Name"
            field="first_name"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("first_name")}
          />
        </Row>
        <Row>
          <Field
            label="Middle Name"
            field="middle_name"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Suffix"
            field="suffix"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Birthday"
            field="birthday"
            data={data}
            onChange={onChange}
            required
            invalid={invalid("birthday")}
            type="date"
          />
          <Field
            label="Birthplace"
            field="birthplace"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <SelectField
            label="Civil Status"
            field="civil_status"
            data={data}
            onChange={onChange}
            options={["Single", "Married", "Widowed", "Separated", "Divorced"]}
            required
            invalid={invalid("civil_status")}
          />
          <SelectField
            label="Gender"
            field="gender"
            data={data}
            onChange={onChange}
            options={["Male", "Female"]}
            required
            invalid={invalid("gender")}
          />
        </Row>
      </TabsContent>

      {/* ── Allowances ── */}
      <TabsContent value="allowances" className="space-y-4 pt-4">
        <p className="text-xs text-muted-foreground">
          Optional. Check the allowances this employee currently receives and
          enter the amount.
        </p>
        <div className="space-y-3">
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
                  id={`allowance_${type.key}`}
                />
                <Label
                  htmlFor={`allowance_${type.key}`}
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
      </TabsContent>

      {/* ── Government ID Numbers ── */}
      <TabsContent value="government" className="space-y-4 pt-4">
        <p className="text-xs text-muted-foreground">
          All fields in this section are optional.
        </p>
        <Row>
          <Field
            label="SSS Number"
            field="sss_number"
            data={data}
            onChange={onChange}
          />
          <Field
            label="PhilHealth Number"
            field="philhealth_number"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Pag-IBIG Number"
            field="pagibig_number"
            data={data}
            onChange={onChange}
          />
          <Field
            label="TIN Number"
            field="tin_number"
            data={data}
            onChange={onChange}
          />
        </Row>
      </TabsContent>

      {/* ── Family Information ── */}
      <TabsContent value="family" className="space-y-4 pt-4">
        <p className="text-xs text-muted-foreground">
          All fields in this section are optional.
        </p>

        <SubHeading>Mother&apos;s Maiden Name</SubHeading>
        <Row>
          <Field
            label="Last Name"
            field="m_last_name"
            data={data}
            onChange={onChange}
          />
          <Field
            label="First Name"
            field="m_first_name"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Middle Name"
            field="m_middle_name"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Suffix"
            field="m_suffix"
            data={data}
            onChange={onChange}
          />
        </Row>

        <SubHeading>Father&apos;s Name</SubHeading>
        <Row>
          <Field
            label="Last Name"
            field="f_last_name"
            data={data}
            onChange={onChange}
          />
          <Field
            label="First Name"
            field="f_first_name"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Middle Name"
            field="f_middle_name"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Suffix"
            field="f_suffix"
            data={data}
            onChange={onChange}
          />
        </Row>
      </TabsContent>

      {/* ── Contact Information ── */}
      <TabsContent value="contact" className="space-y-4 pt-4">
        <p className="text-xs text-muted-foreground">
          All fields in this section are optional.
        </p>
        <Row>
          <Field
            label="Mobile Number"
            field="mobile_number"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Email Address"
            field="email_address"
            data={data}
            onChange={onChange}
            type="email"
          />
        </Row>
        <Row>
          <Field
            label="House Number"
            field="house_number"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Street"
            field="street"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Village"
            field="village"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Subdivision"
            field="subdivision"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Barangay"
            field="barangay"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Region"
            field="region"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Province"
            field="province"
            data={data}
            onChange={onChange}
          />
          <Field
            label="City / Municipality"
            field="city_municipality"
            data={data}
            onChange={onChange}
          />
        </Row>
        <Row>
          <Field
            label="Zip Code"
            field="zip_code"
            data={data}
            onChange={onChange}
          />
          <div />
        </Row>
      </TabsContent>
    </Tabs>
  );
}
