// File: app/admin/employee-masterfile/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FilePlus2,
  FileStack,
  FileText,
  Loader,
  Search,
  Trash2,
  UserPlus,
  Users,
  Pencil,
  SlidersHorizontal,
  Briefcase,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Copy,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeForm } from "@/components/admin/employee-form";
import {
  type Employee,
  type EmployeeFormData,
  type EmployeeStatus,
  emptyEmployee,
  emptyAllowancesState,
  allowancesToFormState,
  buildEmployeeAllowances,
  REQUIRED_FIELDS,
  EMPLOYEE_STATUSES,
  STATUS_BADGE_CLASSES,
  getFullName,
} from "@/components/admin/employee-types";
import { CoeForm } from "@/components/admin/coe-form";
import {
  type CoeFormData,
  type EmployeeLookup,
  type CompanyKey,
  emptyCoeForm,
  buildAllowances,
  buildCoeFilename,
  applyMealAllowanceMonthlyTotal,
} from "@/components/admin/coe-types";
import { ClearanceDialog } from "@/components/admin/clearance-dialog";
import { ClearanceCertificateDialog } from "@/components/admin/clearance-certificate-dialog";

// The two downloadable formats for a generated certificate. "docx" stays the
// default so existing behavior (Word doc with employee's + employer's copy)
// doesn't change unless someone explicitly picks PDF.
type CoeDownloadFormat = "docx" | "pdf";

const ITEMS_PER_PAGE = 10;

