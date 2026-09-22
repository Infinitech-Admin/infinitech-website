// File: lib/generate-clearance-shared.ts
//
// Shared pieces for the Employee CLEARANCE CERTIFICATE (the final "cleared"
// document) — used by both generate-clearance-docx.ts and
// generate-clearance-pdf.ts so the wording, date format, letterhead and
// filename live in exactly one place.
//
// NOT to be confused with the clearance FORM (Sections A/B/C checklist), which
// lives in generate-clearance-form-docx.ts / generate-clearance-form-pdf.ts.

import fs from "fs";
import path from "path";
import sharp from "sharp";

export type ClearanceCertFormat = "docx" | "pdf";

/** What the caller passes in. Dates can be ISO ("2026-09-21") or a Date. */
export interface ClearanceCertificateData {
  /** e.g. "CL - 0055" */
  certificate_no: string;
  employee_name: string;
  /** Employee ID, e.g. "26-0091" */
  id_number: string;
  position: string;
  department: string;
  last_working_day: string | Date;
  /** Defaults to today. */
  date_issued?: string | Date;
  /** Defaults to the HR signatory below. */
  signatory_name?: string;
  signatory_title?: string;
  /** Small italic line under the title. */
  signatory_role?: string;
}

export interface Letterhead {
  companyName: string;
  /** Path relative to /public — see public/letterheads/. */
  logoFile: string;
  /** Centered footer lines, printed in Times New Roman. */
  footerLines: string[];
  /**
   * Rendered logo width in points (both docx and pdf convert this to their
   * own units). Logos vary a lot in how much "ink" they have relative to
   * their trimmed bounding box — a bold, dense mark like Infinitech's reads
   * much bigger than a lighter mark like ABIC's diamond at the same width —
   * so this is tuned per company rather than shared. Defaults to
   * DEFAULT_LOGO_WIDTH_PT when omitted.
   */
  logoWidthPt?: number;
}

/** Used by any letterhead that doesn't set its own logoWidthPt. */
export const DEFAULT_LOGO_WIDTH_PT = 140;

/**
 * Add more companies here (keys = whatever your CompanyKey values are).
 * Unknown / missing keys fall back to `abic`.
 */
export const LETTERHEADS: Record<string, Letterhead> = {
  abic: {
    companyName: "ABIC Realty and Consultancy Corporation",
    logoFile: "letterheads/abic-realty.png",
    footerLines: [
      "Unit 202 Campos Rueda Bldg., Urban Avenue, Brgy. Pio Del Pilar, Makati City, 1230",
      "(02) 8646-1636",
    ],
  },
  infinitech: {
    companyName: "Infinitech Advertising Corporation",
    logoFile: "letterheads/infinitech-advertising.png",
    footerLines: [
      "Unit 311 Campos Rueda Bldg., Urban Avenue, Brgy. Pio Del Pilar, Makati City, 1230",
      "(02) 7001-6157",
    ],
    // Dense, bold mark — noticeably heavier than ABIC's at the same width,
    // so it's rendered smaller. Tune this if it's still too big/small.
    logoWidthPt: 95,
  },
};

export const DEFAULT_SIGNATORY = {
  name: "Maria Krissa Charez R. Bongon",
  title: "Executive Assistant to the CEO / Human Resource Officer",
  role: "Authorized Company Representative",
};

// ── Wording ─────────────────────────────────────────────────────────────

export interface TextSegment {
  text: string;
  bold?: boolean;
}

export const CERT_TITLE = "EMPLOYEE CLEARANCE CERTIFICATE";
export const CERT_SALUTATION = "TO WHOM IT MAY CONCERN:";

/** Paragraph 1 is split around the name blank: intro + [NAME] + rest. */
export const CERT_INTRO = "This is to certify that";

export const certParagraphs = (companyName: string) => ({
  p1Rest: [
    { text: ", formerly employed by " },
    { text: companyName, bold: true },
    {
      text: " in the position indicated above, has completed the applicable internal clearance and turnover requirements of the company.",
    },
  ] as TextSegment[],
  p2: [
    {
      text: "Based on the company's clearance records as of the date of issuance, the employee has returned the company-issued property recorded under their custody, completed the required turnover of duties, records, files, and access credentials, and has no outstanding accountability reflected in the completed clearance form.",
    },
  ] as TextSegment[],
  p3: [
    {
      text: "This certificate is issued upon the employee's request for pre-employment, employment, and other lawful purposes for which it may be required.",
    },
  ] as TextSegment[],
});

