// File: lib/coe/generate-coe-pdf.ts
//
// PDF twin of generate-coe-docx.ts, built with `pdfmake` (pure JS, no
// LibreOffice/native binary required, so it works on serverless runtimes
// like Vercel). Uses the standard 14 PDF fonts (Helvetica) instead of
// bundling TTFs, since the content here is plain business-letter text.
//
// npm install pdfmake sharp
// (pdfmake ships its own TypeScript types; no @types package needed)

import fs from "fs";
import path from "path";
import sharp from "sharp";
import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Coe } from "@/components/admin/coe-types";
import {
  type CompanyKey,
  COMPANY_PROFILES,
  DEFAULT_COMPANY_KEY,
  FOOTER_ADDRESS,
  FOOTER_PHONE,
  ISSUED_CITY,
  SIGNATORY_ROLE,
  formatDate,
  formatCurrency,
  ordinal,
  normalizeCoe,
  getPngDimensions,
} from "./coe-shared";

export type { CompanyKey };

// pdfmake's fonts/access-policy config lives on the shared module-level
// instance, so set it once. Calling setFonts/setLocalAccessPolicy again on
// later requests is harmless (it just overwrites with the same values).
pdfMake.setFonts({
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
});
// This generator never reads remote URLs from the document definition, so
// that stays locked down entirely.
pdfMake.setUrlAccessPolicy(() => false);

// pdfkit resolves "Helvetica-Bold" etc. through the same local-file check
// pdfmake uses to block arbitrary filesystem reads from document content —
// so a blanket `() => false` here also blocks pdfkit's own built-in
// standard fonts and throws "Access to local file denied by resource access
// policy: Helvetica-Bold". Allow-list just the standard 14 PDF font names
// (the ones baked into every PDF reader, no font files needed) and deny
// everything else, so real local paths still can't be read.
const STANDARD_PDF_FONTS = new Set([
  "Courier",
  "Courier-Bold",
  "Courier-Oblique",
  "Courier-BoldOblique",
  "Helvetica",
  "Helvetica-Bold",
  "Helvetica-Oblique",
  "Helvetica-BoldOblique",
  "Times-Roman",
  "Times-Bold",
  "Times-Italic",
  "Times-BoldItalic",
  "Symbol",
  "ZapfDingbats",
]);
pdfMake.setLocalAccessPolicy((requestedPath) =>
  STANDARD_PDF_FONTS.has(requestedPath),
);

// Same intent as HEADER_DISTANCE/FOOTER_DISTANCE in generate-coe-docx.ts:
// the header/footer callbacks below carry zero margin of their own, so the
// logo sits flush at the very top of the page's top margin and the address
// block sits flush at the very bottom of the page's bottom margin — no dead
// space above the header or below the footer.
const PAGE_SIDE_MARGIN = 55;
const PAGE_BOTTOM_MARGIN = 30; // was 46 — footer is now 2 tight lines, doesn't need that much room
const NO_LOGO_TOP_MARGIN = 24; // was 40
// Distance kept clear at the very top of the page so the logo doesn't sit
// in a printer's non-printable edge margin and get clipped — mirrors
// HEADER_DISTANCE in generate-coe-docx.ts. 0.3cm = 0.3/2.54in * 72pt/in ≈ 8.5pt.
const HEADER_EDGE_CLEARANCE = 8.5;
// Footer sits flush against the bottom page edge — no clearance.
const FOOTER_EDGE_CLEARANCE = 0;

// Most exported logo PNGs carry a chunk of transparent (or white) canvas
// around the actual mark — normal for a design file, but deadly here
// because the reserved top page margin is sized directly off the image's
// pixel height (`logoHeight + 14` below). Trimming that padding off before
// we ever measure/embed the image is what actually removes the gap; no
// margin number can compensate for whitespace that's literally part of the
// source pixels.
async function trimLogoPadding(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer).trim().png().toBuffer();
  } catch {
    // If trim() finds nothing to trim (or the file isn't a clean PNG),
    // fall back to the original bytes rather than failing generation.
    return buffer;
  }
}

function buildCertNoRow(certificateNo: string): Content {
  const spaced = certificateNo.replace("-", " - ");
  return {
    columns: [
      { text: "", width: "*" },
      {
        text: "Certificate No.",
        bold: true,
        alignment: "right",
        width: "auto",
      },
      {
        text: spaced,
        italics: true,
        alignment: "right",
        width: "auto",
        margin: [8, 0, 0, 0],
      },
    ],
    margin: [0, 10, 0, 14],
  };
}

function buildBodyParagraph(coe: Coe, companyName: string): Content {
  const runs: Content[] = [
    "This is to certify that ",
    { text: coe.employee_name.toUpperCase(), bold: true },
    " was employed by ",
    { text: companyName.toUpperCase(), bold: true },
    " from ",
    { text: formatDate(coe.period_from), bold: true },
    " to ",
    { text: formatDate(coe.period_to), bold: true },
    " as ",
    { text: coe.position, bold: true },
    " under the ",
    { text: coe.department, bold: true },
    " Department. The employee received a monthly basic salary of ",
    { text: formatCurrency(coe.salary), bold: true },
  ];

  coe.allowances.forEach((allowance, index) => {
    runs.push(index === 0 ? " and a monthly " : " and ");
    runs.push({ text: allowance.label ?? "", bold: true });
    runs.push(" of ");
    runs.push({ text: formatCurrency(allowance.amount), bold: true });
  });
  runs.push(".");

  return { text: runs, alignment: "justify", margin: [0, 0, 0, 12] };
}

