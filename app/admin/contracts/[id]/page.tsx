"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
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
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileSignature,
  Loader,
  Wallet,
} from "lucide-react";
import { toISODate } from "@/lib/contracts/schedule";
import {
  balanceOf,
  describeDue,
  getInstallmentStatus,
  summarizePayments,
  DUE_SOON_DAYS,
  type InstallmentStatus,
  type PaymentSummary,
} from "@/lib/contracts/payment-status";
import {
  getContract,
  addPayment,
  updateInstallment,
  setCommissionRelease,
  errorMessage,
  type CommissionBasis,
  type CommissionLine,
  type ContractDetail,
  type Installment,
  type Service,
} from "@/lib/contracts/api";

/* ────────────────────────────────────────────────────────────────────────
   This ONE page covers "Page 2" and "Page 3" of the sheet: it shows a single
   contract (client + service) with its payment schedule and commissions.
   Data comes from /api/admin/contracts/:id via lib/contracts/api.ts.
   ──────────────────────────────────────────────────────────────────────── */

const SERVICE_BADGE_CLASSES: Record<Service, string> = {
  Photography:
    "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300",
  "Social Media Management":
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  "Website Development":
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
};

/* ────────────────────────────────────────────────────────────────────────
   TABLE LAYOUT
   Fixed column widths so every header lines up with its data.
   The first column gets extra left padding so "#" / "Label" never touch the
   card edge. Amount columns are right-aligned with a right padding so they
   don't crowd the next column.
   ──────────────────────────────────────────────────────────────────────── */

const FIRST_COL_PAD = "pl-4 sm:pl-6 lg:pl-8";
const AMOUNT_PAD = "pr-6";

/* ────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────────── */

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string | null) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Same rule as the list page. TODO: move to a shared file (lib/contracts/commissions.ts).
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
  return Math.round(base * value) / 100;
};

const describeLine = (l: CommissionLine) =>
  l.basis === "fixed"
    ? "Fixed amount"
    : l.basis === "contract_value"
      ? `${l.value}% of contract value`
      : `${l.value}% after previous lines`;

// Preview only: shows which installments a payment will cover. The server does
// the real allocation (POST /api/admin/contracts/:id/payments).
const allocatePayment = (rows: Installment[], amount: number) => {
  let left = round2(amount);
  const parts: { id: number; seq: number; add: number }[] = [];
  const ordered = [...rows].sort((a, b) =>
    a.due_date.localeCompare(b.due_date),
  );
  for (const r of ordered) {
    if (left <= 0) break;
    const bal = round2(r.amount_due - r.amount_paid);
    if (bal <= 0) continue;
    const add = Math.min(bal, left);
    parts.push({ id: r.id, seq: r.seq, add });
    left = round2(left - add);
  }
  return parts;
};

// Status rules live in lib/contracts/payment-status.ts (shared with the list page).
const STATUS_BADGE: Record<InstallmentStatus, string> = {
  Paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
  Overdue:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  "Due soon":
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  Partial:
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300",
  Upcoming:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
};

const ROW_TINT: Record<InstallmentStatus, string> = {
  Paid: "bg-emerald-50/70 dark:bg-emerald-900/10",
  Overdue: "bg-red-50/70 dark:bg-red-900/10",
  "Due soon": "bg-amber-50/70 dark:bg-amber-900/10",
  Partial: "bg-sky-50/60 dark:bg-sky-900/10",
  Upcoming: "",
};

