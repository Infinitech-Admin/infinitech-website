// File: lib/clearance/generate-clearance-pdf.ts
//
// PDF twin of generate-clearance-docx.ts, built with `pdfmake` — same
// choice as lib/coe/generate-coe-pdf.ts, so it runs on serverless without a
// native LibreOffice/Chromium dependency.
//
// ── LOGO SIZE (updated) ─────────────────────────────────────────────────
// The header logo width used to be a single hardcoded 90 (pt, pdfmake's
// image units) for every company — noticeably smaller than the docx
// generator's own default, and too small for Infinitech's mark, whose
// two-line subtext ("INFINITECH" / "ADVERTISING CORPORATION") became
// blurry/illegible at that size. The width now comes from
// CompanyProfile.pdfLogoWidth (lib/coe/coe-shared.ts), which Infinitech
// overrides to 140; companies without an override (ABIC) keep the same 90
// default as before, so their output is unchanged.

import fs from "fs";
import path from "path";
import sharp from "sharp";
import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  type CompanyKey,
  COMPANY_PROFILES,
  DEFAULT_COMPANY_KEY,
  FOOTER_ADDRESS,
  FOOTER_PHONE,
  getPngDimensions,
} from "@/lib/coe/coe-shared";
import {
  normalizeItems,
  type ClearancePayload,
} from "@/components/admin/clearance-types";

export type { CompanyKey };

// Same module-level pdfmake setup as generate-coe-pdf.ts. Harmless to run
// twice if both generators load in the same process; kept here too so this
// file works even if it's the only one ever imported in a given invocation.
pdfMake.setFonts({
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
});
pdfMake.setUrlAccessPolicy(() => false);

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

const PAGE_SIDE_MARGIN = 40;
const PAGE_BOTTOM_MARGIN = 30;
const NO_LOGO_TOP_MARGIN = 24;
const HEADER_EDGE_CLEARANCE = 8.5;
const FOOTER_EDGE_CLEARANCE = 0;

// Fallback header logo width (pt) when a CompanyProfile doesn't set its own
// pdfLogoWidth. Unchanged from the original hardcoded value, so any company
// without an override renders exactly as before.
const DEFAULT_PDF_LOGO_WIDTH = 90;

const NAVY = "#17365D";
const LIGHT_BLUE = "#EDF3F8";
const BORDER = "#BFBFBF";
const DEFAULT_SIGNATORY_NAME = "MARIA KRISSA CHAREZ R. BONGON";
const DEFAULT_SIGNATORY_TITLE =
  "Executive Assistant to the CEO / Human Resource Officer";

async function trimLogoPadding(buffer: Buffer, skip = false): Promise<Buffer> {
  // Skipping trim entirely (previous fix) avoided clipping into
  // "ADVERTISING CORPORATION", but it also brought back the source PNG's
  // full original padding — which inflated the measured natural height,
  // which inflated topMargin, causing the oversized gap before the title.
  // Trim + pad back a small safety margin instead: tight enough to avoid
  // a big empty gap, loose enough not to clip the subtext.
  if (skip) return buffer;
  try {
    const trimmed = await sharp(buffer)
      .trim({ threshold: 10 })
      .png()
      .toBuffer();
    return await sharp(trimmed)
      .extend({
        top: 6,
        bottom: 10,
        left: 4,
        right: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  } catch {
    return buffer;
  }
}

const noBorderLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 3,
  paddingBottom: () => 3,
};

const gridLayout = {
  hLineColor: () => BORDER,
  vLineColor: () => BORDER,
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 3,
  paddingBottom: () => 3,
};

function banner(title: string): Content {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: title,
            bold: true,
            color: "#FFFFFF",
            fillColor: NAVY,
            fontSize: 9,
          },
        ],
      ],
    },
    layout: noBorderLayout,
    margin: [0, 10, 0, 4],
  };
}

function bodyParagraph(
  text: string,
  opts: { italics?: boolean } = {},
): Content {
  return { text, fontSize: 9, margin: [0, 0, 0, 10], ...opts };
}

