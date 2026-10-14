// File: lib/contracts/payment-status.ts
// One place for the "is it paid / due soon / overdue" rules.
// Both the Contracts list and the contract detail page use this.

// An unpaid installment is "Due soon" when it is due within this many days
// (counting today). TODO: make this a Settings value.
export const DUE_SOON_DAYS = 7;

export interface PayableInstallment {
  due_date: string; // YYYY-MM-DD
  amount_due: number;
  amount_paid: number;
}

export type InstallmentStatus =
  | "Paid"
  | "Overdue"
  | "Due soon"
  | "Partial"
  | "Upcoming";

const round2 = (n: number) => Math.round(n * 100) / 100;

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Negative = already past, 0 = today.
export const daysUntil = (due: string, today: string) =>
  Math.round(
    (parseISO(due).getTime() - parseISO(today).getTime()) / 86_400_000,
  );

export const balanceOf = (i: PayableInstallment) =>
  round2(i.amount_due - i.amount_paid);

/**
 * Rules, checked in this order:
 *  Paid      balance is 0
 *  Overdue   due date is before today and there is still a balance
 *  Due soon  due today or within DUE_SOON_DAYS
 *  Partial   some money paid, but not due yet
 *  Upcoming  nothing paid, not due yet
 */
export const getInstallmentStatus = (
  i: PayableInstallment,
  today: string,
): InstallmentStatus => {
  if (balanceOf(i) <= 0) return "Paid";
  const days = daysUntil(i.due_date, today);
  if (days < 0) return "Overdue";
  if (days <= DUE_SOON_DAYS) return "Due soon";
  if (i.amount_paid > 0) return "Partial";
  return "Upcoming";
};

// "3 days overdue", "due today", "due in 5 days"
export const describeDue = (due: string, today: string) => {
  const d = daysUntil(due, today);
  if (d < 0) return `${-d} day${d === -1 ? "" : "s"} overdue`;
  if (d === 0) return "due today";
  if (d === 1) return "due tomorrow";
  return `due in ${d} days`;
};

export interface PaymentSummary {
  state: "Fully paid" | "Overdue" | "Due soon" | "On track";
  overdueCount: number;
  overdueAmount: number;
  dueSoonCount: number;
  dueSoonAmount: number;
  next: PayableInstallment | null; // first installment that still has a balance
  oldestOverdue: PayableInstallment | null;
}

export function summarizePayments(
  rows: PayableInstallment[],
  today: string,
): PaymentSummary {
  const sorted = [...rows].sort((a, b) => a.due_date.localeCompare(b.due_date));
  const s: PaymentSummary = {
    state: "Fully paid",
    overdueCount: 0,
    overdueAmount: 0,
    dueSoonCount: 0,
    dueSoonAmount: 0,
    next: null,
    oldestOverdue: null,
  };

  for (const row of sorted) {
    const status = getInstallmentStatus(row, today);
    if (status === "Paid") continue;
    if (!s.next) s.next = row;
    if (status === "Overdue") {
      s.overdueCount += 1;
      s.overdueAmount = round2(s.overdueAmount + balanceOf(row));
      if (!s.oldestOverdue) s.oldestOverdue = row;
    } else if (status === "Due soon") {
      s.dueSoonCount += 1;
      s.dueSoonAmount = round2(s.dueSoonAmount + balanceOf(row));
    }
  }

  s.state = !s.next
    ? "Fully paid"
    : s.overdueCount > 0
      ? "Overdue"
      : s.dueSoonCount > 0
        ? "Due soon"
        : "On track";
  return s;
}
