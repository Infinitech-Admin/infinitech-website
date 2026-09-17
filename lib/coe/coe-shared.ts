// File: lib/coe/coe-shared.ts
//
// Company profiles, env-driven constants, and formatting helpers shared by
// generate-coe-docx.ts and generate-coe-pdf.ts. Pulled out into its own
// module so the two generators can't drift out of sync with each other.

import type { Coe } from "@/components/admin/coe-types";

export type CompanyKey = "infinitech" | "abic";

export interface CompanyProfile {
  name: string;
  // File name only — resolved against public/images/ by each generator.
  // Drop the actual PNGs in that folder; no other setup needed.
  logoFile: string;
}

export const COMPANY_PROFILES: Record<CompanyKey, CompanyProfile> = {
  infinitech: {
    name: process.env.COE_COMPANY_NAME ?? "INFINITECH ADVERTISING CORPORATION",
    logoFile: process.env.COE_INFINITECH_LOGO_FILE ?? "logo.png",
  },
  abic: {
    name:
      process.env.COE_ABIC_COMPANY_NAME ??
      "ABIC REALTY & CONSULTANCY CORPORATION",
    logoFile: process.env.COE_ABIC_LOGO_FILE ?? "ABIC-Realty-logo.png",
  },
};

export const DEFAULT_COMPANY_KEY: CompanyKey =
  (process.env.COE_DEFAULT_COMPANY as CompanyKey) ?? "infinitech";

export const FOOTER_ADDRESS =
  process.env.COE_FOOTER_ADDRESS ??
  "Unit 311 Campos Rueda Bldg., Urban Avenue, Brgy. Pio Del Pilar, Makati City, 1230";
export const FOOTER_PHONE = process.env.COE_FOOTER_PHONE ?? "(02) 7001-6157";
export const ISSUED_CITY =
  process.env.COE_ISSUED_CITY ?? "Makati City, Philippines";
export const SIGNATORY_ROLE =
  process.env.COE_SIGNATORY_ROLE ?? "Authorized Company Representative";

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatCurrency = (amount: number | string | null | undefined) => {
  const numeric = Number(amount ?? 0);
  const safeNumeric = isNaN(numeric) ? 0 : numeric;
  return `₱${safeNumeric.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const ordinal = (n: number) => {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

// Fills in every string/number field the generators touch so a single null
// field from the API can never crash document generation. Add new fields
// here as the Coe type grows.
export function normalizeCoe(coe: Coe): Coe {
  return {
    ...coe,
    employee_name: coe.employee_name ?? "",
    position: coe.position ?? "",
    department: coe.department ?? "",
    certificate_no: coe.certificate_no ?? "",
    period_from: coe.period_from ?? "",
    period_to: coe.period_to ?? "",
    issued_at: coe.issued_at ?? "",
    salary: coe.salary ?? 0,
    allowances: coe.allowances ?? [],
    signatory_name: coe.signatory_name ?? "",
    signatory_title: coe.signatory_title ?? "",
  };
}

// Reads a PNG's real pixel dimensions from its IHDR chunk so the logo can be
// scaled proportionally instead of stretched into a fixed box. Used by both
// generators when sizing the header image.
export function getPngDimensions(buffer: Buffer): {
  width: number;
  height: number;
} {
  // PNG signature (8 bytes) + IHDR chunk: width @ 16-19, height @ 20-23 (big-endian)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}
