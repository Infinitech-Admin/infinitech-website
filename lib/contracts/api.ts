// lib/contracts/api.ts
// One place that talks to /api/admin/contracts* (the Next routes that proxy to Laravel).
// Both pages import from here, so types and response parsing live in one spot.

import type { ScheduleTerm } from "@/lib/contracts/schedule";

/* ── Types (shared by the list page and the detail page) ── */

export type Service =
  | "Photography"
  | "Social Media Management"
  | "Website Development";

export type CommissionBasis = "contract_value" | "after_previous" | "fixed";

export interface CommissionLine {
  id: number;
  label: string;
  person_name: string;
  basis: CommissionBasis;
  value: number; // percent, or pesos when basis = "fixed"
  deduct_from_gross: boolean;
  release_date: string | null;
}

export interface Installment {
  id: number;
  seq: number;
  due_date: string; // YYYY-MM-DD
  amount_due: number;
  amount_paid: number;
  paid_date: string | null;
  remarks: string;
}

export interface Contract {
  id: number;
  client_name: string;
  service: Service;
  term: ScheduleTerm;
  contract_value: number;
  start_date: string;
  commissions: CommissionLine[];
  received: number; // sum of installments.amount_paid
  installments?: Installment[]; // present if the list endpoint includes them
}

export interface ContractDetail {
  contract: Contract;
  installments: Installment[];
  commissions: CommissionLine[];
}

/** Body for POST / PUT /api/admin/contracts */
export interface ContractInput {
  client_name: string;
  service: Service;
  term: ScheduleTerm;
  contract_value: number;
  start_date: string;
  commissions: {
    label: string;
    person_name: string;
    basis: CommissionBasis;
    value: number;
    deduct_from_gross: boolean;
    release_date: string | null;
  }[];
}

/* ── Fetch helper ── */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin", // session cookie; the proxy adds the service token
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Laravel: { message } or { message, errors: { field: [msg] } }
    const firstFieldError =
      json?.errors && typeof json.errors === "object"
        ? (Object.values(json.errors).flat()[0] as string | undefined)
        : undefined;
    throw new ApiError(
      firstFieldError ||
        json?.message ||
        json?.error ||
        `Request failed (${res.status})`,
      res.status,
    );
  }

  // Accept both `{ data: ... }` and a bare payload.
  return (
    json && typeof json === "object" && !Array.isArray(json) && "data" in json
      ? json.data
      : json
  ) as T;
}

export const errorMessage = (e: unknown, fallback = "Something went wrong.") =>
  e instanceof Error && e.message ? e.message : fallback;

/* ── Normalizers (Laravel sends decimals as strings, dates with a time part) ── */

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const day = (v: unknown): string | null =>
  typeof v === "string" && v ? v.slice(0, 10) : null;

/* eslint-disable @typescript-eslint/no-explicit-any */
const toCommission = (r: any): CommissionLine => ({
  id: num(r.id),
  label: r.label ?? "",
  person_name: r.person_name ?? "",
  basis: r.basis ?? "contract_value",
  value: num(r.value),
  deduct_from_gross: Boolean(r.deduct_from_gross),
  release_date: day(r.release_date),
});

const toInstallment = (r: any, i: number): Installment => ({
  id: num(r.id),
  seq: num(r.seq ?? i + 1),
  due_date: day(r.due_date) ?? "",
  amount_due: num(r.amount_due),
  amount_paid: num(r.amount_paid),
  paid_date: day(r.paid_date),
  remarks: r.remarks ?? "",
});

const toContract = (r: any): Contract => {
  const installments: Installment[] | undefined = Array.isArray(r.installments)
    ? r.installments.map(toInstallment)
    : undefined;
  const received =
    r.received ??
    r.total_received ??
    installments?.reduce((s, i) => s + i.amount_paid, 0) ??
    0;
  return {
    id: num(r.id),
    client_name: r.client_name ?? "",
    service: r.service,
    term: r.term,
    contract_value: num(r.contract_value),
    start_date: day(r.start_date) ?? "",
    commissions: Array.isArray(r.commissions)
      ? r.commissions.map(toCommission)
      : [],
    received: Math.round(num(received) * 100) / 100,
    installments,
  };
};

const toDetail = (r: any): ContractDetail => {
  const contract = toContract(r.contract ?? r);
  const installments = Array.isArray(r.installments)
    ? r.installments.map(toInstallment)
    : (contract.installments ?? []);
  const commissions = Array.isArray(r.commissions)
    ? r.commissions.map(toCommission)
    : contract.commissions;
  return { contract, installments, commissions };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Endpoints ── */

const BASE = "/api/admin/contracts";

// GET /api/admin/contracts?search=&service=
export async function listContracts(params?: {
  search?: string;
  service?: string;
}): Promise<Contract[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.service) qs.set("service", params.service);
  const raw = await request<unknown>(`${BASE}${qs.size ? `?${qs}` : ""}`);
  // Also tolerate a paginated shape: { data: { data: [...] } }
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: unknown })?.data)
      ? (raw as { data: unknown[] }).data
      : [];
  return rows.map(toContract);
}

// GET /api/admin/contracts/:id
export async function getContract(id: number): Promise<ContractDetail> {
  return toDetail(await request(`${BASE}/${id}`));
}

// POST /api/admin/contracts   (backend generates the installments)
export async function createContract(input: ContractInput) {
  return request<unknown>(BASE, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PUT /api/admin/contracts/:id
export async function updateContract(id: number, input: ContractInput) {
  return request<unknown>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// DELETE /api/admin/contracts/:id
export async function deleteContract(id: number) {
  return request<unknown>(`${BASE}/${id}`, { method: "DELETE" });
}

// POST /api/admin/contracts/:id/payments   (backend allocates across installments)
export async function addPayment(
  contractId: number,
  body: { amount: number; date_received: string; remarks?: string },
) {
  return request<unknown>(`${BASE}/${contractId}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// PUT /api/admin/contract-installments/:id
export async function updateInstallment(
  installmentId: number,
  body: { amount_paid: number; paid_date: string | null; remarks: string },
) {
  return request<unknown>(`/api/admin/contract-installments/${installmentId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// PUT /api/admin/contract-commissions/:id
export async function setCommissionRelease(
  commissionId: number,
  release_date: string | null,
) {
  return request<unknown>(`/api/admin/contract-commissions/${commissionId}`, {
    method: "PUT",
    body: JSON.stringify({ release_date }),
  });
}