function buildCopyContent(
  coe: Coe,
  copyLabel: string,
  companyName: string,
  // Set for the employer's copy so it starts on its own page — built in
  // directly rather than spreading the returned Content afterward, since
  // pdfmake's Content type is a union (it includes plain strings) and
  // TypeScript won't allow `{ ...someContent }` on a union like that.
  pageBreakBeforeTitle = false,
): Content[] {
  const issuedDateRaw = new Date(coe.issued_at);
  const issuedDate = isNaN(issuedDateRaw.getTime())
    ? new Date()
    : issuedDateRaw;

  return [
    {
      text: "CERTIFICATE OF EMPLOYMENT",
      bold: true,
      fontSize: 16,
      alignment: "center",
      margin: [0, 10, 0, 16],
      ...(pageBreakBeforeTitle ? { pageBreak: "before" as const } : {}),
    },
    {
      text: copyLabel,
      bold: true,
      fontSize: 9,
      color: "#595959",
      alignment: "right",
      margin: [0, 0, 0, 6],
    },
    buildCertNoRow(coe.certificate_no),
    buildBodyParagraph(coe, companyName),
    {
      text: "This certification is issued upon the employee's request for employment and other lawful purposes for which it may be required.",
      alignment: "justify",
      margin: [0, 0, 0, 12],
    },
    {
      text: [
        "Issued this ",
        { text: ordinal(issuedDate.getDate()), bold: true },
        " day of ",
        {
          text: issuedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          bold: true,
        },
        ` in ${ISSUED_CITY}.`,
      ],
      margin: [0, 0, 0, 24],
    },
    { text: "Certified by:", margin: [0, 0, 0, 34] },
    { text: coe.signatory_name, bold: true, margin: [0, 0, 0, 2] },
    { text: coe.signatory_title, fontSize: 9, margin: [0, 0, 0, 2] },
    { text: SIGNATORY_ROLE, fontSize: 9, margin: [0, 0, 0, 20] },
    {
      text: "This document is not valid without the original signature and official company dry seal.",
      italics: true,
      fontSize: 8,
      color: "#2E4A9E",
      alignment: "center",
    },
  ];
}

function buildHeader(
  logoDataUrl: string | null,
  width: number,
  height: number,
) {
  return (): Content => {
    if (!logoDataUrl) return { text: "", margin: [0, 0, 0, 0] };
    return {
      image: logoDataUrl,
      width,
      height,
      alignment: "center",
      // Small top margin so the logo clears the printer's non-printable
      // edge margin instead of sitting flush against it.
      margin: [0, HEADER_EDGE_CLEARANCE, 0, 0],
    };
  };
}

function buildFooter() {
  return (): Content => ({
    stack: [
      {
        text: FOOTER_ADDRESS,
        alignment: "center",
        fontSize: 8,
        lineHeight: 1, // don't let defaultStyle's 1.25 lineHeight pad these two lines
      },
      {
        text: FOOTER_PHONE,
        alignment: "center",
        fontSize: 8,
        lineHeight: 1,
      },
    ],
    color: "#595959",
    // Small bottom margin so the footer clears the printer's non-printable
    // edge margin instead of sitting flush against it.
    margin: [PAGE_SIDE_MARGIN, 0, PAGE_SIDE_MARGIN, FOOTER_EDGE_CLEARANCE],
  });
}

export async function generateCoePdf(
  coeInput: Coe,
  companyKey: CompanyKey = DEFAULT_COMPANY_KEY,
): Promise<Buffer> {
  const coe = normalizeCoe(coeInput);
  const profile = COMPANY_PROFILES[companyKey] ?? COMPANY_PROFILES.infinitech;

  const logoPath = path.join(process.cwd(), "public/images", profile.logoFile);
  let logoDataUrl: string | null = null;
  let logoWidth = 100;
  let logoHeight = 50;

  if (fs.existsSync(logoPath)) {
    const rawBuffer = fs.readFileSync(logoPath);
    const buffer = await trimLogoPadding(rawBuffer);
    const { width: naturalWidth, height: naturalHeight } =
      getPngDimensions(buffer);
    logoWidth = 100;
    logoHeight = Math.round(logoWidth * (naturalHeight / naturalWidth));
    logoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }

  const employeeCopy = buildCopyContent(coe, "EMPLOYEE'S COPY", profile.name);
  // `true` here forces the employer's copy onto its own page, mirroring the
  // PageBreak between the two copies in the docx version.
  const employerCopy = buildCopyContent(
    coe,
    "EMPLOYER'S COPY",
    profile.name,
    true,
  );

  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    // Top margin only needs to be tall enough to clear the logo (plus a hair
    // of breathing room so body text doesn't touch it); the header image
    // itself carries no extra space above it. Same idea at the bottom for
    // the footer.
    pageMargins: [
      PAGE_SIDE_MARGIN,
      logoDataUrl
        ? logoHeight + HEADER_EDGE_CLEARANCE + 30
        : NO_LOGO_TOP_MARGIN,
      PAGE_SIDE_MARGIN,
      PAGE_BOTTOM_MARGIN,
    ],
    header: buildHeader(logoDataUrl, logoWidth, logoHeight),
    footer: buildFooter(),
    content: [...employeeCopy, ...employerCopy],
    defaultStyle: { font: "Helvetica", fontSize: 10, lineHeight: 1.25 },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}
