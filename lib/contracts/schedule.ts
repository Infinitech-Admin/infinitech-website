// File: lib/contracts/schedule.ts
// Builds the payment schedule (installments) for a contract.
// Works in centavos so the total always equals the contract value exactly;
// the LAST installment absorbs any rounding difference.

export const TERM_INSTALLMENTS = {
  "One-time": 1,
  "6 months": 6,
  "1 year": 12,
} as const;

export type ScheduleTerm = keyof typeof TERM_INSTALLMENTS;

export interface ScheduleRow {
  seq: number;
  due_date: string; // YYYY-MM-DD
  amount_due: number; // pesos
  amount_paid: number;
  paid_date: string | null;
  remarks: string;
}

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Always counts from the original start date, so Jan 31 -> Feb 28 -> Mar 31.
const addMonths = (base: Date, n: number) => {
  const r = new Date(base.getFullYear(), base.getMonth() + n, 1);
  const lastDay = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(base.getDate(), lastDay));
  return r;
};

export function generateSchedule(
  term: ScheduleTerm,
  contractValue: number,
  startDate: string, // typed by the user, YYYY-MM-DD
): ScheduleRow[] {
  const n = TERM_INSTALLMENTS[term];
  const start = parseISO(startDate);
  const totalCents = Math.round(contractValue * 100);
  const baseCents = Math.round(totalCents / n);

  return Array.from({ length: n }, (_, i) => {
    const cents = i === n - 1 ? totalCents - baseCents * (n - 1) : baseCents;
    return {
      seq: i + 1,
      due_date: toISODate(addMonths(start, i)),
      amount_due: cents / 100,
      amount_paid: 0,
      paid_date: null,
      remarks: "",
    };
  });
}
