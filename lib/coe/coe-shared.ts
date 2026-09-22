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
  /**
   * Header logo width in the `docx` package's ImageRun units (px, ~96dpi).
   * Logos vary in how much fine detail they carry at a given width — a
   * dense mark with a two-line subtext (like Infinitech's) needs to be
   * rendered bigger before that subtext stays legible than a simpler mark
   * (like ABIC's) does — so this is tuned per company rather than shared.
   * Falls back to each generator's own default (140) when omitted.
   */
  docxLogoWidth?: number;
  /**
   * Header logo width in `pdfmake`'s image units (pt, 72dpi — NOT the same
   * scale as docxLogoWidth above, hence the separate field). Same
   * per-company legibility reasoning as docxLogoWidth. Falls back to each
   * generator's own default (90) when omitted.
   */
  pdfLogoWidth?: number;
  /**
   * Skip sharp's trim() padding-removal step for this company's logo
   * before it's embedded/measured. trim() (even at a tightened
   * threshold:1) was still shaving a sliver off the bottom edge of
   * Infinitech's "ADVERTISING CORPORATION" subtext — its antialiased
   * pixels apparently still read as near-enough to the corner/background
   * color to count as "padding". Rather than keep chasing a threshold
   * value, Infinitech's logo opts out of trimming entirely. Leave
   * undefined/false for logos that DO have real transparent padding worth
   * trimming (e.g. ABIC).
   */
  skipLogoTrim?: boolean;
}

export const COMPANY_PROFILES: Record<CompanyKey, CompanyProfile> = {
  infinitech: {
    name: process.env.COE_COMPANY_NAME ?? "INFINITECH ADVERTISING CORPORATION",
    logoFile: process.env.COE_INFINITECH_LOGO_FILE ?? "logo.png",
    // Infinitech's mark carries a two-line subtext ("INFINITECH" /
    // "ADVERTISING CORPORATION") that reads as blurry/compressed at the
    // shared defaults — bumped up until it stays legible. Chosen to match
    // roughly the same physical on-page size as the clearance
    // CERTIFICATE's logoWidthPt: 140 (see lib/clearance/
    // generate-clearance-shared.ts) — that one is pt-based via a 96/72
    // conversion; docxLogoWidth is the px-equivalent, pdfLogoWidth the
    // pt-equivalent for pdfmake.
    docxLogoWidth: 155,
    pdfLogoWidth: 140,
    // See skipLogoTrim doc comment above — trim() was clipping into the
    // subtext, so this logo is embedded untrimmed.
    skipLogoTrim: false,
  },
  abic: {
    name:
      process.env.COE_ABIC_COMPANY_NAME ??
      "ABIC REALTY & CONSULTANCY CORPORATION",
    logoFile: process.env.COE_ABIC_LOGO_FILE ?? "ABIC-Realty-logo.png",
    // No override — ABIC's simpler mark (no small subtext) reads fine at
    // each generator's existing default width, and trim() is safe to run
    // on it as-is (no fine text near the padding edge).
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