const DOC_ACTION_GRADIENT = "bg-gradient-to-r from-blue-600 to-purple-600";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
// Short display name for the table row only — full first name, middle name
// collapsed to just its initial, full last name. Keeps getFullName() (used
// in dialogs/toasts) untouched.
const getShortName = (employee: Employee) => {
  const parts = [
    (employee as any).first_name,
    (employee as any).middle_name
      ? `${(employee as any).middle_name.trim().charAt(0).toUpperCase()}.`
      : null,
    (employee as any).last_name,
    (employee as any).suffix,
  ].filter(Boolean);

  return parts.join(" ") || getFullName(employee);
};
const formatCurrency = (value?: string | null) => {
  if (!value) return "—";
  const num = Number(value);

  if (isNaN(num)) return "—";

  return `₱${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// The clearance FORM's Section B/C template is saved per department (IT,
// Multimedia, Studio, Admin — see the Clearance Form Template page). An
// employee's masterfile "department" free-text field has to match one of
// those four keys for clearance generation to find the right template, so
// this normalizes it and flags anything that doesn't map cleanly.
const CLEARANCE_DEPARTMENT_LABELS: Record<string, string> = {
  it: "IT",
  multimedia: "Multimedia",
  studio: "Studio",
  admin: "Admin",
  sales: "Sales",
  management: "Management",
  marketing: "Marketing",
};

const normalizeClearanceDepartment = (
  department?: string | null,
): string | null => {
  if (!department) return null;
  const key = department.trim().toLowerCase();

  return key in CLEARANCE_DEPARTMENT_LABELS ? key : null;
};

export default function EmployeeMasterfilePage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Left-side status filter — "All" plus one tab per EMPLOYEE_STATUSES entry.
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "All">(
    "All",
  );

  const [viewRecord, setViewRecord] = useState<Employee | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyEmployee());
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof EmployeeFormData, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Row ids currently mid-flight on the quick status dropdown, so we can
  // disable just that row's select instead of the whole table.
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  // ── COE generation (per-employee, launched from the masterfile) ──
  const [coeDialogOpen, setCoeDialogOpen] = useState(false);
  const [coeTargetEmployee, setCoeTargetEmployee] = useState<Employee | null>(
    null,
  );
  const [coeFormData, setCoeFormData] = useState<CoeFormData>(emptyCoeForm());
  const [coeFormErrors, setCoeFormErrors] = useState<
    Partial<Record<keyof CoeFormData, boolean>>
  >({});

  // Which file type to hand back after generating — chosen in the dialog,
  // right next to the Generate & Download button.
  const [coeDownloadFormat, setCoeDownloadFormat] =
    useState<CoeDownloadFormat>("docx");

  const [coeLookupStatus, setCoeLookupStatus] = useState<
    "idle" | "loading" | "found" | "not_found"
  >("idle");
  const [coeSubmitting, setCoeSubmitting] = useState(false);
  const [coeDownloading, setCoeDownloading] = useState(false);

  // ── Clearance FORM generation (per-employee, same launch points as COE) ──
  // All the form state lives inside <ClearanceDialog />, the page only tracks
  // which employee it's open for.
  const [clearanceDialogOpen, setClearanceDialogOpen] = useState(false);
  const [clearanceTargetEmployee, setClearanceTargetEmployee] =
    useState<Employee | null>(null);

  // ── Employee Clearance CERTIFICATE generation (the final "cleared" document) ──
  // Same idea: the dialog owns its form state, the page tracks the employee.
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [certTargetEmployee, setCertTargetEmployee] = useState<Employee | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin/login");

      return;
    }
    fetchEmployees();
  }, [router]);

  // mount effect: auth only, the debounce effect does the first fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const fetchEmployees = async (search?: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = search
        ? `/api/employee-masterfile?search=${encodeURIComponent(search)}`
        : "/api/employee-masterfile";
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();

      // ignore responses from outdated requests
      if (requestId !== requestIdRef.current) return;
      setEmployees(data?.data ?? []);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      toast.error("Failed to load employee records");
      setEmployees([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  };

  // Debounced search: fetch immediately when cleared, otherwise wait 350ms.
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) return;

    const timeout = setTimeout(
      () => {
        fetchEmployees(searchQuery.trim() || undefined);
        setCurrentPage(1);
      },
      searchQuery.trim() ? 350 : 0,
    );

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // debounce-lite search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchEmployees(searchQuery || undefined);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Status filter tabs (client-side, over whatever the search already narrowed down) ──
  const statusCounts = EMPLOYEE_STATUSES.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s] = employees.filter((e) => e.status === s).length;

      return acc;
    },
    {},
  );

  const filteredEmployees = (
    statusFilter === "All"
      ? employees
      : employees.filter((e) => e.status === statusFilter)
  )
    .slice()
    .sort((a, b) =>
      String(a.id_number ?? "").localeCompare(
        String(b.id_number ?? ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      ),
    );

  const handleStatusFilterChange = (status: EmployeeStatus | "All") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const openAddDialog = () => {
    setEditingId(null);
    setFormData(emptyEmployee());
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditDialog = async (employee: Employee) => {
    setEditingId(employee.id);
    const token = localStorage.getItem("adminToken");
    const { id, created_at, updated_at, allowances, ...rest } = employee;

    let positionHistory: EmployeeFormData["position_history"] = [];

    try {
      const response = await fetch(`/api/employee-masterfile/${employee.id}/position-history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error("Failed to load employee position history.");
      }

      const data = await response.json();
      if (Array.isArray(data?.data)) {
        positionHistory = data.data.map(
          (entry: {
            action?: string;
            old_position?: string | null;
            new_position?: string | null;
            effective_date?: string | null;
          }) => ({
            action: entry.action === "Demote" ? "Demote" : "Promote",
            old_position: entry.old_position ?? "",
            new_position: entry.new_position ?? "",
            effective_date: entry.effective_date ?? "",
          }),
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load employee position history.",
      );
      positionHistory = [];
    }

    setFormData({
      ...rest,
      position_action: rest.position_action ?? "",
      new_position: rest.new_position ?? "",
      position_effective_date: rest.position_effective_date ?? "",
      position_history: positionHistory,
      allowances: allowancesToFormState(allowances),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFieldChange = (
    field: keyof EmployeeFormData,
    value: string | { action: "Promote" | "Demote"; new_position: string; effective_date: string }[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied to clipboard.");
    } catch {
      toast.error("Unable to copy email.");
    }
  };

  const handleAllowanceChange = (
    key: string,
    patch: Partial<{ checked: boolean; amount: string }>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [key]: { ...prev.allowances[key], ...patch },
      },
    }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof EmployeeFormData, boolean>> = {};

    for (const field of REQUIRED_FIELDS) {
      if (!formData[field] || String(formData[field]).trim() === "")
        errors[field] = true;
    }
    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill in the highlighted fields.");

      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingId
        ? `/api/employee-masterfile/${editingId}`
        : "/api/employee-masterfile";
      const method = editingId ? "PUT" : "POST";

      // The API expects allowances as EmployeeAllowance[], not the
      // checkbox/amount map the form uses internally — convert on the way out.
      const effectivePosition =
        formData.new_position && formData.new_position.trim()
          ? formData.new_position.trim()
          : formData.position;

      const pendingHistoryEntry =
        formData.new_position?.trim() && formData.position_effective_date
          ? {
            action:
              formData.position_action === "Demote" ? "Demote" : "Promote",
            new_position: formData.new_position.trim(),
            effective_date: formData.position_effective_date,
          }
          : null;

      const nextPositionHistory = pendingHistoryEntry
        ? [
          ...(formData.position_history ?? []).filter(
            (item) =>
              !(
                item.new_position === pendingHistoryEntry.new_position &&
                item.effective_date === pendingHistoryEntry.effective_date
              ),
          ),
          pendingHistoryEntry,
        ]
        : formData.position_history ?? [];

      const payload = {
        ...formData,
        position: effectivePosition,
        position_action: formData.position_action || undefined,
        new_position: formData.new_position || undefined,
        position_effective_date: formData.position_effective_date || undefined,
        position_history: nextPositionHistory.length
          ? nextPositionHistory
          : undefined,
        allowances: buildEmployeeAllowances(formData.allowances),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save employee record");
      }

      toast.success(editingId ? "Employee record updated!" : "Employee added!");
      setFormOpen(false);
      fetchEmployees(searchQuery || undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to save employee record");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick status change straight from the table row — no need to open the
  // full edit dialog just to flip Active -> On Leave etc. Optimistic update
  // with rollback if the PUT fails.
  const handleQuickStatusChange = async (
    employee: Employee,
    status: EmployeeStatus,
  ) => {
    if (status === employee.status) return;
    const previousStatus = employee.status;
    const token = localStorage.getItem("adminToken");

    setStatusUpdatingId(employee.id);
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? { ...e, status } : e)),
    );

    try {
      const { id, created_at, updated_at, ...rest } = employee;
      const payload = { ...rest, status };

      const response = await fetch(`/api/employee-masterfile/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to update status");
      }

      toast.success(`${getFullName(employee)} is now ${status}.`);
    } catch (error: any) {
      // roll back the optimistic update
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employee.id ? { ...e, status: previousStatus } : e,
        ),
      );
      toast.error(error.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    const token = localStorage.getItem("adminToken");

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/employee-masterfile/${recordToDelete.id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (!response.ok) throw new Error();
      toast.success(
        `${getFullName(recordToDelete)} removed from the masterfile`,
      );
      setEmployees((prev) => prev.filter((e) => e.id !== recordToDelete.id));
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch {
      toast.error("Failed to delete employee record");
    } finally {
      setDeleting(false);
    }
  };

  // ── COE generation helpers ──

  const openCoeDialog = (employee: Employee) => {
    setCoeTargetEmployee(employee);
    setCoeFormData({ ...emptyCoeForm(), id_number: employee.id_number });
    setCoeFormErrors({});
    setCoeLookupStatus("idle");
    setCoeDownloadFormat("docx");
    setCoeDialogOpen(true);
  };

  // ── Clearance FORM generation helper ──

  const openClearanceDialog = (employee: Employee) => {
    const deptKey = normalizeClearanceDepartment(employee.department);

    if (!deptKey) {
      toast.error(
        `No clearance form template for "${employee.department || "—"}". Set this employee's department to IT, Multimedia, Studio, or Admin first.`,
      );

      return;
    }
    setClearanceTargetEmployee(employee);
    setClearanceDialogOpen(true);
  };

  // ── Clearance CERTIFICATE generation helper ──

  const openCertDialog = (employee: Employee) => {
    setCertTargetEmployee(employee);
    setCertDialogOpen(true);
  };

  const handleCoeFieldChange = <K extends keyof CoeFormData>(
    field: K,
    value: CoeFormData[K],
  ) => {
    setCoeFormData((prev) => ({ ...prev, [field]: value }));
    if (coeFormErrors[field])
      setCoeFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  // Mirrors handleAllowanceChange on the masterfile form.
  const handleCoeAllowanceChange = (
    key: string,
    patch: Partial<{ checked: boolean; amount: string }>,
  ) => {
    setCoeFormData((prev) => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [key]: { ...prev.allowances[key], ...patch },
      },
    }));
  };

  useEffect(() => {
    if (!coeDialogOpen || !coeFormData.id_number) {
      return;
    }
    setCoeLookupStatus("loading");
    const t = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/employees/lookup?id_number=${encodeURIComponent(coeFormData.id_number)}`,
        );

        if (!response.ok) {
          setCoeLookupStatus("not_found");
          setCoeFormData((prev) => ({
            ...prev,
            employee_id: null,
            employee_name: "",
            department: "",
            position: "",
            date_hired: null,
            period_from: "",
            salary: "",
            allowances: emptyAllowancesState(),
          }));

          return;
        }
        const { data }: { data: EmployeeLookup } = await response.json();
        const dateHiredFormatted = data.date_hired
          ? data.date_hired.slice(0, 10)
          : null;

        setCoeLookupStatus("found");
        setCoeFormData((prev) => ({
          ...prev,
          employee_id: data.id,
          employee_name: data.full_name,
          department: data.department,
          position: data.position,
          date_hired: dateHiredFormatted,
          period_from: dateHiredFormatted || "",
          salary: data.salary ?? "",
          allowances: applyMealAllowanceMonthlyTotal(
            allowancesToFormState(data.allowances),
          ),
        }));
      } catch {
        setCoeLookupStatus("not_found");
      }
    }, 400);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coeDialogOpen, coeFormData.id_number]);

  const validateCoe = (): boolean => {
    const errors: Partial<Record<keyof CoeFormData, boolean>> = {};

    if (!coeFormData.employee_id) errors.employee_id = true;
    if (!coeFormData.salary) errors.salary = true;
    if (!coeFormData.period_from) errors.period_from = true;
    if (!coeFormData.period_to) errors.period_to = true;
    if (!coeFormData.issued_at) errors.issued_at = true;
    if (!coeFormData.signatory_name) errors.signatory_name = true;
    if (!coeFormData.signatory_title) errors.signatory_title = true;
    setCoeFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // `format` decides whether the download route hands back the .docx (with
  // both copies) or the .pdf twin — see app/api/admin/coe/[id]/download.
  const downloadCoe = async (
    id: number,
    filename: string,
    company: CompanyKey,
    format: CoeDownloadFormat,
  ) => {
    setCoeDownloading(true);
    try {
      const response = await fetch(
        `/api/admin/coe/${id}/download?company=${encodeURIComponent(company)}&format=${format}`,
      );

      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download =
        format === "pdf" ? filename.replace(/\.docx$/i, ".pdf") : filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download the certificate");
    } finally {
      setCoeDownloading(false);
    }
  };

  const handleCoeSubmit = async () => {
    if (!validateCoe()) {
      toast.error("Please fill in the highlighted fields.");

      return;
    }
    setCoeSubmitting(true);
    try {
      const response = await fetch("/api/admin/coe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: coeFormData.employee_id,
          salary: coeFormData.salary,
          allowances: buildAllowances(coeFormData),
          period_from: coeFormData.period_from,
          period_to: coeFormData.period_to,
          issued_at: coeFormData.issued_at,
          signatory_name: coeFormData.signatory_name,
          signatory_title: coeFormData.signatory_title,
        }),
      });
      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to create certificate");
      }

      toast.success(
        `${data.data.certificate_no} generated for ${data.data.employee_name}.`,
      );
      setCoeDialogOpen(false);
      downloadCoe(
        data.data.id,
        buildCoeFilename(data.data),
        coeFormData.company,
        coeDownloadFormat,
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to create certificate");
    } finally {
      setCoeSubmitting(false);
    }
  };

  type EmployeeSortKey =
    | "employee"
    | "id_number"
    | "department"
    | "position"
    | "date_hired"
    | "status";

  const [sortKey, setSortKey] = useState<EmployeeSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: EmployeeSortKey) => {
    if (sortKey !== key) {
      // First click: ascending
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      // Second click: descending
      setSortDirection("desc");
    } else {
      // Third click: reset to normal order
      setSortKey(null);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: EmployeeSortKey }) => {
    if (sortKey !== column) {
      return (
        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
      );
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const sortedEmployees = sortKey
    ? [...filteredEmployees].sort((a, b) => {
      let comparison = 0;

      if (sortKey === "employee") {
        comparison = getFullName(a).localeCompare(
          getFullName(b),
          undefined,
          { sensitivity: "base", numeric: true },
        );
      } else if (sortKey === "date_hired") {
        const dateA = a.date_hired
          ? new Date(a.date_hired).getTime()
          : Number.NaN;
        const dateB = b.date_hired
          ? new Date(b.date_hired).getTime()
          : Number.NaN;

        const validA = Number.isFinite(dateA);
        const validB = Number.isFinite(dateB);

        if (!validA && !validB) return 0;
        if (!validA) return 1;
        if (!validB) return -1;

        comparison = dateA - dateB;
      } else {
        const valueA = String(a[sortKey] ?? "");
        const valueB = String(b[sortKey] ?? "");

        comparison = valueA.localeCompare(valueB, undefined, {
          sensitivity: "base",
          numeric: true,
        });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    })
    : filteredEmployees;

  const totalPages = Math.ceil(
    filteredEmployees.length / ITEMS_PER_PAGE,
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginated = sortedEmployees.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    const last = Math.max(totalPages, 1);
    if (currentPage > last) setCurrentPage(last);
  }, [currentPage, totalPages]);

  if (initialLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading employee masterfile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg dark:from-blue-900 dark:to-purple-900">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Title and Record Summary */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-12 sm:w-12">
                  <Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Employee Masterfile
                  </h1>
                  <p className="mt-1 text-sm text-blue-100">
                    Manage and maintain employee records
                  </p>
                </div>
              </div>

              {/* Record Summary */}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-blue-100">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {filteredEmployees.length === 0 ? 0 : startIndex + 1}–
                    {Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      filteredEmployees.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {filteredEmployees.length}
                  </span>{" "}
                  records
                </span>

                <span className="hidden h-4 w-px bg-white/30 sm:block" />

                <span className="inline-flex items-center gap-2 text-blue-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    <span className="font-semibold text-white">
                      {employees.length}
                    </span>{" "}
                    total employees
                  </span>
                </span>
              </div>
            </div>

            {/* Add Employee Action */}
            <div className="flex w-full shrink-0 sm:w-auto">
              <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="h-11 w-full bg-white px-5 font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50 sm:w-auto"
                    onClick={openAddDialog}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                      {editingId ? "Edit Employee" : "Add New Employee"}
                    </DialogTitle>

                    <DialogDescription>
                      Fields marked <span className="text-red-500">*</span> are
                      required. Government ID numbers, family information, and
                      contact information are optional.
                    </DialogDescription>
                  </DialogHeader>

                  <EmployeeForm
                    data={formData}
                    errors={formErrors}
                    onAllowanceChange={handleAllowanceChange}
                    onChange={handleFieldChange}
                    showPositionChangeSection={!!editingId}
                  />

                  <DialogFooter className="mt-4 gap-2">
                    <Button
                      type="button"
                      disabled={submitting}
                      variant="outline"
                      onClick={() => setFormOpen(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      disabled={submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Employee"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 space-y-5 py-5 sm:py-8">
        {/* Employee Records Card */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="space-y-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
            {/* Search and Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  aria-label="Search employee records"
                  className="pl-9"
                  placeholder="Search by name, ID, department, or position"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label="Filter employees by status"
                      className="gap-2"
                      variant="outline"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {statusFilter !== "All" && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-700 px-1.5 text-xs font-semibold text-white">
                          1
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="z-[999] w-64 border border-gray-200 bg-white text-gray-900 shadow-xl opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  >

                    <DropdownMenuRadioGroup
                      value={statusFilter}
                      onValueChange={(value) => {
                        handleStatusFilterChange(
                          value as EmployeeStatus | "All",
                        );
                        setCurrentPage(1);
                      }}
                    >
                      <DropdownMenuRadioItem value="All">
                        <div className="flex w-full items-center justify-between gap-4">
                          <span>All Employees</span>
                          <span className="text-xs text-muted-foreground">
                            {employees.length}
                          </span>
                        </div>
                      </DropdownMenuRadioItem>

                      {EMPLOYEE_STATUSES.map((status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                          <div className="flex w-full items-center justify-between gap-4">
                            <span>{status}</span>
                            <span className="text-xs text-muted-foreground">
                              {statusCounts[status] ?? 0}
                            </span>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {(statusFilter !== "All" || searchQuery.trim() !== "") && (
                  <Button
                    className="shrink-0"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      handleStatusFilterChange("All");
                      setCurrentPage(1);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70">
                    <TableHead className="h-8 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        className="h-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleSort("id_number")}
                      >
                        ID Number <SortIcon column="id_number" />
                      </Button>
                    </TableHead>

                    <TableHead className="h-12 whitespace-nowrap px-5">
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleSort("employee")}
                      >
                        Employee <SortIcon column="employee" />
                      </Button>
                    </TableHead>

                    <TableHead className="hidden h-12 whitespace-nowrap md:table-cell">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleSort("department")}
                      >
                        Department <SortIcon column="department" />
                      </Button>
                    </TableHead>

                    <TableHead className="hidden h-12 whitespace-nowrap lg:table-cell">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleSort("position")}
                      >
                        Position <SortIcon column="position" />
                      </Button>
                    </TableHead>

                    <TableHead className="hidden h-12 whitespace-nowrap lg:table-cell">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleSort("date_hired")}
                      >
                        Date Hired <SortIcon column="date_hired" />
                      </Button>
                    </TableHead>

                    <TableHead className="h-12 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleSort("status")}
                      >
                        Status <SortIcon column="status" />
                      </Button>
                    </TableHead>

                    <TableHead className="h-12 whitespace-nowrap pr-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-64 text-center" colSpan={7}>
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <Users className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              No employee records found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Try adjusting your search or status filter.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((employee) => (
                      <TableRow
                        key={employee.id}
                        className="border-b border-slate-100 transition-colors hover:bg-blue-50/40 dark:border-slate-800/80 dark:hover:bg-slate-900/70"
                      >
                        {/* ID */}
                        <TableCell className="whitespace-nowrap font-mono text-sm text-slate-600 dark:text-slate-300">
                          {employee.id_number}
                        </TableCell>

                        {/* Employee Identity */}
                        <TableCell className="min-w-[210px] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-2 ring-white dark:bg-blue-950 dark:text-blue-300 dark:ring-slate-950">
                              {employee.first_name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[190px] truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {getShortName(employee)}
                              </p>
                              <div className="group/email mt-0.5 flex max-w-[190px] items-center gap-1">
                                <p
                                  className="min-w-0 flex-1 truncate text-xs text-slate-500"
                                  title={employee.email_address || undefined}
                                >
                                  {employee.email_address ||
                                    "No email provided"}
                                </p>
                                {employee.email_address && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Copy email ${employee.email_address}`}
                                    title="Copy email"
                                    className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover/email:opacity-100 focus-visible:opacity-100"
                                    onClick={() =>
                                      handleCopyEmail(employee.email_address!)
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Department */}
                        <TableCell className="hidden max-w-[200px] md:table-cell">
                          <span className="block truncate text-sm text-slate-600 dark:text-slate-300">
                            {employee.department || "—"}
                          </span>
                        </TableCell>

                        {/* Position */}
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex max-w-[190px] items-center gap-2">
                            <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="truncate text-sm text-slate-600 dark:text-slate-300">
                              {employee.position || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Date Hired */}
                        <TableCell className="hidden whitespace-nowrap text-sm text-slate-500 lg:table-cell">
                          {formatDate(employee.date_hired)}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="whitespace-nowrap">
                          <Select
                            disabled={statusUpdatingId === employee.id}
                            value={employee.status}
                            onValueChange={(v) =>
                              handleQuickStatusChange(
                                employee,
                                v as EmployeeStatus,
                              )
                            }
                          >
                            <SelectTrigger
                              className={`h-8 w-[110px] rounded-full px-2 py-1 text-xs font-semibold shadow-none focus:ring-0 focus:ring-offset-0 ${STATUS_BADGE_CLASSES[employee.status]}`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {statusUpdatingId === employee.id && (
                                  <Loader className="h-3 w-3 animate-spin" />
                                )}
                                <SelectValue />
                              </span>
                            </SelectTrigger>

                            <SelectContent
                              className="z-[999] border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              position="popper"
                            >
                              {EMPLOYEE_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="whitespace-nowrap pr-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              aria-label={`View ${getFullName(employee)}`}
                              className="h-9 w-9 rounded-lg border-slate-200 text-slate-600 shadow-none hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300"
                              size="icon"
                              title="View employee"
                              variant="outline"
                              onClick={() => setViewRecord(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Keep your existing Generate DropdownMenu here */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="h-9 gap-1.5 rounded-lg border-slate-200 px-2.5 shadow-none hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                  size="sm"
                                  variant="outline"
                                >
                                  <FileStack className="h-4 w-4" />
                                  <span className="hidden xl:inline">
                                    Files
                                  </span>
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="z-[999] w-60 border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                              >
                                <DropdownMenuItem
                                  onClick={() => openCoeDialog(employee)}
                                >
                                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                  Generate COE
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => openClearanceDialog(employee)}
                                >
                                  <ClipboardCheck className="mr-2 h-4 w-4 text-pink-600" />
                                  Generate Clearance Form
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => openCertDialog(employee)}
                                >
                                  <BadgeCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                  Generate Clearance Certificate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Keep your existing Edit Dialog */}
                            <Button
                              aria-label={`Edit ${getFullName(employee)}`}
                              className="h-9 w-9 rounded-lg border-slate-200 text-slate-600 shadow-none hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:text-slate-300"
                              size="icon"
                              title="Edit employee"
                              variant="outline"
                              onClick={() => openEditDialog(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Keep your existing Delete Dialog */}
                            <Dialog
                              open={
                                deleteDialogOpen &&
                                recordToDelete?.id === employee.id
                              }
                              onOpenChange={(open) => {
                                setDeleteDialogOpen(open);
                                if (!open) setRecordToDelete(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  aria-label={`Delete ${getFullName(employee)}`}
                                  className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 shadow-none hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700"
                                  size="icon"
                                  title="Delete employee"
                                  variant="outline"
                                  onClick={() => setRecordToDelete(employee)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>

                              <DialogContent className="max-w-md rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Delete Employee Record
                                  </DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                      {recordToDelete
                                        ? getFullName(recordToDelete)
                                        : getFullName(employee)}
                                    </span>
                                    &apos;s record? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>

                                <DialogFooter className="gap-2">
                                  <Button
                                    disabled={deleting}
                                    variant="outline"
                                    onClick={() => {
                                      setDeleteDialogOpen(false);
                                      setRecordToDelete(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    disabled={deleting}
                                    variant="destructive"
                                    onClick={handleDelete}
                                  >
                                    {deleting && (
                                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Delete Record
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-500">
                Page {currentPage} of {Math.max(totalPages, 1)}
                <span className="mx-2">·</span>
                {filteredEmployees.length} matching records
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    className="h-9 rounded-lg px-3"
                    disabled={currentPage === 1}
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    className="h-9 rounded-lg px-3"
                    disabled={currentPage === totalPages}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Employee Dialog */}
      <Dialog
        open={!!viewRecord}
        onOpenChange={(open) => {
          if (!open) setViewRecord(null);
        }}
      >
        <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-950 sm:w-full">
          {viewRecord && (
            <>
              <div className="relative shrink-0 border-b border-slate-200 px-5 py-5 pr-14 dark:border-slate-800 sm:px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {getShortName(viewRecord).charAt(0)?.toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                      {getFullName(viewRecord)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      ID Number: {viewRecord.id_number}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Employment
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      <InfoRow label="Department" value={viewRecord.department} />
                      <InfoRow label="Position" value={viewRecord.position} />
                      <InfoRow
                        label="Date Hired"
                        value={formatDate(viewRecord.date_hired)}
                      />
                      <InfoRow label="Status" value={viewRecord.status} />
                      <InfoRow
                        label="Salary"
                        value={formatCurrency(viewRecord.salary)}
                      />
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Personal Information
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      <InfoRow
                        label="Birthday"
                        value={formatDate(viewRecord.birthday)}
                      />
                      <InfoRow label="Birthplace" value={viewRecord.birthplace} />
                      <InfoRow
                        label="Civil Status"
                        value={viewRecord.civil_status}
                      />
                      <InfoRow label="Gender" value={viewRecord.gender} />
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Government ID Numbers
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      <InfoRow label="SSS" value={viewRecord.sss_number} />
                      <InfoRow
                        label="PhilHealth"
                        value={viewRecord.philhealth_number}
                      />
                      <InfoRow
                        label="Pag-IBIG"
                        value={viewRecord.pagibig_number}
                      />
                      <InfoRow label="TIN" value={viewRecord.tin_number} />
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Family Information
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      <InfoRow
                        label="Mother's Name"
                        value={[
                          viewRecord.m_first_name,
                          viewRecord.m_middle_name,
                          viewRecord.m_last_name,
                          viewRecord.m_suffix,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      <InfoRow
                        label="Father's Name"
                        value={[
                          viewRecord.f_first_name,
                          viewRecord.f_middle_name,
                          viewRecord.f_last_name,
                          viewRecord.f_suffix,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Contact Information
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      <InfoRow label="Mobile" value={viewRecord.mobile_number} />
                      <InfoRow label="Email" value={viewRecord.email_address} />
                      <div className="sm:col-span-2">
                        <InfoRow
                          label="Address"
                          value={[
                            viewRecord.house_number,
                            viewRecord.street,
                            viewRecord.village || viewRecord.subdivision,
                            viewRecord.barangay,
                            viewRecord.city_municipality,
                            viewRecord.province,
                            viewRecord.region,
                            viewRecord.zip_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        />
                      </div>
                    </div>
                  </div>

                  {viewRecord.allowances && viewRecord.allowances.length > 0 && (
                    <div className="pb-1">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Allowances
                      </p>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                        {viewRecord.allowances.map((a, i) => (
                          <InfoRow
                            key={`${a.label}-${i}`}
                            label={a.label}
                            value={formatCurrency(String(a.amount))}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-7">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    {
                      label: "COE",
                      icon: FilePlus2,
                      action: openCoeDialog,
                      className: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                    },
                    {
                      label: "Clearance Form",
                      icon: ClipboardCheck,
                      action: openClearanceDialog,
                      className: "from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
                    },
                    {
                      label: "Clearance Cert",
                      icon: BadgeCheck,
                      action: openCertDialog,
                      className: "from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600",
                    },
                  ].map(({ label, icon: Icon, action, className }) => (
                    <Button
                      key={label}
                      type="button"
                      title={label}
                      className={`h-auto min-h-11 min-w-0 whitespace-normal rounded-xl bg-gradient-to-r px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors sm:text-sm ${className}`}
                      onClick={() => {
                        const employee = viewRecord;
                        if (!employee) return;
                        setViewRecord(null);
                        action(employee);
                      }}
                    >
                      <span className="flex items-center justify-center gap-2 text-center">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{label}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Generate COE dialog, launched from a row's Eye view or its own icon ── */}
      <Dialog open={coeDialogOpen} onOpenChange={setCoeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FilePlus2 className="h-6 w-6 text-blue-600" />
              Generate COE
              {coeTargetEmployee ? ` — ${getFullName(coeTargetEmployee)}` : ""}
            </DialogTitle>
            <DialogDescription>
              Name, department, position, and period start are pulled from this
              employee&apos;s masterfile record. Salary, allowances, coverage end
              date, and signatory still need to be filled in. Choose Word or PDF
              below before generating.
            </DialogDescription>
          </DialogHeader>

          <CoeForm
            lockIdNumber
            data={coeFormData}
            errors={coeFormErrors}
            lookupStatus={coeLookupStatus}
            onAllowanceChange={handleCoeAllowanceChange}
            onChange={handleCoeFieldChange}
          />

          <DialogFooter className="mt-4 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-sm text-muted-foreground">Download as</span>
              <Select
                disabled={coeSubmitting || coeDownloading}
                value={coeDownloadFormat}
                onValueChange={(v) =>
                  setCoeDownloadFormat(v as CoeDownloadFormat)
                }
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docx">Word (.docx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={coeSubmitting || coeDownloading}
              variant="outline"
              onClick={() => setCoeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={coeSubmitting || coeDownloading}
              onClick={handleCoeSubmit}
            >
              {coeSubmitting || coeDownloading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {coeSubmitting ? "Generating..." : "Downloading..."}
                </>
              ) : (
                "Generate & Download"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Generate Clearance FORM dialog, same launch points as the COE one ── */}
      <ClearanceDialog
        employee={clearanceTargetEmployee}
        open={clearanceDialogOpen}
        onOpenChange={setClearanceDialogOpen}
      />

      {/* ── Generate Clearance (certificate) dialog, launched beside the form's buttons ── */}
      <ClearanceCertificateDialog
        employee={certTargetEmployee}
        open={certDialogOpen}
        onOpenChange={setCertDialogOpen}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">
        {value && value.trim() !== "" ? value : "—"}
      </p>
    </div>
  );
}