// ── Helpers ─────────────────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-09-21" | Date -> "September 21, 2026". Falls back to the raw text. */
export function formatCertDate(input?: string | Date | null): string {
  if (!input) return "";
  if (input instanceof Date) {
    return isNaN(input.getTime())
      ? ""
      : `${MONTHS[input.getMonth()]} ${input.getDate()}, ${input.getFullYear()}`;
  }
  // Parse the calendar date by hand — new Date("2026-09-21") is UTC and can
  // slip a day backwards in some timezones.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (m) return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
  const d = new Date(input);
  return isNaN(d.getTime()) ? input : formatCertDate(d);
}

export interface ResolvedCertificate {
  certificateNo: string;
  employeeName: string;
  idNumber: string;
  position: string;
  department: string;
  lastWorkingDay: string;
  dateIssued: string;
  signatoryName: string;
  signatoryTitle: string;
  signatoryRole: string;
  letterhead: Letterhead;
  /** Trimmed logo bytes — any transparent/whitespace padding baked into the
   *  source PNG has already been cropped off, so this buffer's bounding box
   *  IS the visible mark. Both generators can position straight off it. */
  logo: Buffer;
  /** Pixel dimensions of the trimmed logo, for computing aspect ratio. */
  logoWidth: number;
  logoHeight: number;
  paragraphs: ReturnType<typeof certParagraphs>;
}

/**
 * Crops any transparent (or flat-color) border off a logo PNG. Logo assets
 * frequently ship with extra padding around the mark — sharp's trim() walks
 * in from each edge and removes it, so downstream layout code can treat the
 * image's bounding box as the actual ink instead of guessing at a margin to
 * compensate for whatever padding a given company's file happens to have.
 */
async function trimLogo(
  raw: Buffer,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const buffer = await sharp(raw).trim().png().toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width ?? 0, height: meta.height ?? 0 };
}

/** Normalises the payload + loads the letterhead so both generators start from the same data. */
export async function resolveCertificate(
  data: ClearanceCertificateData,
  company?: string,
): Promise<ResolvedCertificate> {
  const letterhead = LETTERHEADS[company ?? ""] ?? LETTERHEADS.abic;
  const rawLogo = fs.readFileSync(
    path.join(process.cwd(), "public", letterhead.logoFile),
  );
  const {
    buffer: logo,
    width: logoWidth,
    height: logoHeight,
  } = await trimLogo(rawLogo);

  return {
    certificateNo: data.certificate_no,
    employeeName: data.employee_name.trim(),
    idNumber: data.id_number,
    position: data.position,
    department: data.department,
    lastWorkingDay: formatCertDate(data.last_working_day),
    dateIssued: formatCertDate(data.date_issued ?? new Date()),
    signatoryName: (data.signatory_name || DEFAULT_SIGNATORY.name)
      .trim()
      .toUpperCase(),
    signatoryTitle: data.signatory_title || DEFAULT_SIGNATORY.title,
    signatoryRole: data.signatory_role || DEFAULT_SIGNATORY.role,
    letterhead,
    logo,
    logoWidth,
    logoHeight,
    paragraphs: certParagraphs(letterhead.companyName),
  };
}

/** "CL - 0055" + "Rose Angeline Feolog Atienza" -> "CL_-_0055_-_Rose_Angeline_Feolog_Atienza.pdf" */
export function buildClearanceCertificateFilename(
  data: Pick<ClearanceCertificateData, "certificate_no" | "employee_name">,
  format: ClearanceCertFormat,
): string {
  const clean = (s: string) =>
    s
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "")
      .replace(/\s+/g, "_")
      .replace(/\.+$/, ""); // "Jr." + ".pdf" would give "Jr..pdf"
  return `${clean(data.certificate_no)}_-_${clean(data.employee_name)}.${format}`;
}
