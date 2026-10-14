// File: app/admin/contracts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
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
  FileSignature,
  Loader,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   TYPES + CONSTANTS
   One row = one contract (client + service). Page 2 / Page 3 of the sheet
   become the detail page at /admin/contracts/[id].
   ──────────────────────────────────────────────────────────────────────── */

const SERVICES = [
  "Photography",
  "Social Media Management",
  "Website Development",
] as const;
type Service = (typeof SERVICES)[number];

const TERMS = ["One-time", "6 months", "1 year"] as const;
type Term = (typeof TERMS)[number];

// Same pattern as STATUS_BADGE_CLASSES in employee-types — first class is
// also used for the dot color in the left filter tabs.
const SERVICE_BADGE_CLASSES: Record<Service, string> = {
  Photography: "bg-pink-100 text-pink-700 border-pink-200",
  "Social Media Management": "bg-blue-100 text-blue-700 border-blue-200",
  "Website Development": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface Contract {
  id: number;
  client_name: string; // TODO: swap for client_id + clients table
  service: Service;
  term: Term;
  contract_value: number;
  agent_name: string;
  agent_pct: number; // e.g. 30
  employee_name: string;
  employee_pct: number; // e.g. 5
  // TODO: these 2 come from the installments / commissions tables later
  received: number;
  agent_comm_released: number;
}

interface ContractFormData {
  client_name: string;
  service: Service | "";
  term: Term | "";
  contract_value: string;
  agent_name: string;
  agent_pct: string;
  employee_name: string;
  employee_pct: string;
}

const emptyContractForm = (): ContractFormData => ({
  client_name: "",
  service: "",
  term: "",
  contract_value: "",
  agent_name: "",
  agent_pct: "30",
  employee_name: "",
  employee_pct: "5",
});

// TODO: remove once the API is connected. Values taken from the sheet.
const SAMPLE_CONTRACTS: Contract[] = [
  {
    id: 1,
    client_name: "IGROS MARKETING CORP.",
    service: "Photography",
    term: "One-time",
    contract_value: 43000,
    agent_name: "Mike",
    agent_pct: 30,
    employee_name: "Justin",
    employee_pct: 5,
    received: 0,
    agent_comm_released: 0,
  },
  {
    id: 2,
    client_name: "BOSS AUTO EXCHANGE",
    service: "Social Media Management",
    term: "1 year",
    contract_value: 420000,
    agent_name: "Mike",
    agent_pct: 30,
    employee_name: "Justin",
    employee_pct: 5,
    received: 86250,
    agent_comm_released: 126000,
  },
  {
    id: 3,
    client_name: "BOSS AUTO EXCHANGE",
    service: "Website Development",
    term: "1 year",
    contract_value: 170000,
    agent_name: "Mike",
    agent_pct: 30,
    employee_name: "Justin",
    employee_pct: 5,
    received: 86250,
    agent_comm_released: 0,
  },
  {
    id: 4,
    client_name: "PRIME AUTO",
    service: "Social Media Management",
    term: "1 year",
    contract_value: 437000,
    agent_name: "Mike",
    agent_pct: 30,
    employee_name: "Justin",
    employee_pct: 5,
    received: 0,
    agent_comm_released: 0,
  },
  {
    id: 5,
    client_name: "PRIME AUTO",
    service: "Website Development",
    term: "1 year",
    contract_value: 170000,
    agent_name: "Mike",
    agent_pct: 30,
    employee_name: "Justin",
    employee_pct: 5,
    received: 0,
    agent_comm_released: 0,
  },
];

const ITEMS_PER_PAGE = 10;

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Display-only math for the computed columns. Not final — the unresolved
// rules (when commission is released, Krissa's formula) will change this.
const getComputed = (c: Contract) => {
  const agentCommTotal = c.contract_value * (c.agent_pct / 100);
  return {
    clientBalance: c.contract_value - c.received,
    agentCommReleased: c.agent_comm_released,
    employeeComm: c.contract_value * (c.employee_pct / 100), // provisional
    unreleasedComm: agentCommTotal - c.agent_comm_released,
    companyGrossIncome: c.contract_value - agentCommTotal,
  };
};

/* ────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────── */

export default function ContractsPage() {
  const router = useRouter();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Left-side filter — "All" plus one tab per service.
  const [serviceFilter, setServiceFilter] = useState<Service | "All">("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] =
    useState<ContractFormData>(emptyContractForm());
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ContractFormData, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchContracts();
  }, [router]);

  // TODO: replace with the real fetch to /api/contracts
  const fetchContracts = async () => {
    setLoading(true);
    setContracts(SAMPLE_CONTRACTS);
    setLoading(false);
  };

  // Client-side search + service filter
  const query = searchQuery.trim().toLowerCase();
  const serviceCounts = SERVICES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = contracts.filter((c) => c.service === s).length;
    return acc;
  }, {});

  const filteredContracts = contracts
    .filter((c) =>
      serviceFilter === "All" ? true : c.service === serviceFilter,
    )
    .filter((c) =>
      query === ""
        ? true
        : c.client_name.toLowerCase().includes(query) ||
          c.service.toLowerCase().includes(query) ||
          c.agent_name.toLowerCase().includes(query),
    );

  const handleServiceFilterChange = (service: Service | "All") => {
    setServiceFilter(service);
    setCurrentPage(1);
  };

  const openAddDialog = () => {
    setEditingId(null);
    setFormData(emptyContractForm());
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditDialog = (contract: Contract) => {
    setEditingId(contract.id);
    setFormData({
      client_name: contract.client_name,
      service: contract.service,
      term: contract.term,
      contract_value: String(contract.contract_value),
      agent_name: contract.agent_name,
      agent_pct: String(contract.agent_pct),
      employee_name: contract.employee_name,
      employee_pct: String(contract.employee_pct),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFieldChange = (field: keyof ContractFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof ContractFormData, boolean>> = {};
    const required: (keyof ContractFormData)[] = [
      "client_name",
      "service",
      "term",
      "contract_value",
      "agent_name",
      "agent_pct",
    ];
    for (const field of required) {
      if (!formData[field] || String(formData[field]).trim() === "")
        errors[field] = true;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // TODO: POST / PUT to /api/contracts, then auto-generate the installments
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill in the highlighted fields.");
      return;
    }
    setSubmitting(true);
    toast("Save is not connected yet (UI only).");
    setSubmitting(false);
    setFormOpen(false);
  };

  // TODO: DELETE /api/contracts/:id
  const handleDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    toast("Delete is not connected yet (UI only).");
    setDeleting(false);
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // Detail page (Page 2 / Page 3 of the sheet) — one contract only
  const openContract = (contract: Contract) => {
    router.push(`/admin/contracts/${contract.id}`);
  };

  const totalPages = Math.ceil(filteredContracts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredContracts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (loading && contracts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileSignature className="h-8 w-8 sm:h-10 sm:w-10" />
                Contracts
              </h1>
              <p className="text-blue-100">
                Track contract values, payments received, and commissions
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-white hover:bg-gray-100 text-blue-900"
                onClick={openAddDialog}
              >
                <FilePlus2 className="h-4 w-4 mr-2" />
                Add Contract
              </Button>

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

      <div className="w-full py-8 space-y-6">
        {/* ── TABLE + LEFT SERVICE FILTER ── */}
        <Card className="border-2 border-slate-200 shadow-xl bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <FileSignature className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Contracts
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {filteredContracts.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredContracts.length,
                  )}{" "}
                  of {filteredContracts.length}
                  {serviceFilter !== "All" ? ` (${serviceFilter})` : ""}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client, service, agent..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 border-2"
                />
              </div>
            </div>
          </CardHeader>

          <div className="flex flex-col lg:flex-row">
            {/* Left-side service filter tabs */}
            <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r bg-slate-50/60 p-3 space-y-1">
              <FilterTab
                label="All"
                count={contracts.length}
                active={serviceFilter === "All"}
                onClick={() => handleServiceFilterChange("All")}
              />
              {SERVICES.map((service) => (
                <FilterTab
                  key={service}
                  label={service}
                  count={serviceCounts[service] ?? 0}
                  active={serviceFilter === service}
                  badgeClass={SERVICE_BADGE_CLASSES[service]}
                  onClick={() => handleServiceFilterChange(service)}
                />
              ))}
            </aside>

            <CardContent className="p-0 overflow-hidden flex-1">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold whitespace-nowrap">
                        Client
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Service
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Term
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Contract Value
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Received
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Client Balance
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Agent Comm. Released
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Krissa Comm. (5%)
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Unreleased Comm.
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Company Gross Income
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileSignature className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">
                              No contracts yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Click Add Contract to create the first one.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((contract) => {
                        const computed = getComputed(contract);
                        return (
                          <TableRow
                            key={contract.id}
                            onClick={() => openContract(contract)}
                            className="cursor-pointer hover:bg-slate-50/50"
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                  {contract.client_name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </div>
                                <span className="truncate max-w-[200px] inline-block align-middle">
                                  {contract.client_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={
                                  SERVICE_BADGE_CLASSES[contract.service]
                                }
                              >
                                {contract.service}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {contract.term}
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium whitespace-nowrap tabular-nums">
                              {formatCurrency(contract.contract_value)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(contract.received)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.clientBalance)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.agentCommReleased)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.employeeComm)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.unreleasedComm)}
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.companyGrossIncome)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {/* stopPropagation so the buttons don't also trigger the row click */}
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openContract(contract)}
                                  className="border border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  title="Open contract"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(contract)}
                                  className="border-2 border-slate-200 hover:bg-slate-50"
                                  title="Edit contract"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRecordToDelete(contract);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  title="Delete contract"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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

      {/* ── Add / Edit contract dialog ── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FilePlus2 className="h-6 w-6 text-blue-600" />
              {editingId ? "Edit Contract" : "Add Contract"}
            </DialogTitle>
            <DialogDescription>
              Fields marked <span className="text-red-500">*</span> are
              required. The payment schedule is created automatically after
              saving.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Contract details */}
            <div>
              <p className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">
                Contract
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Client" required error={formErrors.client_name}>
                  <Input
                    value={formData.client_name}
                    onChange={(e) =>
                      handleFieldChange("client_name", e.target.value)
                    }
                    placeholder="Client name"
                    className={formErrors.client_name ? "border-red-500" : ""}
                  />
                </Field>
                <Field label="Service" required error={formErrors.service}>
                  <Select
                    value={formData.service}
                    onValueChange={(v) => handleFieldChange("service", v)}
                  >
                    <SelectTrigger
                      className={formErrors.service ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Term" required error={formErrors.term}>
                  <Select
                    value={formData.term}
                    onValueChange={(v) => handleFieldChange("term", v)}
                  >
                    <SelectTrigger
                      className={formErrors.term ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a term" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERMS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Contract Value (₱)"
                  required
                  error={formErrors.contract_value}
                >
                  <Input
                    type="number"
                    min="0"
                    value={formData.contract_value}
                    onChange={(e) =>
                      handleFieldChange("contract_value", e.target.value)
                    }
                    placeholder="0.00"
                    className={
                      formErrors.contract_value ? "border-red-500" : ""
                    }
                  />
                </Field>
              </div>
            </div>

            {/* Commission */}
            <div>
              <p className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">
                Commission
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Agent" required error={formErrors.agent_name}>
                  <Input
                    value={formData.agent_name}
                    onChange={(e) =>
                      handleFieldChange("agent_name", e.target.value)
                    }
                    placeholder="Agent name"
                    className={formErrors.agent_name ? "border-red-500" : ""}
                  />
                </Field>
                <Field
                  label="Agent Comm. Share (%)"
                  required
                  error={formErrors.agent_pct}
                >
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.agent_pct}
                    onChange={(e) =>
                      handleFieldChange("agent_pct", e.target.value)
                    }
                    className={formErrors.agent_pct ? "border-red-500" : ""}
                  />
                </Field>
                <Field label="Employee">
                  <Input
                    value={formData.employee_name}
                    onChange={(e) =>
                      handleFieldChange("employee_name", e.target.value)
                    }
                    placeholder="Employee name"
                  />
                </Field>
                <Field label="Employee Comm. (%)">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.employee_pct}
                    onChange={(e) =>
                      handleFieldChange("employee_pct", e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          </div>

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

      {/* ── Delete confirmation ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {recordToDelete
                ? `${recordToDelete.client_name} - ${recordToDelete.service}`
                : "this contract"}
              ? Its payment schedule and commissions will be removed too. This
              action cannot be undone.
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
              {deleting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SMALL COMPONENTS (same FilterTab as the masterfile page)
   ──────────────────────────────────────────────────────────────────────── */

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
      className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-200/60"
      }`}
    >
      <span className="flex items-center gap-2 text-left">
        {badgeClass && (
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${active ? "bg-white" : badgeClass.split(" ")[0]}`}
          />
        )}
        {label}
      </span>
      <span
        className={`text-xs rounded-full px-1.5 py-0.5 ${
          active ? "bg-white/20" : "bg-slate-200"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={`text-sm font-medium ${error ? "text-red-600" : ""}`}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
