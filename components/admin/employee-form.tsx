// File: components/admin/employee-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, RotateCcw, Trash2, Upload } from "lucide-react";
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
import {
  EmployeeImageViewer,
  EmployeePrivateImage,
  type EmployeeFileType,
} from "./employee-media";

const MAX_EMPLOYEE_IMAGE_SIZE =
  (Number(process.env.NEXT_PUBLIC_EMPLOYEE_IMAGE_MAX_KB) || 5120) * 1024;
const MAX_EMPLOYEE_IMAGE_SIZE_MB = MAX_EMPLOYEE_IMAGE_SIZE / (1024 * 1024);

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
  employeeId?: number | null;
  profileImageFile: File | null;
  signatureFile: File | null;
  profileImageRemoved: boolean;
  signatureRemoved: boolean;
  uploadingFiles: boolean;
  onProfileImageChange: (file: File | null) => void;
  onSignatureChange: (file: File | null) => void;
  onRemoveProfileImage: () => void;
  onRemoveSignature: () => void;
  onRestoreProfileImage: () => void;
  onRestoreSignature: () => void;
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
    "emergency_contact_name",
    "emergency_contact_mobile_number",
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

function EmployeeUploadField({
  label,
  fileType,
  accept,
  employeeId,
  storagePath,
  firstName,
  file,
  removed,
  uploading,
  onFileChange,
  onRemove,
  onRestore,
}: {
  label: string;
  fileType: EmployeeFileType;
  accept: string;
  employeeId?: number | null;
  storagePath?: string | null;
  firstName: string;
  file: File | null;
  removed: boolean;
  uploading: boolean;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  onRestore: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `employee-${fileType}-upload`;
  const isProfileImage = fileType === "profile-image";

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (selected: File | undefined, input: HTMLInputElement) => {
    input.value = "";
    if (!selected) return;

    const allowedTypes = isProfileImage
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(selected.type)) {
      toast.error(
        isProfileImage
          ? "Choose a JPG, PNG, or WEBP profile image."
          : "Choose a JPG or PNG signature image.",
      );
      return;
    }

    if (selected.size > MAX_EMPLOYEE_IMAGE_SIZE) {
      toast.error(
        `Each employee image must be ${MAX_EMPLOYEE_IMAGE_SIZE_MB} MB or smaller.`,
      );
      return;
    }

    onFileChange(selected);
  };

  const hasCurrentFile = Boolean(storagePath) && !removed;
  const showSavedFile = hasCurrentFile && !file;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300"
      >
        {label}
      </Label>
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center">
        <div
          className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden ${
            isProfileImage
              ? "rounded-full bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "rounded-md border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          }`}
        >
          {file && previewUrl ? (
            isProfileImage ? (
              <EmployeeImageViewer
                src={previewUrl}
                alt={`${label} preview`}
                downloadName={file?.name}
                className="absolute inset-0"
              >
                <img
                  src={previewUrl}
                  alt={`${label} preview`}
                  className="h-full w-full object-contain"
                />
              </EmployeeImageViewer>
            ) : (
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <>
              {isProfileImage ? (
                <span>{firstName.trim().charAt(0).toUpperCase() || "?"}</span>
              ) : (
                <span>No signature uploaded</span>
              )}
              {showSavedFile && employeeId && (
                <EmployeePrivateImage
                  employeeId={employeeId}
                  fileType={fileType}
                  storagePath={storagePath}
                  alt={`${label} preview`}
                  className="absolute inset-0 h-full w-full object-contain"
                  viewable={isProfileImage}
                />
              )}
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const input = event.currentTarget;
              handleFileChange(input.files?.[0], input);
            }}
          />
          <Button
            type="button"
            variant="outline"
            aria-label={`Upload or replace ${label.toLowerCase()}`}
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {file || hasCurrentFile ? "Replace" : "Upload"}
          </Button>

          {file && (
            <span className="max-w-full truncate text-xs text-slate-500 dark:text-slate-400">
              {file.name}
            </span>
          )}

          {removed ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={uploading}
              onClick={onRestore}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Undo remove
            </Button>
          ) : (
            (file || hasCurrentFile) && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={uploading}
                onClick={onRemove}
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            )
          )}

          {uploading && file && (
            <span
              className="inline-flex items-center gap-1 text-xs text-blue-600"
              role="status"
            >
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Uploading...
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {isProfileImage
          ? `JPG, PNG, or WEBP. Maximum size ${MAX_EMPLOYEE_IMAGE_SIZE_MB} MB.`
          : `PNG or JPG/JPEG. Maximum size ${MAX_EMPLOYEE_IMAGE_SIZE_MB} MB.`}
      </p>
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
  employeeId,
  profileImageFile,
  signatureFile,
  profileImageRemoved,
  signatureRemoved,
  uploadingFiles,
  onProfileImageChange,
  onSignatureChange,
  onRemoveProfileImage,
  onRemoveSignature,
  onRestoreProfileImage,
  onRestoreSignature,
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
        <div className="grid grid-cols-1 gap-4">
          <EmployeeUploadField
            label="Profile Image (Optional)"
            fileType="profile-image"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            employeeId={employeeId}
            storagePath={data.profile_image_path}
            firstName={data.first_name}
            file={profileImageFile}
            removed={profileImageRemoved}
            uploading={uploadingFiles}
            onFileChange={onProfileImageChange}
            onRemove={onRemoveProfileImage}
            onRestore={onRestoreProfileImage}
          />
          <EmployeeUploadField
            label="Employee Signature (Optional)"
            fileType="signature"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            employeeId={employeeId}
            storagePath={data.signature_path}
            firstName={data.first_name}
            file={signatureFile}
            removed={signatureRemoved}
            uploading={uploadingFiles}
            onFileChange={onSignatureChange}
            onRemove={onRemoveSignature}
            onRestore={onRestoreSignature}
          />
        </div>
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
            label="Emergency Contact Person"
            field="emergency_contact_name"
            data={data}
            onChange={onChange}
          />
          <Field
            label="Emergency Contact Mobile Number"
            field="emergency_contact_mobile_number"
            data={data}
            onChange={onChange}
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
