// File: components/admin/clearance-dialog.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { ClearanceForm } from "@/components/admin/clearance-form";
import { ClearanceStepper } from "@/components/admin/clearance-stepper";
import { getFullName, type Employee } from "@/components/admin/employee-types";
import {
  CLEARANCE_FORMAT_OPTIONS,
  CLEARANCE_STEPS,
  type ClearanceDocFormat,
  type ClearanceEmployeeInfo,
  type ClearanceFormData,
  type ClearancePayload,
  type ClearanceRecord,
  buildClearanceFilename,
  emptyClearanceForm,
  formToData,
  prepareClearance,
} from "@/components/admin/clearance-types";

// This dialog is the Clearance FORM (Sections A/B/C checklist). The final
// Employee Clearance Certificate has its own dialog: clearance-certificate-dialog.tsx.

interface ClearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The masterfile row the clearance form is generated for. */
  employee: Employee | null;
  /** Pass an existing record to edit it (PUT); omit to create a new one (POST). */
  record?: ClearanceRecord | null;
  /** Fired after a successful save, so the list page can refresh. */
  onSaved?: (record: ClearanceRecord) => void;
}

const LAST_STEP = CLEARANCE_STEPS.length - 1;

export function ClearanceDialog({
  open,
  onOpenChange,
  employee,
  record = null,
  onSaved,
}: ClearanceDialogProps) {
  const { toast } = useToast();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ClearanceFormData>(emptyClearanceForm());
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [format, setFormat] = useState<ClearanceDocFormat>("docx");
  const [saving, setSaving] = useState(false);
  // Tracks the record created by this dialog session, so a retry after a
  // failed download PUTs/updates instead of POSTing a second clearance form.
  const [savedRecord, setSavedRecord] = useState<ClearanceRecord | null>(
    record,
  );

  // Fresh defaults every time the dialog opens — or the saved rows when an
  // existing clearance form was handed in (Section C preset follows the department).
  useEffect(() => {
    if (open && employee) {
      setForm(
        record
          ? formToData(record.units, record.properties)
          : emptyClearanceForm(employee.department),
      );
      setSavedRecord(record);
      setFormat("docx");
      setErrors({});
      setStep(0);
    }
  }, [open, employee, record]);

  // Each step starts at the top of the scroll area.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  if (!employee) return null;

  // Section A — straight from the masterfile record, nothing to type.
  const info: ClearanceEmployeeInfo = {
    employee_id: employee.id,
    employee_name: getFullName(employee),
    id_number: employee.id_number,
    position: employee.position,
    department: employee.department,
  };

  const handleChange = (next: ClearanceFormData) => {
    setForm(next);
    if (Object.keys(errors).length) setErrors({}); // clear red borders on edit
  };

  const fail = (title: string, description: string) =>
    toast({ title, description, variant: "destructive" });

  // Checks one step; returns true when it's OK to move past it.
  const validateStep = (index: number): boolean => {
    const { errors: found, units, properties } = prepareClearance(form);

    if (index === 1) {
      setErrors(found);
      if (Object.keys(found).length > 0) {
        fail(
          "Missing required fields",
          "Each Responsible Unit needs a name and at least one item to verify.",
        );
        return false;
      }
      if (units.length === 0) {
        fail("Section B is empty", "Add at least one Responsible Unit.");
        return false;
      }
    }
    if (index === 2 && properties.length === 0) {
      fail("Section C is empty", "Add at least one property item.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const handleGenerate = async () => {
    // Re-check B and C in case something was edited from the Review step.
    if (!validateStep(1)) return setStep(1);
    if (!validateStep(2)) return setStep(2);
    const { units, properties, company } = prepareClearance(form);

    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const payload: ClearancePayload = { employee: info, units, properties };
      const target = savedRecord;

      // 1 · Save to Laravel first, so nothing gets printed that isn't on
      // file. `company` is not part of ClearancePayload — it only matters
      // for the file below, never for what's stored.
      const saveResponse = await fetch(
        target ? `/api/admin/clearance/${target.id}` : "/api/admin/clearance",
        {
          method: target ? "PUT" : "POST",
          headers,
          body: JSON.stringify(payload),
        },
      );
      const saved = await saveResponse.json().catch(() => null);

      if (!saveResponse.ok || !saved?.success) {
        throw new Error(saved?.message || "Failed to save the clearance form");
      }

      const savedRow = saved.data as ClearanceRecord;
      setSavedRecord(savedRow); // remembers it so a retry updates, not duplicates
      onSaved?.(savedRow);

      // 2 · Then build the file — Word or PDF, with the chosen company's
      // letterhead — from the same payload.
      const response = await fetch("/api/admin/clearance/download", {
        method: "POST",
        headers,
        body: JSON.stringify({ ...payload, company, format }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(
          err?.message ||
            "Clearance form saved, but the document failed to build",
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildClearanceFilename(
        info.employee_name,
        info.id_number,
        format,
      );
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: target ? "Clearance form updated" : "Clearance form generated",
        description: `${savedRow.clearance_no} for ${info.employee_name} saved and downloaded.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      fail("Error", error.message || "Failed to generate the clearance form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      {/*
        Layout: header (fixed) / body (scrolls) / footer (fixed).
        - 100dvh-based height so mobile browser bars don't cut the footer off
        - near full-width on phones, max-w-5xl on larger screens
      */}
      <DialogContent className="flex flex-col gap-0 p-0 overflow-hidden w-[calc(100vw-1rem)] max-w-5xl max-h-[92dvh]">
        <DialogHeader className="space-y-3 border-b px-4 sm:px-6 pt-5 pb-4 pr-12 text-left">
          <div>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-purple-600" />
              <span className="truncate">
                {savedRecord
                  ? "Edit Clearance Form"
                  : "Generate Clearance Form"}
              </span>
            </DialogTitle>
            <DialogDescription className="truncate">
              {info.employee_name} · {info.id_number}
              {savedRecord ? ` · ${savedRecord.clearance_no}` : ""}
            </DialogDescription>
          </div>
          <ClearanceStepper
            steps={CLEARANCE_STEPS}
            current={step}
            onStepClick={setStep}
            disabled={saving}
          />
        </DialogHeader>

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4"
        >
          <ClearanceForm
            step={step}
            employee={info}
            data={form}
            onChange={handleChange}
            errors={errors}
            disabled={saving}
            onEditStep={setStep}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t bg-background px-4 sm:px-6 py-3">
          {step === 0 ? (
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}

          {step < LAST_STEP ? (
            <Button
              onClick={handleNext}
              className="flex-1 sm:flex-none sm:ml-auto bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <div className="flex flex-1 flex-wrap items-center gap-2 sm:ml-auto sm:flex-none sm:justify-end">
              <Select
                value={format}
                disabled={saving}
                onValueChange={(v) => setFormat(v as ClearanceDocFormat)}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLEARANCE_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleGenerate}
                disabled={saving}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Download"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
