// File: components/admin/clearance-certificate-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getFullName, type Employee } from "@/components/admin/employee-types";
// Same company list/type the COE and Clearance Form flows already use, so
// every company dropdown in the app shows the same options and labels.
import { COMPANY_OPTIONS, type CompanyKey } from "@/components/admin/coe-types";

type CertFormat = "docx" | "pdf";

interface ClearanceCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The masterfile row the certificate is generated for. */
  employee: Employee | null;
}

// Local calendar date as YYYY-MM-DD (toISOString would shift it to UTC).
const todayISO = () => new Date().toLocaleDateString("en-CA");

// Mirrors ClearanceCertificate::START_AT (56) on the Laravel side. Shown as
// a fallback if the next-number lookup fails, so the admin always sees a
// concrete number instead of a vague placeholder. The real, authoritative
// number always comes from Laravel — this is just what it'll be before any
// certificate has ever been issued.
const DEFAULT_CERTIFICATE_NO = "CL - 0056";

export function ClearanceCertificateDialog({
  open,
  onOpenChange,
  employee,
}: ClearanceCertificateDialogProps) {
  const { toast } = useToast();

  const [company, setCompany] = useState<CompanyKey>("abic");
  // certificate_no is server-assigned (Laravel), never typed by the admin.
  // This just previews what it WILL be — the real one is only locked in
  // when Generate is clicked and the record is actually saved.
  const [nextCertificateNo, setNextCertificateNo] = useState<string>(
    DEFAULT_CERTIFICATE_NO,
  );
  const [certNoIsFallback, setCertNoIsFallback] = useState(false);
  const [loadingCertNo, setLoadingCertNo] = useState(false);
  const [lastWorkingDay, setLastWorkingDay] = useState("");
  const [dateIssued, setDateIssued] = useState(todayISO());
  // Blank = the server falls back to the default HR signatory.
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [format, setFormat] = useState<CertFormat>("pdf");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);

  // Fresh form every time the dialog opens, and fetch the next certificate
  // number so the admin can see it before generating.
  useEffect(() => {
    if (open) {
      setCompany("abic");
      setNextCertificateNo(DEFAULT_CERTIFICATE_NO);
      setCertNoIsFallback(false);
      setLastWorkingDay("");
      setDateIssued(todayISO());
      setSignatoryName("");
      setSignatoryTitle("");
      setFormat("pdf");
      setErrors({});
      fetchNextCertificateNo();
    }
  }, [open, employee]);

  const fetchNextCertificateNo = async () => {
    setLoadingCertNo(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "/api/admin/employee-clearance/next-number",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      setNextCertificateNo(data.certificate_no || DEFAULT_CERTIFICATE_NO);
      setCertNoIsFallback(!data.certificate_no);
    } catch {
      setNextCertificateNo(DEFAULT_CERTIFICATE_NO);
      setCertNoIsFallback(true);
      toast({
        title: "Couldn't fetch next certificate number",
        description:
          "Showing the default — it will still be assigned automatically when you generate.",
        variant: "destructive",
      });
    } finally {
      setLoadingCertNo(false);
    }
  };

  if (!employee) return null;

  const clearError = (key: string) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));

  const handleGenerate = async () => {
    const found: Record<string, boolean> = {};
    if (!lastWorkingDay) found.lastWorkingDay = true;
    if (!dateIssued) found.dateIssued = true;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the highlighted fields.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/employee-clearance/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          company,
          // No certificate_no sent — Laravel assigns it when the record
          // is saved, atomically, avoiding any race between two admins.
          employee_name: getFullName(employee),
          id_number: employee.id_number,
          position: employee.position,
          department: employee.department,
          last_working_day: lastWorkingDay,
          date_issued: dateIssued,
          signatory_name: signatoryName.trim() || undefined,
          signatory_title: signatoryTitle.trim() || undefined,
          format,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(
          err?.message || "Failed to generate the clearance certificate",
        );
      }

      // The route names the file (CL_-_0056_-_Full_Name.pdf) in Content-Disposition.
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
      const filename = match
        ? decodeURIComponent(match[1])
        : `Clearance_Certificate_${employee.id_number}.${format}`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Clearance certificate generated",
        description: `${filename} downloaded for ${getFullName(employee)}.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to generate the clearance certificate",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // min-w-0 + w-full: inputs (date inputs especially) have an intrinsic width
  // that otherwise pushes the dialog wider than the screen.
  const inputClass = (key: string) =>
    `w-full min-w-0 ${errors[key] ? "border-red-500 focus-visible:ring-red-500" : ""}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !generating && onOpenChange(v)}>
      {/*
        Layout: header (fixed) / body (scrolls) / footer (fixed) — same pattern
        as the clearance form dialog, so it fits any screen:
        - near full-width on phones, max-w-lg on larger screens
        - 100dvh-based height so mobile browser bars don't cut the footer off
        - never scrolls sideways
      */}
      <DialogContent className="flex flex-col gap-0 p-0 overflow-hidden w-[calc(100vw-1rem)] max-w-lg max-h-[92dvh]">
        <DialogHeader className="space-y-1 border-b px-4 sm:px-6 pt-5 pb-4 pr-12 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-emerald-600" />
            <span className="truncate">Generate Clearance</span>
          </DialogTitle>
          <DialogDescription className="break-words">
            <span className="font-medium text-foreground">
              {getFullName(employee)} · {employee.id_number}
            </span>
            <br />
            Name, ID, position, and department come from the masterfile.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-4">
          <Field label="Certificate No.">
            <div className="flex h-10 w-full min-w-0 items-center rounded-md border bg-muted/50 px-3 text-sm">
              {loadingCertNo ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader className="h-3.5 w-3.5 animate-spin" /> Fetching next
                  number…
                </span>
              ) : nextCertificateNo ? (
                <span className="font-medium">{nextCertificateNo}</span>
              ) : (
                <span className="text-muted-foreground">
                  Will be assigned automatically
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-assigned, sequential — not editable. This is a preview; the
              final number is locked in when you click Generate.
            </p>
          </Field>

          <Field label="Company" required>
            <Select
              value={company}
              onValueChange={(v) => setCompany(v as CompanyKey)}
              disabled={generating}
            >
              <SelectTrigger className="w-full min-w-0">
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
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Last Working Day" required>
              <Input
                type="date"
                value={lastWorkingDay}
                disabled={generating}
                className={inputClass("lastWorkingDay")}
                onChange={(e) => {
                  setLastWorkingDay(e.target.value);
                  clearError("lastWorkingDay");
                }}
              />
            </Field>
            <Field label="Date Issued" required>
              <Input
                type="date"
                value={dateIssued}
                disabled={generating}
                className={inputClass("dateIssued")}
                onChange={(e) => {
                  setDateIssued(e.target.value);
                  clearError("dateIssued");
                }}
              />
            </Field>
          </div>

          <div className="rounded-lg border bg-slate-50/60 dark:bg-slate-900/40 p-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Signatory (optional). Leave blank to use the default HR signatory.
            </p>
            <Field label="Signatory Name">
              <Input
                value={signatoryName}
                placeholder="Maria Krissa Charez R. Bongon"
                disabled={generating}
                className="w-full min-w-0"
                onChange={(e) => setSignatoryName(e.target.value)}
              />
            </Field>
            <Field label="Signatory Title">
              <Input
                value={signatoryTitle}
                placeholder="Executive Assistant to the CEO / Human Resource Officer"
                disabled={generating}
                className="w-full min-w-0"
                onChange={(e) => setSignatoryTitle(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Footer: two simple rows, so nothing can overlap at any width. */}
        <div className="space-y-3 border-t bg-background px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
              Download as
            </span>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as CertFormat)}
              disabled={generating}
            >
              <SelectTrigger className="h-9 min-w-0 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                <SelectItem value="docx">Word (.docx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {generating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate & Download"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
