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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePlus2,
  FileSignature,
  Loader,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { generateSchedule, toISODate } from "@/lib/contracts/schedule";
import {
  describeDue,
  summarizePayments,
  DUE_SOON_DAYS,
  type PaymentSummary,
} from "@/lib/contracts/payment-status";
import {
  listContracts,
  createContract,
  updateContract,
  deleteContract,
  errorMessage,
  type Contract,
  type ContractInput,
  type Service,
} from "@/lib/contracts/api";

/* ────────────────────────────────────────────────────────────────────────
   TYPES + CONSTANTS
   One row = one contract (client + service). The detail page (Page 2 / 3 of
   the sheet) lives at /admin/contracts/[id].
   Data comes from /api/admin/contracts via lib/contracts/api.ts.
   ──────────────────────────────────────────────────────────────────────── */

const SERVICES = [
  "Photography",
  "Social Media Management",
  "Website Development",
] as const;

// Keep in sync with TERM_INSTALLMENTS in lib/contracts/schedule.ts
const TERMS = ["One-time", "6 months", "1 year"] as const;
type Term = (typeof TERMS)[number];

// First class is also used for the dot color in the left filter tabs.
const SERVICE_BADGE_CLASSES: Record<Service, string> = {
  Photography: "bg-pink-100 text-pink-700 border-pink-200",
  "Social Media Management": "bg-blue-100 text-blue-700 border-blue-200",
  "Website Development": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

/**
 * Table layout: fixed column widths so every header lines up with its data.
 * The first column gets extra left padding so it never touches the card edge.
 * Amount columns are right-aligned; the last one before a left-aligned column
 * gets a right padding so it doesn't crowd its neighbor.
 */
const FIRST_COL_PAD = "pl-4 sm:pl-6 lg:pl-8";
const AMOUNT_PAD = "pr-6";

/**
 * How a commission line is calculated:
 *  - contract_value: value% of the contract value
 *  - after_previous: value% of (contract value − the lines above it)
 *  - fixed:          a flat peso amount
 */
const BASES = ["contract_value", "after_previous", "fixed"] as const;
type CommissionBasis = (typeof BASES)[number];

const BASIS_LABELS: Record<CommissionBasis, string> = {
  contract_value: "% of contract value",
  after_previous: "% after previous lines",
  fixed: "Fixed amount (₱)",
};

/* Form state keeps everything as strings (what inputs give us) */
interface CommissionFormLine {
  key: string; // local React key only
  label: string;
  person_name: string;
  basis: CommissionBasis;
  value: string;
  deduct_from_gross: boolean;
  release_date: string; // not shown in the form; kept so editing never erases it
}

interface ContractFormData {
  client_name: string;
  service: Service | "";
  term: Term | "";
  contract_value: string;
  start_date: string;
  commissions: CommissionFormLine[];
}

type FormErrors = Partial<
  Record<keyof Omit<ContractFormData, "commissions">, boolean>
>;

/* Tabs of the Add / Edit dialog, in order */
const FORM_TABS = [
  { id: "contract", label: "Contract" },
  { id: "commissions", label: "Commissions" },
  { id: "review", label: "Review" },
] as const;
type FormTab = (typeof FORM_TABS)[number]["id"];

const newKey = () => Math.random().toString(36).slice(2);

const emptyCommissionLine = (): CommissionFormLine => ({
  key: newKey(),
  label: "",
  person_name: "",
  basis: "contract_value",
  value: "",
  deduct_from_gross: false,
  release_date: "",
});

// TODO (backend): load these from the Settings page (commission_defaults).
// They only prefill the Add Contract form — every contract can change them.
const DEFAULT_COMMISSIONS: Omit<
  CommissionFormLine,
  "key" | "person_name" | "release_date"
>[] = [
  {
    label: "Agent",
    basis: "contract_value",
    value: "30",
    deduct_from_gross: true,
  },
  {
    label: "Employee",
    basis: "contract_value",
    value: "5",
    deduct_from_gross: false,
  },
];

const emptyContractForm = (): ContractFormData => ({
  client_name: "",
  service: "",
  term: "",
  contract_value: "",
  start_date: "",
  commissions: DEFAULT_COMMISSIONS.map((d) => ({
    ...d,
    key: newKey(),
    person_name: "",
    release_date: "",
  })),
});

const ITEMS_PER_PAGE = 10;

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/* ────────────────────────────────────────────────────────────────────────
   COMMISSION MATH
   Nothing is hardcoded: every line carries its own basis and value.
   Lines are calculated top to bottom, so "after_previous" uses the lines above.
   ──────────────────────────────────────────────────────────────────────── */

const lineAmount = (
  contractValue: number,
  basis: CommissionBasis,
  value: number,
  previousTotal: number,
) => {
  if (!Number.isFinite(value)) return 0;
  if (basis === "fixed") return value;
  const base =
    basis === "contract_value" ? contractValue : contractValue - previousTotal;
  return Math.round(base * value) / 100; // base × value% , rounded to centavos
};

// Amount of every line, in order.
const calcAmounts = (
  contractValue: number,
  lines: { basis: CommissionBasis; value: number }[],
) => {
  let running = 0;
  return lines.map((l) => {
    const amt = lineAmount(contractValue, l.basis, l.value, running);
    running += amt;
    return amt;
  });
};

const getComputed = (c: Contract) => {
  const amounts = calcAmounts(c.contract_value, c.commissions);
  let total = 0;
  let released = 0;
  let deducted = 0;
  c.commissions.forEach((line, i) => {
    total += amounts[i];
    if (line.release_date) released += amounts[i];
    if (line.deduct_from_gross) deducted += amounts[i];
  });
  return {
    clientBalance: c.contract_value - c.received,
    totalComm: total,
    commReleased: released,
    unreleasedComm: total - released,
    companyGrossIncome: c.contract_value - deducted,
  };
};

// Payment state of a contract (Paid / Overdue / Due soon / On track).
// Uses the real installments when the list endpoint returns them. Otherwise it
// falls back to rebuilding the schedule and spreading `received` over it.
const getPaymentInfo = (c: Contract, today: string): PaymentSummary => {
  if (c.installments && c.installments.length > 0) {
    return summarizePayments(c.installments, today);
  }
  let left = c.received;
  const rows = generateSchedule(c.term, c.contract_value, c.start_date).map(
    (r) => {
      const paid = Math.min(r.amount_due, left);
      left = Math.round((left - paid) * 100) / 100;
      return { ...r, amount_paid: paid };
    },
  );
  return summarizePayments(rows, today);
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
  // Set by the warning strip above the table
  const [paymentFilter, setPaymentFilter] = useState<
    "All" | "Overdue" | "Due soon"
  >("All");

  const [formOpen, setFormOpen] = useState(false);
  const [formTab, setFormTab] = useState<FormTab>("contract");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] =
    useState<ContractFormData>(emptyContractForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  // keys look like "<lineKey>.label" — marks invalid commission fields
  const [lineErrors, setLineErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth is handled by app/admin/layout.tsx (session cookie), so no token check here.
  useEffect(() => {
    fetchContracts();
  }, []);

  // GET /api/admin/contracts
  const fetchContracts = async () => {
    setLoading(true);
    try {
      setContracts(await listContracts());
    } catch (e) {
      toast.error(errorMessage(e, "Failed to load contracts."));
    } finally {
      setLoading(false);
    }
  };

  // Payment state of every contract (drives the Payment column + warning strip)
  const today = toISODate(new Date());
  const paymentById = new Map(
    contracts.map((c) => [c.id, getPaymentInfo(c, today)] as const),
  );
  const overdueCount = contracts.filter(
    (c) => paymentById.get(c.id)?.state === "Overdue",
  ).length;
  const dueSoonCount = contracts.filter(
    (c) => paymentById.get(c.id)?.state === "Due soon",
  ).length;

  const togglePaymentFilter = (value: "Overdue" | "Due soon") => {
    setPaymentFilter((prev) => (prev === value ? "All" : value));
    setCurrentPage(1);
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
      paymentFilter === "All"
        ? true
        : paymentById.get(c.id)?.state === paymentFilter,
    )
    .filter((c) =>
      query === ""
        ? true
        : c.client_name.toLowerCase().includes(query) ||
          c.service.toLowerCase().includes(query) ||
          c.commissions.some((l) =>
            l.person_name.toLowerCase().includes(query),
          ),
    );

  const handleServiceFilterChange = (service: Service | "All") => {
    setServiceFilter(service);
    setCurrentPage(1);
  };

  const openAddDialog = () => {
    setEditingId(null);
    setFormData(emptyContractForm());
    setFormErrors({});
    setLineErrors({});
    setFormTab("contract");
    setFormOpen(true);
  };

  const openEditDialog = (contract: Contract) => {
    setEditingId(contract.id);
    setFormData({
      client_name: contract.client_name,
      service: contract.service,
      term: contract.term,
      contract_value: String(contract.contract_value),
      start_date: contract.start_date,
      commissions: contract.commissions.map((l) => ({
        key: newKey(),
        label: l.label,
        person_name: l.person_name,
        basis: l.basis,
        value: String(l.value),
        deduct_from_gross: l.deduct_from_gross,
        release_date: l.release_date ?? "",
      })),
    });
    setFormErrors({});
    setLineErrors({});
    setFormTab("contract");
    setFormOpen(true);
  };

  const handleFieldChange = (
    field: keyof Omit<ContractFormData, "commissions">,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  /* Commission line editing inside the form */
  const addCommissionLine = () =>
    setFormData((prev) => ({
      ...prev,
      commissions: [...prev.commissions, emptyCommissionLine()],
    }));

  const removeCommissionLine = (key: string) =>
    setFormData((prev) => ({
      ...prev,
      commissions: prev.commissions.filter((l) => l.key !== key),
    }));

  const updateCommissionLine = (
    key: string,
    patch: Partial<CommissionFormLine>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      commissions: prev.commissions.map((l) =>
        l.key === key ? { ...l, ...patch } : l,
      ),
    }));
    // clear the error of whichever field was edited
    const field = Object.keys(patch)[0];
    if (lineErrors[`${key}.${field}`])
      setLineErrors((prev) => ({ ...prev, [`${key}.${field}`]: false }));
  };

  /* Validation is split per tab so "Next" only checks the current tab */
  const validateContractTab = (): boolean => {
    const errors: FormErrors = {};
    const required: (keyof FormErrors)[] = [
      "client_name",
      "service",
      "term",
      "contract_value",
      "start_date",
    ];
    for (const field of required) {
      if (!formData[field] || String(formData[field]).trim() === "")
        errors[field] = true;
    }
    if (Number(formData.contract_value) <= 0) errors.contract_value = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCommissionsTab = (): boolean => {
    const lErrors: Record<string, boolean> = {};
    for (const l of formData.commissions) {
      if (!l.label.trim()) lErrors[`${l.key}.label`] = true;
      if (!l.person_name.trim()) lErrors[`${l.key}.person_name`] = true;
      const v = Number(l.value);
      if (l.value.trim() === "" || !Number.isFinite(v) || v < 0)
        lErrors[`${l.key}.value`] = true;
      if (l.basis !== "fixed" && v > 100) lErrors[`${l.key}.value`] = true;
    }
    setLineErrors(lErrors);
    return Object.keys(lErrors).length === 0;
  };

  const tabIndex = FORM_TABS.findIndex((t) => t.id === formTab);
  const isLastTab = tabIndex === FORM_TABS.length - 1;

  const goNext = () => {
    const ok =
      formTab === "contract"
        ? validateContractTab()
        : formTab === "commissions"
          ? validateCommissionsTab()
          : true;
    if (!ok) {
      toast.error("Please fill in the highlighted fields.");
      return;
    }
    setFormTab(FORM_TABS[tabIndex + 1].id);
  };

  const goBack = () => setFormTab(FORM_TABS[tabIndex - 1].id);

  // POST /api/admin/contracts  or  PUT /api/admin/contracts/:id
  // The backend generates the installments, so we just reload the list after.
  const handleSubmit = async () => {
    const contractOk = validateContractTab();
    const commissionsOk = validateCommissionsTab();
    if (!contractOk || !commissionsOk) {
      setFormTab(contractOk ? "commissions" : "contract");
      toast.error("Please fill in the highlighted fields.");
      return;
    }
    setSubmitting(true);

    const payload: ContractInput = {
      client_name: formData.client_name.trim(),
      service: formData.service as Service,
      term: formData.term as Term,
      contract_value: Number(formData.contract_value),
      start_date: formData.start_date,
      commissions: formData.commissions.map((l) => ({
        label: l.label.trim(),
        person_name: l.person_name.trim(),
        basis: l.basis,
        value: Number(l.value),
        deduct_from_gross: l.deduct_from_gross,
        release_date: l.release_date || null,
      })),
    };

    try {
      if (editingId) {
        await updateContract(editingId, payload);
        toast.success("Contract updated.");
      } else {
        await createContract(payload);
        toast.success("Contract added.");
      }
      setFormOpen(false);
      await fetchContracts();
    } catch (e) {
      toast.error(errorMessage(e, "Failed to save contract."));
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE /api/admin/contracts/:id
  const handleDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await deleteContract(recordToDelete.id);
      toast.success("Contract deleted.");
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      await fetchContracts();
    } catch (e) {
      toast.error(errorMessage(e, "Failed to delete contract."));
    } finally {
      setDeleting(false);
    }
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

  /* ── Numbers used by the dialog (commission previews + review tab) ── */
  const contractValueNumber = Number(formData.contract_value) || 0;
  const formAmounts = calcAmounts(
    contractValueNumber,
    formData.commissions.map((l) => ({
      basis: l.basis,
      value: Number(l.value) || 0,
    })),
  );
  const formTotalComm = formAmounts.reduce((s, a) => s + a, 0);
  const formDeducted = formData.commissions.reduce(
    (s, l, i) => (l.deduct_from_gross ? s + formAmounts[i] : s),
    0,
  );
  const formGrossIncome = contractValueNumber - formDeducted;

  const schedulePreview =
    formData.term && formData.start_date && contractValueNumber > 0
      ? generateSchedule(
          formData.term,
          contractValueNumber,
          formData.start_date,
        )
      : null;

  const contractTabHasError = Object.values(formErrors).some(Boolean);
  const commissionsTabHasError = Object.values(lineErrors).some(Boolean);

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
        {/* ── Payment warnings: click a chip to filter the table ── */}
        {(overdueCount > 0 || dueSoonCount > 0) && (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="font-medium">Payments need attention</span>
              {overdueCount > 0 && (
                <button
                  type="button"
                  onClick={() => togglePaymentFilter("Overdue")}
                  className={`rounded-full border px-3 py-1 font-medium transition-colors ${
                    paymentFilter === "Overdue"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-red-700 border-red-200 hover:bg-red-50"
                  }`}
                >
                  {overdueCount} overdue
                </button>
              )}
              {dueSoonCount > 0 && (
                <button
                  type="button"
                  onClick={() => togglePaymentFilter("Due soon")}
                  className={`rounded-full border px-3 py-1 font-medium transition-colors ${
                    paymentFilter === "Due soon"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-amber-800 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {dueSoonCount} due within {DUE_SOON_DAYS} days
                </button>
              )}
              {paymentFilter !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentFilter("All");
                    setCurrentPage(1);
                  }}
                  className="underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}

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
                  placeholder="Search by client, service, person..."
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

            {/* min-w-0 lets this flex child shrink so the table scrolls inside it */}
            <CardContent className="p-0 overflow-hidden flex-1 min-w-0">
              <div className="w-full overflow-x-auto">
                <Table className="table-fixed min-w-[1950px]">
                  <colgroup>
                    <col className="w-[230px]" /> {/* Client */}
                    <col className="w-[230px]" /> {/* Service */}
                    <col className="w-[100px]" /> {/* Term */}
                    <col className="w-[130px]" /> {/* First Due Date */}
                    <col className="w-[150px]" /> {/* Contract Value */}
                    <col className="w-[140px]" /> {/* Total Paid */}
                    <col className="w-[160px]" /> {/* Client Balance */}
                    <col className="w-[170px]" /> {/* Payment */}
                    <col className="w-[150px]" /> {/* Comm. Released */}
                    <col className="w-[160px]" /> {/* Unreleased Comm. */}
                    <col className="w-[200px]" /> {/* Company Gross Income */}
                    <col className="w-[150px]" /> {/* Actions */}
                  </colgroup>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead
                        className={`font-semibold whitespace-nowrap ${FIRST_COL_PAD}`}
                      >
                        Client
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Service
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Term
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        First Due Date
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Contract Value
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Total Paid
                      </TableHead>
                      <TableHead
                        className={`font-semibold text-right whitespace-nowrap ${AMOUNT_PAD}`}
                      >
                        Client Balance
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Payment
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Comm. Released
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Unreleased Comm.
                      </TableHead>
                      <TableHead
                        className={`font-semibold text-right whitespace-nowrap ${AMOUNT_PAD}`}
                      >
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
                        <TableCell colSpan={12} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileSignature className="h-12 w-12 text-muted-foreground/50" />
                            {contracts.length > 0 ? (
                              <>
                                <p className="text-muted-foreground font-medium">
                                  No matching contracts
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Try a different search or service filter.
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-muted-foreground font-medium">
                                  No contracts yet
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Click Add Contract to create the first one.
                                </p>
                              </>
                            )}
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
                            <TableCell
                              className={`font-medium ${FIRST_COL_PAD}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                  {contract.client_name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </div>
                                <span
                                  className="truncate"
                                  title={contract.client_name}
                                >
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
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatDate(contract.start_date)}
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium whitespace-nowrap tabular-nums">
                              {formatCurrency(contract.contract_value)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(contract.received)}
                            </TableCell>
                            <TableCell
                              className={`text-sm text-right whitespace-nowrap tabular-nums ${AMOUNT_PAD}`}
                            >
                              {formatCurrency(computed.clientBalance)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <PaymentCell
                                summary={paymentById.get(contract.id)}
                                today={today}
                              />
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.commReleased)}
                            </TableCell>
                            <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                              {formatCurrency(computed.unreleasedComm)}
                            </TableCell>
                            <TableCell
                              className={`text-sm text-right font-medium whitespace-nowrap tabular-nums ${AMOUNT_PAD}`}
                            >
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

      {/* ── Add / Edit contract dialog (3 tabs: Contract → Commissions → Review) ── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {/* Tab buttons */}
          <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {FORM_TABS.map((tab, i) => (
              <StepTab
                key={tab.id}
                step={i + 1}
                label={tab.label}
                active={formTab === tab.id}
                hasError={
                  (tab.id === "contract" && contractTabHasError) ||
                  (tab.id === "commissions" && commissionsTabHasError)
                }
                onClick={() => setFormTab(tab.id)}
              />
            ))}
          </div>

          {/* Fixed minimum height so the dialog doesn't jump between tabs */}
          <div className="min-h-[300px]">
            {/* ── TAB 1: Contract ── */}
            {formTab === "contract" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
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
                </div>
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
                <Field
                  label="First Due Date"
                  required
                  error={formErrors.start_date}
                >
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      handleFieldChange("start_date", e.target.value)
                    }
                    className={formErrors.start_date ? "border-red-500" : ""}
                  />
                </Field>
              </div>
            )}

            {/* ── TAB 2: Commissions ── */}
            {formTab === "commissions" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Lines are calculated from top to bottom. “After previous
                    lines” uses the lines above it. Release dates are set later
                    on the contract page.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={addCommissionLine}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add commission
                  </Button>
                </div>

                {formData.commissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6 text-center">
                    No commissions on this contract. Click Add commission to
                    create one.
                  </p>
                ) : (
                  formData.commissions.map((line, index) => (
                    <div
                      key={line.key}
                      className="rounded-lg border-2 border-slate-200 dark:border-slate-700 p-3 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-3">
                          <Field
                            label="Label"
                            required
                            error={lineErrors[`${line.key}.label`]}
                          >
                            <Input
                              value={line.label}
                              onChange={(e) =>
                                updateCommissionLine(line.key, {
                                  label: e.target.value,
                                })
                              }
                              placeholder="Agent"
                              className={
                                lineErrors[`${line.key}.label`]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </Field>
                        </div>
                        <div className="sm:col-span-3">
                          <Field
                            label="Person"
                            required
                            error={lineErrors[`${line.key}.person_name`]}
                          >
                            <Input
                              value={line.person_name}
                              onChange={(e) =>
                                updateCommissionLine(line.key, {
                                  person_name: e.target.value,
                                })
                              }
                              placeholder="Name"
                              className={
                                lineErrors[`${line.key}.person_name`]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </Field>
                        </div>
                        <div className="sm:col-span-4">
                          <Field label="Computed as">
                            <Select
                              value={line.basis}
                              onValueChange={(v) =>
                                updateCommissionLine(line.key, {
                                  basis: v as CommissionBasis,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BASES.map((b) => (
                                  <SelectItem key={b} value={b}>
                                    {BASIS_LABELS[b]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field
                            label={
                              line.basis === "fixed"
                                ? "Amount (₱)"
                                : "Percent (%)"
                            }
                            required
                            error={lineErrors[`${line.key}.value`]}
                          >
                            <Input
                              type="number"
                              min="0"
                              max={line.basis === "fixed" ? undefined : 100}
                              value={line.value}
                              onChange={(e) =>
                                updateCommissionLine(line.key, {
                                  value: e.target.value,
                                })
                              }
                              className={
                                lineErrors[`${line.key}.value`]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </Field>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={line.deduct_from_gross}
                            onChange={(e) =>
                              updateCommissionLine(line.key, {
                                deduct_from_gross: e.target.checked,
                              })
                            }
                            className="h-4 w-4"
                          />
                          Deduct from company gross income
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium tabular-nums">
                            {formatCurrency(formAmounts[index] ?? 0)}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCommissionLine(line.key)}
                            className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                            title="Remove commission"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB 3: Review ── */}
            {formTab === "review" && (
              <div className="space-y-5">
                <div>
                  <p className="font-semibold text-sm mb-2">Contract</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 p-3">
                    <ReviewRow
                      label="Client"
                      value={formData.client_name || "—"}
                    />
                    <ReviewRow
                      label="Service"
                      value={formData.service || "—"}
                    />
                    <ReviewRow label="Term" value={formData.term || "—"} />
                    <ReviewRow
                      label="Contract value"
                      value={formatCurrency(contractValueNumber)}
                    />
                    <ReviewRow
                      label="First due date"
                      value={formatDate(formData.start_date)}
                    />
                  </dl>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-2">Payment schedule</p>
                  <div className="text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 p-3">
                    {schedulePreview ? (
                      <SchedulePreviewText rows={schedulePreview} />
                    ) : (
                      <span className="text-muted-foreground">
                        Fill in the term, contract value and first due date to
                        see the schedule.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-2">Commissions</p>
                  <div className="text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 divide-y">
                    {formData.commissions.length === 0 ? (
                      <p className="p-3 text-muted-foreground">
                        No commissions.
                      </p>
                    ) : (
                      formData.commissions.map((l, i) => (
                        <div
                          key={l.key}
                          className="flex items-center justify-between gap-3 p-3"
                        >
                          <span>
                            {l.label || "—"}
                            <span className="text-muted-foreground">
                              {" "}
                              · {l.person_name || "—"} ·{" "}
                              {l.basis === "fixed"
                                ? "fixed"
                                : `${l.value || 0}% ${l.basis === "contract_value" ? "of contract value" : "after previous"}`}
                              {l.deduct_from_gross
                                ? " · deducted from gross"
                                : ""}
                            </span>
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(formAmounts[i] ?? 0)}
                          </span>
                        </div>
                      ))
                    )}
                    <div className="flex items-center justify-between p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <span>Total commissions</span>
                      <span className="tabular-nums">
                        {formatCurrency(formTotalComm)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 font-semibold">
                      <span>Company gross income</span>
                      <span className="tabular-nums">
                        {formatCurrency(formGrossIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            {tabIndex > 0 && (
              <Button variant="outline" onClick={goBack} disabled={submitting}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {isLastTab ? (
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
                  "Save contract"
                )}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
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
   SMALL COMPONENTS
   ──────────────────────────────────────────────────────────────────────── */

// Payment badge shown in the table: Fully paid / Overdue / Due soon / On track
function PaymentCell({
  summary,
  today,
}: {
  summary?: PaymentSummary;
  today: string;
}) {
  if (!summary) return null;

  const badge = {
    "Fully paid":
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    Overdue:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
    "Due soon":
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    "On track":
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  }[summary.state];

  let hint = "";
  if (summary.state === "Overdue") {
    hint = `${summary.overdueCount} unpaid · ${formatCurrency(summary.overdueAmount)}`;
  } else if (summary.next && summary.state === "Due soon") {
    hint = `${formatDate(summary.next.due_date)} · ${describeDue(summary.next.due_date, today)}`;
  } else if (summary.next && summary.state === "On track") {
    hint = `Next: ${formatDate(summary.next.due_date)}`;
  }

  return (
    <div className="space-y-0.5">
      <Badge variant="outline" className={badge}>
        {summary.state}
      </Badge>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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

// Tab button of the Add / Edit dialog. A red dot means that tab has errors.
function StepTab({
  step,
  label,
  active,
  hasError,
  onClick,
}: {
  step: number;
  label: string;
  active: boolean;
  hasError: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-white dark:bg-slate-950 text-blue-700 dark:text-blue-300 shadow-sm"
          : "text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/50"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full text-xs flex items-center justify-center ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100"
        }`}
      >
        {step}
      </span>
      {label}
      {hasError && <span className="h-2 w-2 rounded-full bg-red-500" />}
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

// "12 installments of ₱35,000.00, from Oct 9, 2026 to Sep 9, 2027"
function SchedulePreviewText({
  rows,
}: {
  rows: ReturnType<typeof generateSchedule>;
}) {
  const first = rows[0];
  const last = rows[rows.length - 1];
  const sameAmount = first.amount_due === last.amount_due;
  return (
    <div className="space-y-1">
      <p>
        <span className="font-medium">
          {rows.length} installment{rows.length === 1 ? "" : "s"}
        </span>
        {rows.length > 1 && (
          <>
            {" "}
            of {formatCurrency(first.amount_due)}
            {!sameAmount && (
              <>, last one {formatCurrency(last.amount_due)} (rounding)</>
            )}
          </>
        )}
        {rows.length === 1 && <> of {formatCurrency(first.amount_due)}</>}
      </p>
      <p className="text-muted-foreground">
        {rows.length === 1
          ? `Due ${formatDate(first.due_date)}`
          : `From ${formatDate(first.due_date)} to ${formatDate(last.due_date)}`}
      </p>
    </div>
  );
}
