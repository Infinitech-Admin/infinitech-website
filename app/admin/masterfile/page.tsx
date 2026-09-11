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
  ChevronLeft,
  ChevronRight,
  Eye,
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
  emptyEmployee,
  REQUIRED_FIELDS,
  getFullName,
} from "@/components/admin/employee-types";

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

export default function EmployeeMasterfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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

  const openAddDialog = () => {
    setEditingId(null);
    setFormData(emptyEmployee());
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingId(employee.id);
    const { id, created_at, updated_at, ...rest } = employee;
    setFormData(rest);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFieldChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: false }));
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

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
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

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        <div className="max-w-7xl mx-auto px-4 py-8">
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

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
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

        {/* ── TABLE ── */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Records
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {employees.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(startIndex + ITEMS_PER_PAGE, employees.length)} of{" "}
                  {employees.length}
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
          <CardContent className="p-0 overflow-hidden">
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
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
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
                              {employee.first_name?.charAt(0)?.toUpperCase() ||
                                "?"}
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
                                      <Row
                                        label="Department"
                                        value={viewRecord.department}
                                      />
                                      <Row
                                        label="Position"
                                        value={viewRecord.position}
                                      />
                                      <Row
                                        label="Date Hired"
                                        value={formatDate(
                                          viewRecord.date_hired,
                                        )}
                                      />
                                    </Section>
                                    <Section title="Personal Information">
                                      <Row
                                        label="Birthday"
                                        value={formatDate(viewRecord.birthday)}
                                      />
                                      <Row
                                        label="Birthplace"
                                        value={viewRecord.birthplace}
                                      />
                                      <Row
                                        label="Civil Status"
                                        value={viewRecord.civil_status}
                                      />
                                      <Row
                                        label="Gender"
                                        value={viewRecord.gender}
                                      />
                                    </Section>
                                    <Section title="Government ID Numbers">
                                      <Row
                                        label="SSS"
                                        value={viewRecord.sss_number}
                                      />
                                      <Row
                                        label="PhilHealth"
                                        value={viewRecord.philhealth_number}
                                      />
                                      <Row
                                        label="Pag-IBIG"
                                        value={viewRecord.pagibig_number}
                                      />
                                      <Row
                                        label="TIN"
                                        value={viewRecord.tin_number}
                                      />
                                    </Section>
                                    <Section title="Family Information">
                                      <Row
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
                                      <Row
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
                                      <Row
                                        label="Mobile"
                                        value={viewRecord.mobile_number}
                                      />
                                      <Row
                                        label="Email"
                                        value={viewRecord.email_address}
                                      />
                                      <Row
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
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

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
    </div>
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

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">
        {value && value.trim() !== "" ? value : "—"}
      </p>
    </div>
  );
}
