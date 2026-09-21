// File: app/admin/employee-masterfile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePlus2,
  FileText,
  Loader,
  Search,
  Trash2,
  UserPlus,
  Users,
  Pencil,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
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
} from "@/components/admin/coe-types";

// The two downloadable formats for a generated certificate. "docx" stays the
// default so existing behavior (Word doc with employee's + employer's copy)
// doesn't change unless someone explicitly picks PDF.
type CoeDownloadFormat = "docx" | "pdf";

const ITEMS_PER_PAGE = 10;

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

const formatCurrency = (value?: string | null) => {
  if (!value) return "—";
  const num = Number(value);
  if (isNaN(num)) return "—";
  return `₱${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function EmployeeMasterfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchEmployees();
  }, [router]);

  const fetchEmployees = async (search?: string) => {
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
      setEmployees(data?.data ?? []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employee records",
        variant: "destructive",
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

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

  const openEditDialog = (employee: Employee) => {
    setEditingId(employee.id);
    // `employee.allowances` is EmployeeAllowance[] | null (the API shape);
    // the form needs the checkbox/amount map, so convert it here rather than
    // spreading the raw record straight into formData.
    const { id, created_at, updated_at, allowances, ...rest } = employee;
    setFormData({
      ...rest,
      allowances: allowancesToFormState(allowances),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFieldChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: false }));
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
      toast({
        title: "Missing required fields",
        description: "Please fill in the highlighted fields.",
        variant: "destructive",
      });
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
      const payload = {
        ...formData,
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

      toast({
        title: "Success",
        description: editingId ? "Employee record updated!" : "Employee added!",
      });
      setFormOpen(false);
      fetchEmployees(searchQuery || undefined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee record",
        variant: "destructive",
      });
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

      toast({
        title: "Status updated",
        description: `${getFullName(employee)} is now ${status}.`,
      });
    } catch (error: any) {
      // roll back the optimistic update
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employee.id ? { ...e, status: previousStatus } : e,
        ),
      );
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: `${getFullName(recordToDelete)} removed from the masterfile`,
      });
      setEmployees((prev) => prev.filter((e) => e.id !== recordToDelete.id));
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete employee record",
        variant: "destructive",
      });
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
          allowances: allowancesToFormState(data.allowances),
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
      toast({
        title: "Error",
        description: "Failed to download the certificate",
        variant: "destructive",
      });
    } finally {
      setCoeDownloading(false);
    }
  };

  const handleCoeSubmit = async () => {
    if (!validateCoe()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the highlighted fields.",
        variant: "destructive",
      });
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

      toast({
        title: "Certificate created",
        description: `${data.data.certificate_no} generated for ${data.data.employee_name}.`,
      });
      setCoeDialogOpen(false);
      downloadCoe(
        data.data.id,
        buildCoeFilename(data.data),
        coeFormData.company,
        coeDownloadFormat,
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create certificate",
        variant: "destructive",
      });
    } finally {
      setCoeSubmitting(false);
    }
  };

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredEmployees.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (loading && employees.length === 0) {
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="h-8 w-8 sm:h-10 sm:w-10" />
                Employee Masterfile
              </h1>
              <p className="text-blue-100">Manage employee 201 records</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Add / Edit dialog */}
              <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white hover:bg-gray-100 text-blue-900"
                    onClick={openAddDialog}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
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
                    onChange={handleFieldChange}
                    onAllowanceChange={handleAllowanceChange}
                    errors={formErrors}
                  />

                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setFormOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {submitting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Link href="/admin/dashboard">
                <Button
                  variant="secondary"
                  className="bg-white hover:bg-gray-100 text-blue-900"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── STAT CARD ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Total Employees
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {employees.length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── TABLE + LEFT STATUS FILTER ── */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Records
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {filteredEmployees.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredEmployees.length,
                  )}{" "}
                  of {filteredEmployees.length}
                  {statusFilter !== "All" ? ` (${statusFilter})` : ""}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID number, position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2"
                />
              </div>
            </div>
          </CardHeader>

          <div className="flex flex-col lg:flex-row">
            {/* Left-side status filter tabs */}
            <aside className="lg:w-52 shrink-0 border-b lg:border-b-0 lg:border-r bg-slate-50/60 dark:bg-slate-900/40 p-3 space-y-1">
              <FilterTab
                label="All"
                count={employees.length}
                active={statusFilter === "All"}
                onClick={() => handleStatusFilterChange("All")}
              />
              {EMPLOYEE_STATUSES.map((status) => (
                <FilterTab
                  key={status}
                  label={status}
                  count={statusCounts[status] ?? 0}
                  active={statusFilter === status}
                  badgeClass={STATUS_BADGE_CLASSES[status]}
                  onClick={() => handleStatusFilterChange(status)}
                />
              ))}
            </aside>

            <CardContent className="p-0 overflow-hidden flex-1">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-semibold">ID Number</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        Department
                      </TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        Position
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        Date Hired
                      </TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">
                              No employee records found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((employee) => (
                        <TableRow
                          key={employee.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        >
                          <TableCell className="font-mono text-sm">
                            {employee.id_number}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {employee.first_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </div>
                              <span className="truncate">
                                {getFullName(employee)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {employee.department}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                              {employee.position}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {formatDate(employee.date_hired)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                            {employee.mobile_number && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {employee.mobile_number}
                              </div>
                            )}
                            {employee.email_address && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {employee.email_address}
                              </div>
                            )}
                            {!employee.mobile_number &&
                              !employee.email_address &&
                              "—"}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={employee.status}
                              onValueChange={(v) =>
                                handleQuickStatusChange(
                                  employee,
                                  v as EmployeeStatus,
                                )
                              }
                              disabled={statusUpdatingId === employee.id}
                            >
                              <SelectTrigger className="h-8 w-[130px] border-0 bg-transparent p-0 shadow-none focus:ring-0">
                                <SelectValue asChild>
                                  <Badge
                                    variant="outline"
                                    className={`${STATUS_BADGE_CLASSES[employee.status]} cursor-pointer`}
                                  >
                                    {statusUpdatingId === employee.id && (
                                      <Loader className="h-3 w-3 mr-1 animate-spin" />
                                    )}
                                    {employee.status}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent
                                position="popper"
                                className="z-[999] !bg-slate-900 !border-slate-700 !opacity-100 !text-white shadow-xl"
                              >
                                {EMPLOYEE_STATUSES.map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="!text-white focus:!bg-slate-700 focus:!text-white"
                                  >
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* View */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewRecord(employee)}
                                    className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                      <Users className="h-6 w-6 text-blue-600" />
                                      {viewRecord
                                        ? getFullName(viewRecord)
                                        : "Employee"}
                                    </DialogTitle>
                                    <DialogDescription>
                                      ID Number: {viewRecord?.id_number}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {viewRecord && (
                                    <div className="space-y-3 text-sm">
                                      <Section title="Employment">
                                        <InfoRow
                                          label="Department"
                                          value={viewRecord.department}
                                        />
                                        <InfoRow
                                          label="Position"
                                          value={viewRecord.position}
                                        />
                                        <InfoRow
                                          label="Date Hired"
                                          value={formatDate(
                                            viewRecord.date_hired,
                                          )}
                                        />
                                        <InfoRow
                                          label="Status"
                                          value={viewRecord.status}
                                        />
                                        <InfoRow
                                          label="Salary"
                                          value={formatCurrency(
                                            viewRecord.salary,
                                          )}
                                        />
                                      </Section>
                                      <Section title="Personal Information">
                                        <InfoRow
                                          label="Birthday"
                                          value={formatDate(
                                            viewRecord.birthday,
                                          )}
                                        />
                                        <InfoRow
                                          label="Birthplace"
                                          value={viewRecord.birthplace}
                                        />
                                        <InfoRow
                                          label="Civil Status"
                                          value={viewRecord.civil_status}
                                        />
                                        <InfoRow
                                          label="Gender"
                                          value={viewRecord.gender}
                                        />
                                      </Section>
                                      <Section title="Government ID Numbers">
                                        <InfoRow
                                          label="SSS"
                                          value={viewRecord.sss_number}
                                        />
                                        <InfoRow
                                          label="PhilHealth"
                                          value={viewRecord.philhealth_number}
                                        />
                                        <InfoRow
                                          label="Pag-IBIG"
                                          value={viewRecord.pagibig_number}
                                        />
                                        <InfoRow
                                          label="TIN"
                                          value={viewRecord.tin_number}
                                        />
                                      </Section>
                                      <Section title="Family Information">
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
                                      </Section>
                                      <Section title="Contact Information">
                                        <InfoRow
                                          label="Mobile"
                                          value={viewRecord.mobile_number}
                                        />
                                        <InfoRow
                                          label="Email"
                                          value={viewRecord.email_address}
                                        />
                                        <InfoRow
                                          label="Address"
                                          value={[
                                            viewRecord.house_number,
                                            viewRecord.street,
                                            viewRecord.village ||
                                              viewRecord.subdivision,
                                            viewRecord.barangay,
                                            viewRecord.city_municipality,
                                            viewRecord.province,
                                            viewRecord.region,
                                            viewRecord.zip_code,
                                          ]
                                            .filter(Boolean)
                                            .join(", ")}
                                        />
                                      </Section>
                                      {viewRecord.allowances &&
                                        viewRecord.allowances.length > 0 && (
                                          <Section title="Allowances">
                                            {viewRecord.allowances.map((a) => (
                                              <InfoRow
                                                key={a.label}
                                                label={a.label}
                                                value={`₱${a.amount.toLocaleString()}`}
                                              />
                                            ))}
                                          </Section>
                                        )}
                                    </div>
                                  )}
                                  <DialogFooter className="mt-2">
                                    <Button
                                      onClick={() =>
                                        viewRecord && openCoeDialog(viewRecord)
                                      }
                                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                                    >
                                      <FilePlus2 className="h-4 w-4 mr-2" />
                                      Generate COE
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              {/* Generate COE (shortcut, same action as inside the view dialog) */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCoeDialog(employee)}
                                className="border-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                                title="Generate COE"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>

                              {/* Edit */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(employee)}
                                className="border-2 border-slate-200 hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Delete */}
                              <Dialog
                                open={deleteDialogOpen}
                                onOpenChange={setDeleteDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRecordToDelete(employee)}
                                    className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Delete Employee Record
                                    </DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete{" "}
                                      {recordToDelete &&
                                        getFullName(recordToDelete)}
                                      's record? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex gap-3 mt-6">
                                    <Button
                                      variant="outline"
                                      onClick={() => setDeleteDialogOpen(false)}
                                      disabled={deleting}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleDelete}
                                      disabled={deleting}
                                    >
                                      {deleting && (
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                      )}
                                      Delete
                                    </Button>
                                  </div>
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
            </CardContent>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

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
              employee's masterfile record. Salary, allowances, coverage end
              date, and signatory still need to be filled in. Choose Word or PDF
              below before generating.
            </DialogDescription>
          </DialogHeader>

          <CoeForm
            data={coeFormData}
            onChange={handleCoeFieldChange}
            onAllowanceChange={handleCoeAllowanceChange}
            lookupStatus={coeLookupStatus}
            errors={coeFormErrors}
            lockIdNumber
          />

          <DialogFooter className="mt-4 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-sm text-muted-foreground">Download as</span>
              <Select
                value={coeDownloadFormat}
                onValueChange={(v) =>
                  setCoeDownloadFormat(v as CoeDownloadFormat)
                }
                disabled={coeSubmitting || coeDownloading}
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
              variant="outline"
              onClick={() => setCoeDialogOpen(false)}
              disabled={coeSubmitting || coeDownloading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCoeSubmit}
              disabled={coeSubmitting || coeDownloading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
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
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
  badgeClass,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  badgeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
      }`}
    >
      <span className="flex items-center gap-2">
        {badgeClass && (
          <span
            className={`h-2 w-2 rounded-full ${active ? "bg-white" : badgeClass.split(" ")[0]}`}
          />
        )}
        {label}
      </span>
      <span
        className={`text-xs rounded-full px-1.5 py-0.5 ${
          active ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b pb-3">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2 text-xs uppercase tracking-wide">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">{children}</div>
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