function labelValueTable(pairs: [string, string][]): Content {
  const widths = pairs.flatMap(() => ["auto", "*"]);
  const body = [
    pairs.flatMap(([label, value]) => [
      { text: label, bold: true, fillColor: LIGHT_BLUE, fontSize: 9 },
      { text: value || "—", fontSize: 9 },
    ]),
  ];
  return { table: { widths, body }, layout: gridLayout, margin: [0, 0, 0, 0] };
}

function headerCells(labels: string[]) {
  return labels.map((label) => ({
    text: label,
    bold: true,
    color: "#FFFFFF",
    fillColor: NAVY,
    fontSize: 8,
    alignment: "center" as const,
  }));
}

function sectionA(employee: ClearancePayload["employee"]): Content {
  return {
    stack: [
      labelValueTable([
        ["Employee Name", employee.employee_name],
        ["Employee ID", employee.id_number],
      ]),
      labelValueTable([
        ["Position", employee.position],
        ["Department", employee.department],
      ]),
    ],
    margin: [0, 0, 0, 12],
  };
}

function sectionB(units: ClearancePayload["units"]): Content[] {
  const widths = ["16%", "36%", "12%", "20%", "16%"];
  const body = [
    headerCells([
      "Responsible Unit",
      "Clearance Items to Verify",
      "Status",
      "Remarks / Pending Accountability",
      "Verified By / Date",
    ]),
    ...units.map((u) => [
      { text: u.unit, fontSize: 8 },
      { text: normalizeItems(u.items), fontSize: 8 },
      { text: "[ ] Cleared\n[ ] Pending\n[ ] N/A", fontSize: 8 },
      { text: "", fontSize: 8 },
      { text: "Name/Signature:\n\nDate:", fontSize: 8 },
    ]),
  ];

  return [
    {
      table: { widths, body, dontBreakRows: true },
      layout: gridLayout,
      margin: [0, 0, 0, 6],
    },
    {
      text: [
        { text: "Overall status after departmental review: ", bold: true },
        "[ ] CLEARED     [ ] CONDITIONALLY CLEARED     [ ] NOT YET CLEARED",
      ],
      fontSize: 9,
      margin: [0, 4, 0, 12],
    },
  ];
}

function sectionC(properties: ClearancePayload["properties"]): Content {
  const widths = ["34%", "28%", "20%", "18%"];
  const body = [
    headerCells([
      "Item / Account / Property",
      "Date Returned / Disabled",
      "Condition / Remarks",
      "Checked By",
    ]),
    ...properties.map((p) => [
      { text: p.item, fontSize: 8 },
      { text: "", fontSize: 8 },
      { text: "", fontSize: 8 },
      { text: "", fontSize: 8 },
    ]),
  ];
  return { table: { widths, body }, layout: gridLayout, margin: [0, 0, 0, 12] };
}

function sectionD(): Content {
  const widths = ["30%", "22%", "18%", "30%"];
  const blankRow = ["", "", "", ""].map((t) => ({ text: t, fontSize: 8 }));
  const body = [
    headerCells([
      "Description",
      "Supporting Reference",
      "Amount, if applicable",
      "Required Action / Due Date",
    ]),
    blankRow,
    blankRow,
  ];
  return { table: { widths, body }, layout: gridLayout, margin: [0, 0, 0, 12] };
}

function signatureBlock(employeeName: string): Content {
  const cell = (lines: string[]) => ({
    stack: lines.map((l) => ({
      text: l,
      alignment: "center" as const,
      fontSize: 9,
    })),
  });
  return {
    columns: [
      cell([
        "________________________________",
        employeeName,
        "Employee",
        "Date: ____________________",
      ]),
      cell([
        "________________________________",
        DEFAULT_SIGNATORY_NAME,
        DEFAULT_SIGNATORY_TITLE,
        "Date: ____________________",
      ]),
    ],
    margin: [0, 10, 0, 0],
  };
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
      margin: [0, HEADER_EDGE_CLEARANCE, 0, 0],
    };
  };
}