/* ────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────── */

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const today = toISODate(new Date());

  const [detail, setDetail] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Record-payment dialog
  const [payTarget, setPayTarget] = useState<Installment | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payRemarks, setPayRemarks] = useState("");
  const [payError, setPayError] = useState("");

  // Add-payment dialog (one payment spread over several installments)
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkDate, setBulkDate] = useState("");
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [bulkError, setBulkError] = useState("");

  // Release-date dialog
  const [releaseTarget, setReleaseTarget] = useState<CommissionLine | null>(
    null,
  );
  const [releaseDate, setReleaseDate] = useState("");

  // Re-fetch after every change so the page always shows what the server has.
  const reload = useCallback(async () => {
    setDetail(await getContract(id));
  }, [id]);

  // GET /api/admin/contracts/:id
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getContract(id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setDetail(null);
          toast.error(errorMessage(e, "Failed to load contract."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <FileSignature className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="font-medium">Contract not found</p>
          <Link href="/admin/contracts">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { contract, installments, commissions } = detail;

  /* ── Computed numbers (same formulas as the list page) ── */
  const received = round2(
    installments.reduce((sum, i) => sum + i.amount_paid, 0),
  );
  const clientBalance = round2(contract.contract_value - received);
  const percentPaid =
    contract.contract_value > 0
      ? Math.min(100, (received / contract.contract_value) * 100)
      : 0;

  let running = 0;
  let totalComm = 0;
  let commReleased = 0;
  let deducted = 0;
  const commissionRows = commissions.map((line) => {
    const amount = lineAmount(
      contract.contract_value,
      line.basis,
      line.value,
      running,
    );
    running += amount;
    totalComm += amount;
    if (line.release_date) commReleased += amount;
    if (line.deduct_from_gross) deducted += amount;
    return { line, amount };
  });
  const unreleasedComm = totalComm - commReleased;
  const companyGrossIncome = contract.contract_value - deducted;

  const totalDue = round2(installments.reduce((s, i) => s + i.amount_due, 0));
  const payment = summarizePayments(installments, today);

  /* ── Record payment (one installment) ── */
  const openPayDialog = (inst: Installment) => {
    setPayTarget(inst);
    setPayAmount(
      String(inst.amount_paid > 0 ? inst.amount_paid : inst.amount_due),
    );
    setPayDate(inst.paid_date ?? today);
    setPayRemarks(inst.remarks);
    setPayError("");
  };

  // PUT /api/admin/contract-installments/:id
  const savePayment = async () => {
    if (!payTarget) return;
    const amount = Number(payAmount);
    if (payAmount.trim() === "" || !Number.isFinite(amount) || amount < 0) {
      setPayError("Enter an amount of 0 or more.");
      return;
    }
    if (round2(amount - payTarget.amount_due) > 0) {
      setPayError(
        `Amount can't be more than the amount due (${formatCurrency(payTarget.amount_due)}).`,
      );
      return;
    }
    if (amount > 0 && !payDate) {
      setPayError("Choose the date the payment was received.");
      return;
    }

    setSaving(true);
    try {
      await updateInstallment(payTarget.id, {
        amount_paid: round2(amount),
        paid_date: amount > 0 ? payDate : null,
        remarks: payRemarks.trim(),
      });
      await reload();
      toast.success("Payment saved.");
      setPayTarget(null);
    } catch (e) {
      setPayError(errorMessage(e, "Failed to save payment."));
    } finally {
      setSaving(false);
    }
  };

  /* ── Add payment (the server spreads it over the oldest unpaid installments) ── */
  const remaining = round2(totalDue - received);

  const openBulkDialog = (full: boolean) => {
    setBulkAmount(full ? String(remaining) : "");
    setBulkDate(today);
    setBulkRemarks(full ? "Paid in full" : "");
    setBulkError("");
    setBulkOpen(true);
  };

  // POST /api/admin/contracts/:id/payments
  const saveBulk = async () => {
    const amount = Number(bulkAmount);
    if (bulkAmount.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
      setBulkError("Enter an amount greater than 0.");
      return;
    }
    if (round2(amount - remaining) > 0) {
      setBulkError(
        `Amount can't be more than the remaining balance (${formatCurrency(remaining)}).`,
      );
      return;
    }
    if (!bulkDate) {
      setBulkError("Choose the date the payment was received.");
      return;
    }

    setSaving(true);
    try {
      await addPayment(contract.id, {
        amount: round2(amount),
        date_received: bulkDate,
        ...(bulkRemarks.trim() ? { remarks: bulkRemarks.trim() } : {}),
      });
      await reload();
      toast.success("Payment applied.");
      setBulkOpen(false);
    } catch (e) {
      setBulkError(errorMessage(e, "Failed to apply payment."));
    } finally {
      setSaving(false);
    }
  };

  /* ── Commission release date ── */
  const openReleaseDialog = (line: CommissionLine) => {
    setReleaseTarget(line);
    setReleaseDate(line.release_date ?? today);
  };

  // PUT /api/admin/contract-commissions/:id
  const saveRelease = async (date: string | null) => {
    if (!releaseTarget) return;
    setSaving(true);
    try {
      await setCommissionRelease(releaseTarget.id, date);
      await reload();
      toast.success(date ? "Release date saved." : "Marked as unreleased.");
      setReleaseTarget(null);
    } catch (e) {
      toast.error(errorMessage(e, "Failed to save release date."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 flex items-center gap-3">
                <FileSignature className="h-8 w-8 sm:h-10 sm:w-10" />
                {contract.client_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${SERVICE_BADGE_CLASSES[contract.service]} bg-white`}
                >
                  {contract.service}
                </Badge>
                <span className="text-blue-100 text-sm">
                  {contract.term} · starts {formatDate(contract.start_date)}
                </span>
              </div>
            </div>
            <Link href="/admin/contracts">
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-100 text-blue-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full py-8 space-y-6">
        {/* ── Payment warning (overdue / due soon / next payment) ── */}
        <div className="px-4 sm:px-6 lg:px-8">
          <PaymentBanner summary={payment} today={today} />
        </div>

        {/* ── Summary ── */}
        <div className="px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <SummaryCard
              label="Contract Value"
              value={contract.contract_value}
            />
            <SummaryCard label="Total Paid" value={received} />
            <SummaryCard label="Client Balance" value={clientBalance} />
            <SummaryCard label="Comm. Released" value={commReleased} />
            <SummaryCard label="Unreleased Comm." value={unreleasedComm} />
            <SummaryCard
              label="Company Gross Income"
              value={companyGrossIncome}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Paid so far</span>
              <span className="tabular-nums">{percentPaid.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Payment schedule ── */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 px-4 sm:px-6 lg:px-8">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Payment Schedule
            </CardTitle>
            <CardDescription>
              {installments.length} installment
              {installments.length === 1 ? "" : "s"}. Use Add payment for any
              amount the client sends, or Record to fix a single row.
            </CardDescription>
            <div className="pt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => openBulkDialog(false)}
                disabled={remaining <= 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Add payment
              </Button>
              <Button
                variant="outline"
                onClick={() => openBulkDialog(true)}
                disabled={remaining <= 0}
                className="border-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Pay remaining balance
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="table-fixed min-w-[1200px]">
                <colgroup>
                  <col className="w-[72px]" /> {/* # */}
                  <col className="w-[150px]" /> {/* Due Date */}
                  <col className="w-[130px]" /> {/* Date Paid */}
                  <col className="w-[150px]" /> {/* Amount Due */}
                  <col className="w-[150px]" /> {/* Amount Paid */}
                  <col className="w-[160px]" /> {/* Balance */}
                  <col className="w-[120px]" /> {/* Status */}
                  <col /> {/* Remarks: takes the rest */}
                  <col className="w-[130px]" /> {/* Actions */}
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead
                      className={`font-semibold whitespace-nowrap ${FIRST_COL_PAD}`}
                    >
                      #
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Due Date
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Date Paid
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Amount Due
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Amount Paid
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-right whitespace-nowrap ${AMOUNT_PAD}`}
                    >
                      Balance
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Remarks
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((inst) => {
                    const status = getInstallmentStatus(inst, today);
                    const balance = balanceOf(inst);
                    return (
                      <TableRow key={inst.id} className={ROW_TINT[status]}>
                        <TableCell
                          className={`text-sm text-muted-foreground tabular-nums ${FIRST_COL_PAD}`}
                        >
                          {inst.seq}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          <span
                            className={
                              status === "Overdue"
                                ? "text-red-600 font-semibold"
                                : status === "Due soon"
                                  ? "text-amber-700 dark:text-amber-300 font-semibold"
                                  : ""
                            }
                          >
                            {formatDate(inst.due_date)}
                          </span>
                          {(status === "Overdue" || status === "Due soon") && (
                            <span className="block text-xs text-muted-foreground">
                              {describeDue(inst.due_date, today)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(inst.paid_date)}
                        </TableCell>
                        <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(inst.amount_due)}
                        </TableCell>
                        <TableCell className="text-sm text-right whitespace-nowrap tabular-nums">
                          {inst.amount_paid > 0
                            ? formatCurrency(inst.amount_paid)
                            : "—"}
                        </TableCell>
                        <TableCell
                          className={`text-sm text-right font-medium whitespace-nowrap tabular-nums ${AMOUNT_PAD}`}
                        >
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={STATUS_BADGE[status]}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm truncate"
                          title={inst.remarks || undefined}
                        >
                          {inst.remarks || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPayDialog(inst)}
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Wallet className="h-4 w-4 mr-1" />
                            Record
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                    <TableCell className={FIRST_COL_PAD} />
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(totalDue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(received)}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${AMOUNT_PAD}`}
                    >
                      {formatCurrency(round2(totalDue - received))}
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── Commissions ── */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 px-4 sm:px-6 lg:px-8">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Commissions
            </CardTitle>
            <CardDescription>
              Set up per contract. To change a rate or add a person, edit the
              contract on the Contracts page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="table-fixed min-w-[1100px]">
                <colgroup>
                  <col className="w-[150px]" /> {/* Label */}
                  <col className="w-[160px]" /> {/* Person */}
                  <col className="w-[230px]" /> {/* Computed as */}
                  <col className="w-[170px]" /> {/* Amount */}
                  <col className="w-[170px]" /> {/* Deducted from gross */}
                  <col /> {/* Release: takes the rest */}
                  <col className="w-[140px]" /> {/* Actions */}
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead
                      className={`font-semibold whitespace-nowrap ${FIRST_COL_PAD}`}
                    >
                      Label
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Person
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Computed as
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-right whitespace-nowrap ${AMOUNT_PAD}`}
                    >
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Deducted from gross
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Release
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No commissions on this contract.
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissionRows.map(({ line, amount }) => (
                      <TableRow key={line.id}>
                        <TableCell
                          className={`font-medium whitespace-nowrap ${FIRST_COL_PAD}`}
                        >
                          {line.label}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {line.person_name}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {describeLine(line)}
                        </TableCell>
                        <TableCell
                          className={`text-sm text-right font-medium whitespace-nowrap tabular-nums ${AMOUNT_PAD}`}
                        >
                          {formatCurrency(amount)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {line.deduct_from_gross ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {line.release_date ? (
                            <Badge
                              variant="outline"
                              className={STATUS_BADGE.Paid}
                            >
                              Released {formatDate(line.release_date)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={STATUS_BADGE.Upcoming}
                            >
                              Unreleased
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReleaseDialog(line)}
                            className="border-2 border-slate-200 hover:bg-slate-50"
                          >
                            <CalendarCheck className="h-4 w-4 mr-1" />
                            {line.release_date ? "Change" : "Release"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                    <TableCell colSpan={3} className={FIRST_COL_PAD}>
                      Total
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${AMOUNT_PAD}`}
                    >
                      {formatCurrency(totalComm)}
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Record payment dialog ── */}
      <Dialog
        open={payTarget !== null}
        onOpenChange={(open) => !open && !saving && setPayTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              Record payment
            </DialogTitle>
            <DialogDescription>
              {payTarget
                ? `Installment ${payTarget.seq}, due ${formatDate(payTarget.due_date)}. Amount due: ${formatCurrency(payTarget.amount_due)}. This only changes this one installment. For a bigger payment or the full balance, use Add payment.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Total paid for this installment (₱)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={payAmount}
                  onChange={(e) => {
                    setPayAmount(e.target.value);
                    setPayError("");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    if (payTarget) setPayAmount(String(payTarget.amount_due));
                    setPayError("");
                  }}
                >
                  Fill amount due
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date paid</label>
              <Input
                type="date"
                value={payDate}
                onChange={(e) => {
                  setPayDate(e.target.value);
                  setPayError("");
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Remarks</label>
              <Input
                value={payRemarks}
                onChange={(e) => setPayRemarks(e.target.value)}
                placeholder="Down Payment, GCash ref..."
              />
            </div>
            {payTarget && Number(payAmount) > payTarget.amount_due && (
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-2 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
                <p>
                  That is more than this installment&apos;s amount due. To cover
                  the next installments too, use Add payment.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const extra = round2(
                      Number(payAmount) - payTarget.amount_paid,
                    );
                    setPayTarget(null);
                    setBulkAmount(String(extra));
                    setBulkDate(today);
                    setBulkRemarks("");
                    setBulkError("");
                    setBulkOpen(true);
                  }}
                >
                  Use Add payment (
                  {formatCurrency(
                    round2(Number(payAmount) - payTarget.amount_paid),
                  )}
                  )
                </Button>
              </div>
            )}
            {payError && <p className="text-sm text-red-600">{payError}</p>}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setPayTarget(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={savePayment}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {saving && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Save payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add payment dialog ── */}
      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => !saving && setBulkOpen(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              Add payment
            </DialogTitle>
            <DialogDescription>
              Applied to the oldest unpaid installments first. A bigger amount
              covers the next rows too, so paying the full balance turns every
              remaining row to {formatCurrency(0)}. Remaining balance:{" "}
              {formatCurrency(remaining)}.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const amount = Number(bulkAmount);
            const valid =
              Number.isFinite(amount) &&
              amount > 0 &&
              round2(amount - remaining) <= 0;
            const parts = valid ? allocatePayment(installments, amount) : [];
            const last = parts[parts.length - 1];
            const lastRow = last
              ? installments.find((i) => i.id === last.id)
              : undefined;
            const lastIsPartial =
              lastRow &&
              round2(lastRow.amount_due - lastRow.amount_paid - last.add) > 0;
            return (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Amount received (₱)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={bulkAmount}
                      onChange={(e) => {
                        setBulkAmount(e.target.value);
                        setBulkError("");
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        setBulkAmount(String(remaining));
                        setBulkError("");
                      }}
                    >
                      Full balance
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date received</label>
                  <Input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => {
                      setBulkDate(e.target.value);
                      setBulkError("");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Remarks</label>
                  <Input
                    value={bulkRemarks}
                    onChange={(e) => setBulkRemarks(e.target.value)}
                    placeholder="Paid in full, GCash ref..."
                  />
                </div>

                {parts.length > 0 && (
                  <div className="rounded-lg border-2 border-slate-200 dark:border-slate-700 p-3 text-sm space-y-1">
                    <p className="font-medium">
                      {parts.length === 1
                        ? `Pays installment ${parts[0].seq}`
                        : `Pays installments ${parts[0].seq} to ${last.seq}`}
                      {lastIsPartial ? " (the last one only partly)" : ""}
                    </p>
                    <p className="text-muted-foreground">
                      Balance after this payment:{" "}
                      {formatCurrency(round2(remaining - amount))}
                    </p>
                  </div>
                )}
                {bulkError && (
                  <p className="text-sm text-red-600">{bulkError}</p>
                )}
              </div>
            );
          })()}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setBulkOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveBulk}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {saving && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Apply payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Release date dialog ── */}
      <Dialog
        open={releaseTarget !== null}
        onOpenChange={(open) => !open && !saving && setReleaseTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CalendarCheck className="h-6 w-6 text-blue-600" />
              Release commission
            </DialogTitle>
            <DialogDescription>
              {releaseTarget
                ? `${releaseTarget.label} (${releaseTarget.person_name}). Choose the date it was paid out.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Release date</label>
            <Input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            {releaseTarget?.release_date && (
              <Button
                variant="outline"
                onClick={() => saveRelease(null)}
                disabled={saving}
                className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Mark unreleased
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setReleaseTarget(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              disabled={!releaseDate || saving}
              onClick={() => saveRelease(releaseDate)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {saving && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SMALL COMPONENTS
   ──────────────────────────────────────────────────────────────────────── */

function PaymentBanner({
  summary,
  today,
}: {
  summary: PaymentSummary;
  today: string;
}) {
  const base = "flex items-start gap-3 rounded-xl border-2 p-4 text-sm";

  if (summary.state === "Fully paid") {
    return (
      <div
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200`}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="font-medium">
          Fully paid. No balance left on this contract.
        </p>
      </div>
    );
  }

  if (summary.state === "Overdue" && summary.oldestOverdue) {
    return (
      <div
        className={`${base} border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200`}
      >
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">
            {summary.overdueCount} overdue installment
            {summary.overdueCount === 1 ? "" : "s"} ·{" "}
            {formatCurrency(summary.overdueAmount)} unpaid
          </p>
          <p>
            The oldest was due {formatDate(summary.oldestOverdue.due_date)} (
            {describeDue(summary.oldestOverdue.due_date, today)}).
          </p>
        </div>
      </div>
    );
  }

  if (!summary.next) return null;
  const nextBalance = round2(
    summary.next.amount_due - summary.next.amount_paid,
  );

  if (summary.state === "Due soon") {
    return (
      <div
        className={`${base} border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200`}
      >
        <Clock className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Payment coming up</p>
          <p>
            {formatCurrency(nextBalance)} is due{" "}
            {formatDate(summary.next.due_date)} (
            {describeDue(summary.next.due_date, today)}). Anything due within{" "}
            {DUE_SOON_DAYS} days is flagged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${base} border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200`}
    >
      <Clock className="h-5 w-5 shrink-0" />
      <p>
        On track. Next payment: {formatCurrency(nextBalance)} on{" "}
        {formatDate(summary.next.due_date)} (
        {describeDue(summary.next.due_date, today)}).
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums mt-1">
        {formatCurrency(value)}
      </p>
    </div>
  );
}
