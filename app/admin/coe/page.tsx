// File: app/admin/coe/page.tsx
"use client";

import { useEffect, useState } from "react";
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
  Download,
  FilePlus2,
  FileText,
  Loader,
  Search,
} from "lucide-react";
import Link from "next/link";
import { CoeForm } from "@/components/admin/coe-form";
import {
  type Coe,
  type CoeFormData,
  type EmployeeLookup,
  emptyCoeForm,
  buildAllowances,
  formatCurrency,
} from "@/components/admin/coe-types";

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

export default function CoePage() {
  const { toast } = useToast();

  const [records, setRecords] = useState<Coe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<CoeFormData>(emptyCoeForm());
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CoeFormData, boolean>>
  >({});

  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "found" | "not_found"
  >("idle");
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async (search?: string) => {
    setLoading(true);
    try {
      const url = search
        ? `/api/admin/coe?search=${encodeURIComponent(search)}`
        : "/api/admin/coe";
      const response = await fetch(url);
      const data = await response.json();
      setRecords(data?.data ?? []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load COE history",
        variant: "destructive",
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchHistory(searchQuery || undefined);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Debounced ID-number -> employee lookup, autofills name/department/position
  // and drives Period From directly off Date Hired (both normalized to
  // YYYY-MM-DD since Laravel returns a full ISO timestamp).
  useEffect(() => {
    if (!formData.id_number) {
      setLookupStatus("idle");
      return;
    }
    setLookupStatus("loading");
    const t = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/employees/lookup?id_number=${encodeURIComponent(formData.id_number)}`,
        );
        if (!response.ok) {
          setLookupStatus("not_found");
          setFormData((prev) => ({
            ...prev,
            employee_id: null,
            employee_name: "",
            department: "",
            position: "",
            date_hired: null,
            period_from: "",
          }));
          return;
        }
        const { data }: { data: EmployeeLookup } = await response.json();
        const dateHiredFormatted = data.date_hired
          ? data.date_hired.slice(0, 10) // "2025-11-10T00:00:00.000000Z" -> "2025-11-10"
          : null;
        setLookupStatus("found");
        setFormData((prev) => ({
          ...prev,
          employee_id: data.id,
          employee_name: data.full_name,
          department: data.department,
          position: data.position,
          date_hired: dateHiredFormatted,
          period_from: dateHiredFormatted || "",
        }));
      } catch {
        setLookupStatus("not_found");
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.id_number]);

  const openCreateDialog = () => {
    setFormData(emptyCoeForm());
    setFormErrors({});
    setLookupStatus("idle");
    setFormOpen(true);
  };

  const handleFieldChange = <K extends keyof CoeFormData>(
    field: K,
    value: CoeFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof CoeFormData, boolean>> = {};
    if (!formData.employee_id) errors.employee_id = true;
    if (!formData.salary) errors.salary = true;
    if (!formData.period_from) errors.period_from = true;
    if (!formData.period_to) errors.period_to = true;
    if (!formData.issued_at) errors.issued_at = true;
    if (!formData.signatory_name) errors.signatory_name = true;
    if (!formData.signatory_title) errors.signatory_title = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const downloadCoe = async (id: number, certificateNo: string) => {
    setDownloadingId(id);
    try {
      const response = await fetch(`/api/admin/coe/${id}/download`);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateNo}-COE.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Error",
        description: "Failed to download the certificate",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
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
      const response = await fetch("/api/admin/coe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          salary: formData.salary,
          allowances: buildAllowances(formData),
          period_from: formData.period_from,
          period_to: formData.period_to,
          issued_at: formData.issued_at,
          signatory_name: formData.signatory_name,
          signatory_title: formData.signatory_title,
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
      setFormOpen(false);
      fetchHistory(searchQuery || undefined);
      // Immediately download the freshly issued COE (EMPLOYEE'S COPY + EMPLOYER'S COPY)
      downloadCoe(data.data.id, data.data.certificate_no);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create certificate",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading COE history...</p>
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
                <FileText className="h-8 w-8 sm:h-10 sm:w-10" />
                Certificate of Employment
              </h1>
              <p className="text-blue-100">Generate and track issued COEs</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white hover:bg-gray-100 text-blue-900"
                    onClick={openCreateDialog}
                  >
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    Create COE
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <FilePlus2 className="h-6 w-6 text-blue-600" />
                      New Certificate of Employment
                    </DialogTitle>
                    <DialogDescription>
                      Type the employee's ID number to autofill their name,
                      department, and position. Salary and allowances are
                      entered manually. Downloads as a .docx with the employee's
                      copy and employer's copy.
                    </DialogDescription>
                  </DialogHeader>

                  <CoeForm
                    data={formData}
                    onChange={handleFieldChange}
                    lookupStatus={lookupStatus}
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
                          Generating...
                        </>
                      ) : (
                        "Generate & Download"
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
                  Certificates Issued
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {records.length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── HISTORY TABLE ── */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  History
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {records.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(startIndex + ITEMS_PER_PAGE, records.length)} of{" "}
                  {records.length}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID number, cert no..."
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
                    <TableHead className="font-semibold">Cert. No.</TableHead>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">
                      Department / Position
                    </TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Allowances
                    </TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Issued
                    </TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            No certificates issued yet
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((coe) => (
                      <TableRow
                        key={coe.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          {coe.certificate_no}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{coe.employee_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {coe.id_number}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {coe.department} · {coe.position}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-1 flex-wrap">
                            {coe.allowances.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : (
                              coe.allowances.map((a) => (
                                <Badge
                                  key={a.label}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {a.label} {formatCurrency(a.amount)}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {formatDate(coe.issued_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadCoe(coe.id, coe.certificate_no)
                            }
                            disabled={downloadingId === coe.id}
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {downloadingId === coe.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
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