function buildFooter() {
  return (): Content => ({
    stack: [
      { text: FOOTER_ADDRESS, alignment: "center", fontSize: 8, lineHeight: 1 },
      { text: FOOTER_PHONE, alignment: "center", fontSize: 8, lineHeight: 1 },
    ],
    color: "#595959",
    margin: [PAGE_SIDE_MARGIN, 0, PAGE_SIDE_MARGIN, FOOTER_EDGE_CLEARANCE],
  });
}

export async function generateClearancePdf(
  payload: ClearancePayload,
  companyKey: CompanyKey = DEFAULT_COMPANY_KEY,
): Promise<Buffer> {
  const profile = COMPANY_PROFILES[companyKey] ?? COMPANY_PROFILES.infinitech;
  const logoPath = path.join(process.cwd(), "public/images", profile.logoFile);

  let logoDataUrl: string | null = null;
  // Per-company override (see CompanyProfile.pdfLogoWidth) so a dense mark
  // with fine subtext, like Infinitech's, can be rendered larger than a
  // simpler mark without affecting every other company.
  let logoWidth = profile.pdfLogoWidth ?? DEFAULT_PDF_LOGO_WIDTH;
  let logoHeight = Math.round(logoWidth / 2);

  if (fs.existsSync(logoPath)) {
    const rawBuffer = fs.readFileSync(logoPath);
    const buffer = await trimLogoPadding(rawBuffer);
    const { width: naturalWidth, height: naturalHeight } =
      getPngDimensions(buffer);
    logoHeight = Math.round(logoWidth * (naturalHeight / naturalWidth));
    logoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }

  const { employee, units, properties } = payload;

  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageMargins: [
      PAGE_SIDE_MARGIN,
      logoDataUrl
        ? logoHeight + HEADER_EDGE_CLEARANCE + 26
        : NO_LOGO_TOP_MARGIN,
      PAGE_SIDE_MARGIN,
      PAGE_BOTTOM_MARGIN,
    ],
    header: buildHeader(logoDataUrl, logoWidth, logoHeight),
    footer: buildFooter(),
    content: [
      {
        text: "EMPLOYEE CLEARANCE FORM",
        bold: true,
        fontSize: 15,
        alignment: "center",
        margin: [0, 4, 0, 12],
      },

      banner("A. EMPLOYEE AND SEPARATION INFORMATION"),
      sectionA(employee),

      banner("B. DEPARTMENTAL CLEARANCE"),
      bodyParagraph(
        "Instructions: Each responsible unit must mark the status, describe any pending accountability, and sign only after verification. Use N/A only when the item does not apply.",
        { italics: true },
      ),
      ...sectionB(units),

      // Fresh page for Section C onward, mirroring the docx layout.
      { text: "", pageBreak: "after" as const },

      banner("C. DETAILED PROPERTY AND ACCESS TURNOVER"),
      sectionC(properties),

      banner("D. OUTSTANDING ACCOUNTABILITIES, IF ANY"),
      bodyParagraph(
        "Describe any unresolved property, financial, documentary, project, client, or accommodation-related accountability. Attach supporting records when necessary.",
      ),
      sectionD(),

      banner("E. EMPLOYEE DECLARATION"),
      bodyParagraph(
        "I confirm that I have returned all company property in my possession, completed the required turnover, and disclosed all company accounts, credentials, records, files, and pending matters under my responsibility. I further confirm that company data has been removed from my personal devices and storage, except where retention is authorized in writing. Any remaining accountability is accurately stated above.",
      ),

      banner("F. FINAL HR CERTIFICATION"),
      bodyParagraph(
        "Based on the records and confirmations indicated in this form, the employee has completed the applicable company clearance requirements as of the date signed, subject to any subsequently discovered and properly documented accountability. This form records administrative clearance and does not waive rights or obligations provided by law, contract, or company policy.",
      ),
      signatureBlock(employee.employee_name),
    ],
    defaultStyle: { font: "Helvetica", fontSize: 9, lineHeight: 1.2 },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}
