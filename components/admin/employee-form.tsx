// File: components/admin/employee-form.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EmployeeFormData } from "./employee-types";

interface Props {
  data: EmployeeFormData;
  onChange: (field: keyof EmployeeFormData, value: string) => void;
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
    "last_name",
    "first_name",
    "middle_name",
    "suffix",
    "birthday",
    "birthplace",
    "civil_status",
    "gender",
  ],
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
}: {
  label: string;
  field: keyof EmployeeFormData;
  data: EmployeeFormData;
  onChange: Props["onChange"];
  required?: boolean;
  invalid?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
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

/**
 * Employee Masterfile form, split into tabs so each section (Employee Info,
 * Government IDs, Family Info, Contact Info) is viewed on its own instead of
 * everything crammed into one wide two-column grid.
 */
export function EmployeeForm({ data, onChange, errors = {} }: Props) {
  const invalid = (f: keyof EmployeeFormData) => !!errors[f];
  const sectionHasError = (section: string) =>
    SECTION_FIELDS[section].some((f) => errors[f]);

  return (
    <Tabs defaultValue="employee" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger
          value="employee"
          className={sectionHasError("employee") ? "text-red-500" : ""}
        >
          Employee Info
        </TabsTrigger>
        <TabsTrigger
          value="government"
          className={sectionHasError("government") ? "text-red-500" : ""}
        >
          Government IDs
        </TabsTrigger>
        <TabsTrigger
          value="family"
          className={sectionHasError("family") ? "text-red-500" : ""}
        >
          Family Info
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className={sectionHasError("contact") ? "text-red-500" : ""}
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

        <SubHeading>Mother's Maiden Name</SubHeading>
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

        <SubHeading>Father's Name</SubHeading>
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
