// File: components/admin/clearance-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardCheck, Loader, TriangleAlert } from "lucide-react";
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
import Link from "next/link";
import { getFullName, type Employee } from "@/components/admin/employee-types";
import { COMPANY_OPTIONS, type CompanyKey } from "@/components/admin/coe-types";
import {
  type ClearanceDocFormat,
  type ClearanceEmployeeInfo,
  type ClearancePayload,
  type ClearanceRecord,
  CLEARANCE_FORMAT_OPTIONS,
  buildClearanceFilename,
  splitItems,
} from "@/components/admin/clearance-types";

interface ClearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The masterfile row the clearance form is generated for. */
  employee: Employee | null;
  /** Fired after a successful save, so the list page can refresh. */
  onSaved?: (record: ClearanceRecord) => void;
}

interface TemplateResponse {
  units: { unit: string; items: string }[];
  properties: { item: string }[];
  updated_at: string | null;
}

const authHeaders = () => {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const AutoField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium break-words">{value || "—"}</p>
  </div>
);

export function ClearanceDialog({
  open,
  onOpenChange,
  employee,
  onSaved,
}: ClearanceDialogProps) {
  const [units, setUnits] = useState<{ unit: string; items: string }[]>([]);
  const [properties, setProperties] = useState<{ item: string }[]>([]);
  const [templateSavedAt, setTemplateSavedAt] = useState<string | null>(null);
  const [hasTemplate, setHasTemplate] = useState(true);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  const [company, setCompany] = useState<CompanyKey>("infinitech");
  const [format, setFormat] = useState<ClearanceDocFormat>("docx");
  const [saving, setSaving] = useState(false);
  // Tracks the record created by this dialog session, so a retry after a
  // failed download PUTs/updates instead of POSTing a second clearance form.
  const [savedRecord, setSavedRecord] = useState<ClearanceRecord | null>(null);

  // Fresh fetch of the shared template every time the dialog opens for an
  // employee — Section B/C are no longer edited per-generation, they always
  // reflect whatever was last saved on the Clearance Form Template page.
  useEffect(() => {
    if (!open || !employee) return;

    setCompany("infinitech");
    setFormat("docx");
    setSavedRecord(null);
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee]);

  const fetchTemplate = async () => {
    setLoadingTemplate(true);
    try {
      const res = await fetch("/api/admin/clearance-template", {
        headers: authHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(
          json?.message || "Failed to load the clearance template",
        );
      }
      const data: TemplateResponse = json.data;
      setUnits(data.units);
      setProperties(data.properties);
      setTemplateSavedAt(data.updated_at);
      setHasTemplate(data.units.length > 0 && data.properties.length > 0);
    } catch (error: any) {
      toast.error(
        error.message || "Failed to load the clearance form template",
      );
      setHasTemplate(false);
    } finally {
      setLoadingTemplate(false);
    }
  };

  if (!employee) return null;

  // Section A — straight from the masterfile record, nothing to type.
  const info: ClearanceEmployeeInfo = {
    employee_id: employee.id,
    employee_name: getFullName(employee),
    id_number: employee.id_number,
    position: employee.position,
    department: employee.department,
  };

  const handleGenerate = async () => {
    if (!hasTemplate) return;

    setSaving(true);
    try {
      const headers = authHeaders();
      const payload: ClearancePayload = { employee: info, units, properties };
      const target = savedRecord;

      // 1 · Save to Laravel first, so nothing gets printed that isn't on
      // file.
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

      toast.success(
        `${savedRow.clearance_no} for ${info.employee_name} saved and downloaded.`,
      );
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate the clearance form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      {/*
        Layout: header (fixed) / body (scrolls) / footer (fixed).
        - 100dvh-based height so mobile browser bars don't cut the footer off
        - near full-width on phones, max-w-3xl on larger screens
      */}
      <DialogContent className="flex flex-col gap-0 p-0 overflow-hidden w-[calc(100vw-1rem)] max-w-3xl max-h-[92dvh]">
        <DialogHeader className="space-y-1 border-b px-4 sm:px-6 pt-5 pb-4 pr-12 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-purple-600" />
            <span className="truncate">Generate Clearance Form</span>
          </DialogTitle>
          <DialogDescription className="truncate">
            {info.employee_name} · {info.id_number}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {loadingTemplate ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Loading clearance template...
            </div>
          ) : !hasTemplate ? (
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-4 py-4 text-sm text-amber-800 dark:text-amber-200 flex gap-3">
              <TriangleAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>
                  No clearance form template has been set up yet. Set it up
                  first, then come back here to generate.
                </p>
                <Link
                  href="/admin/employee-clearance-form"
                  className="inline-block font-semibold underline underline-offset-2"
                >
                  Go to Clearance Form Template
                </Link>
              </div>
            </div>
          ) : (
            <>
              <section className="rounded-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-2.5 border-b">
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    A. Employee and Separation Information
                  </h3>
                </div>
                <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <AutoField label="Employee Name" value={info.employee_name} />
                  <AutoField label="Employee ID" value={info.id_number} />
                  <AutoField label="Position" value={info.position} />
                  <AutoField label="Department" value={info.department} />
                </div>
              </section>

              <section className="rounded-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-2.5 border-b">
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    B. Departmental Clearance ({units.length})
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-2">
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
                </div>
              </section>

              <section className="rounded-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-2.5 border-b">
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    C. Property and Access Turnover ({properties.length})
                  </h3>
                </div>
                <div className="p-3 sm:p-4">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5 text-sm">
                    {properties.map((p, i) => (
                      <li key={i} className="break-words">
                        {p.item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Sections B and C come from the shared clearance form template
                  {templateSavedAt
                    ? ` (last updated ${new Date(templateSavedAt).toLocaleDateString()})`
                    : ""}
                  .
                </span>
                <Link
                  href="/admin/employee-clearance-form"
                  className="shrink-0 font-medium text-blue-600 hover:underline"
                >
                  Edit template
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t bg-background px-4 sm:px-6 py-3">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <div className="flex flex-1 flex-wrap items-center gap-2 sm:ml-auto sm:flex-none sm:justify-end">
            <Select
              value={company}
              disabled={saving || !hasTemplate}
              onValueChange={(v) => setCompany(v as CompanyKey)}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={format}
              disabled={saving || !hasTemplate}
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
              disabled={saving || loadingTemplate || !hasTemplate}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
