// File: lib/clearance/generate-clearance-docx.ts
//
// Builds the Employee Clearance Form entirely in code with the `docx`
// package — same technique as lib/coe/generate-coe-docx.ts — instead of
// splicing the uploaded template's XML. This is what lets the form carry a
// per-company letterhead (logo + footer), the same way the COE does, since
// the original employee-clearance.docx template has no header/footer at all.
//
// Sections A–F match the uploaded template 1:1 in content and order; the
// navy (#17365D) banners and light-blue (#EDF3F8) label cells reproduce its
// look. Section D and the two blank rows under it, the [ ] Cleared / [ ]
// Pending / [ ] N/A checkboxes, and the Name/Signature/Date cells are the
// same as the original — those are meant to be filled in by hand or pen,
// not by the wizard.
//
// Every table sets three properties to match the uploaded template exactly:
//   - `alignment: AlignmentType.CENTER`, matching the template's per-row
//     `w:jc="center"`. Without it, a table narrower than the page's content
//     width sits flush against the left margin instead of being centered,
//     leaving a lopsided gap on the right.
//   - `layout: TableLayoutType.FIXED`, matching the template's
//     `<w:tblLayout w:type="fixed"/>` (present on all 11 of its tables).
//     Without it, Word falls back to "Autofit to Contents" and
//     recalculates column widths from each cell's text — which is why the
//     single-cell navy banners (short text like "A. EMPLOYEE AND
//     SEPARATION INFORMATION") were shrinking to hug their own text instead
//     of spanning the full page width like the data table under them.
//   - `columnWidths`, spelling out the same numbers used for each cell's
//     `width`. The `docx` package does NOT derive `<w:tblGrid>` (the column
//     skeleton Word reads for a FIXED-layout table) from per-cell widths on
//     its own — omit `columnWidths` and it writes a dummy 100-twip grid for
//     every column instead. Under "auto" layout Word mostly ignored that
//     bogus grid and used each cell's real `tcW`, so it went unnoticed; the
//     moment `layout: FIXED` was added (previous fix), Word started trusting
//     that dummy grid, which is what blew "Responsible Unit" up to a huge
//     width, squeezed the other columns, and inflated row height. Supplying
//     `columnWidths` makes the written `<w:tblGrid>` match the real column
//     widths, exactly like the uploaded template's own `<w:tblGrid>`.
//
// ── PAGE SIZE / PAGINATION (updated) ────────────────────────────────────
// Switched from US Letter to A4 bond paper. The Section B/C/D column-width
// arrays below were originally hand-tuned twip numbers that summed exactly
// to the old Letter-based PAGE_WIDTH_DXA (10166), so simply changing
// PAGE_WIDTH_DXA would have left every table either overflowing the new
// narrower A4 content width or leaving a gap on the right. `scaleWidths()`
// rescales each of those original arrays (kept as *_BASE constants,
// unchanged) proportionally against the new PAGE_WIDTH_DXA, snapping the
// rounding remainder onto the last column so the row still sums exactly.
//
// Sections A–C are also now kept together on page 1: vertical spacing
// (banner/cell margins, paragraph spacing, spacers, the header top-margin
// buffer) was trimmed throughout to reclaim room, and a manual PageBreak is
// inserted right after Section C so Section D always starts a fresh page
// instead of Word deciding where the D/E/F content happens to land.

import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  TableLayoutType,
  WidthType,
  VerticalAlign,
  ShadingType,
  BorderStyle,
  PageBreak,
} from "docx";
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

// ── layout constants (mirrors generate-coe-docx.ts) ────────────────────

const HEADER_DISTANCE = 170;
const FOOTER_DISTANCE = 0;
const PIXELS_TO_TWIPS = 15;
// Trimmed from 500 -> 300: this buffer sat between the logo's bottom edge
// and the title, purely as breathing room. Shrinking it claws back vertical
// space so Sections A-C have a better chance of fitting on page 1.
const HEADER_TOP_MARGIN_BUFFER = 300;
// Trimmed from 900 -> 600 for the same reason, for the no-logo case.
const DEFAULT_TOP_MARGIN_NO_LOGO = 600;
const TIGHT_LINE = { line: 240, lineRule: "auto" as const };

// ── template look ───────────────────────────────────────────────────────

const NAVY = "17365D";
const LIGHT_BLUE = "EDF3F8";
const FONT = "Segoe UI";
const TEXT_SIZE = 18; // half-points = 9pt, matches the uploaded template

// A4 in twips (standard docx page size): 210mm x 297mm.
const PAGE_WIDTH_TWIPS = 11906;
const PAGE_HEIGHT_TWIPS = 16838;
const MARGIN_LEFT = 900;
const MARGIN_RIGHT = 900;
// Trimmed bottom margin from 1000 -> 600 to reclaim vertical space.
const MARGIN_BOTTOM = 600;

// Full content width used throughout the template. Previously a literal
// (10166) tuned for US Letter; now derived from the actual A4 content
// width, minus the same small safety buffer (274 twips) the original value
// left against MARGIN_LEFT+MARGIN_RIGHT under Letter, so table borders
// never brush the margin.
const CONTENT_WIDTH_BUFFER = 274;
const PAGE_WIDTH_DXA =
  PAGE_WIDTH_TWIPS - MARGIN_LEFT - MARGIN_RIGHT - CONTENT_WIDTH_BUFFER;

// The column-width arrays below (Section B/C/D) were originally hand-tuned
// twip numbers against the old Letter-based content width of 10166. Kept
// here unchanged as the scaling basis; scaleWidths() rescales them against
// the current PAGE_WIDTH_DXA (now A4) so proportions are preserved exactly.
const LETTER_BASE_PAGE_WIDTH_DXA = 10166;

/**
 * Rescales a set of hand-tuned column widths (summing to `baseTotal`) to
 * instead sum exactly to `targetTotal`, preserving each column's relative
 * proportion. Rounding remainder is snapped onto the last column so the
 * row always sums to exactly `targetTotal` (required for TableLayout.FIXED
 * tables, where the written <w:tblGrid> must match the page width).
 */
function scaleWidths(
  base: number[],
  baseTotal: number,
  targetTotal: number,
): number[] {
  const scaled = base.map((w) => Math.round((w / baseTotal) * targetTotal));
  const diff = targetTotal - scaled.reduce((a, b) => a + b, 0);
  scaled[scaled.length - 1] += diff;
  return scaled;
}

const DEFAULT_SIGNATORY_NAME = "MARIA KRISSA CHAREZ R. BONGON";
const DEFAULT_SIGNATORY_TITLE =
  "Executive Assistant to the CEO / Human Resource Officer";

// Same reasoning as the COE generators: exported logos usually carry
// transparent padding, and the header height is derived from the image's
// pixel size, so trim it before measuring/embedding.
async function trimLogoPadding(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer).trim().png().toBuffer();
  } catch {
    return buffer;
  }
}

// ── small building blocks ──────────────────────────────────────────────

function run(
  text: string,
  opts: Partial<InstanceType<typeof TextRun>> & Record<string, unknown> = {},
) {
  return new TextRun({ text, size: TEXT_SIZE, font: FONT, ...opts });
}

/** Full-width navy banner, e.g. "A. EMPLOYEE AND SEPARATION INFORMATION". */
function banner(title: string) {
  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: [PAGE_WIDTH_DXA],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
            shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
            // Trimmed top/bottom from 55 -> 40 to reclaim vertical space.
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0, ...TIGHT_LINE },
                children: [run(title, { bold: true, color: "FFFFFF" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function paragraph(text: string, opts: { italics?: boolean } = {}) {
  return new Paragraph({
    // Trimmed spacing from before:80/after:160 -> before:60/after:100.
    spacing: { before: 60, after: 100 },
    children: [run(text, opts)],
  });
}

/** "Instructions: ..." line — bold label, plain text after, matches the template. */
function instructionsParagraph(text: string) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [run("Instructions: ", { bold: true }), run(text)],
  });
}

function spacer(after = 120) {
  return new Paragraph({ text: "", spacing: { after } });
}

// ── Section A ───────────────────────────────────────────────────────────

function labelValuePairRow(pairs: [string, string][]) {
  const labelWidth = 1700; // fits "Employee Name" / "Department" on one line
  const valueWidth = Math.floor(PAGE_WIDTH_DXA / pairs.length) - labelWidth;
  return new TableRow({
    children: pairs.flatMap(([label, value]) => [
      new TableCell({
        width: { size: labelWidth, type: WidthType.DXA },
        shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR, color: "auto" },
        verticalAlign: VerticalAlign.CENTER,
        // Trimmed top/bottom from 70 -> 50.
        margins: { top: 50, bottom: 50, left: 90, right: 90 },
        children: [new Paragraph({ children: [run(label, { bold: true })] })],
      }),
      new TableCell({
        width: { size: valueWidth, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 50, bottom: 50, left: 90, right: 90 },
        children: [new Paragraph({ children: [run(value || "—")] })],
      }),
    ]),
  });
}

function sectionATable(employee: ClearancePayload["employee"]) {
  const labelWidth = 1700;
  const valueWidth = Math.floor(PAGE_WIDTH_DXA / 2) - labelWidth;
  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: [labelWidth, valueWidth, labelWidth, valueWidth],
    rows: [
      labelValuePairRow([
        ["Employee Name", employee.employee_name],
        ["Employee ID", employee.id_number],
      ]),
      labelValuePairRow([
        ["Position", employee.position],
        ["Department", employee.department],
      ]),
    ],
  });
}

// ── shared table header/body cells for B, C, D ─────────────────────────

function headerRow(labels: string[], widths: number[]) {
  return new TableRow({
    tableHeader: true,
    children: labels.map(
      (label, i) =>
        new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
          verticalAlign: VerticalAlign.CENTER,
          // Trimmed top/bottom from 70 -> 50.
          margins: { top: 50, bottom: 50, left: 90, right: 90 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [run(label, { bold: true, color: "FFFFFF" })],
            }),
          ],
        }),
    ),
  });
}

function dataCell(text: string, width: number) {
  const lines = text.split("\n");
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: lines.map((line) => new Paragraph({ children: [run(line)] })),
  });
}

function blankCell(width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [new Paragraph({ children: [] })],
  });
}

// ── Section B ───────────────────────────────────────────────────────────

function sectionBTable(units: ClearancePayload["units"]) {
  const BASE_WIDTHS = [1613, 3872, 1080, 1787, 1814];
  const widths = scaleWidths(
    BASE_WIDTHS,
    LETTER_BASE_PAGE_WIDTH_DXA,
    PAGE_WIDTH_DXA,
  );
  const rows = [
    headerRow(
      [
        "Responsible Unit",
        "Clearance Items to Verify",
        "Status",
        "Remarks / Pending Accountability",
        "Verified By / Date",
      ],
      widths,
    ),
  ];

  units.forEach((u) => {
    rows.push(
      new TableRow({
        children: [
          dataCell(u.unit, widths[0]),
          dataCell(normalizeItems(u.items), widths[1]),
          dataCell("[ ] Cleared\n[ ] Pending\n[ ] N/A", widths[2]),
          blankCell(widths[3]),
          dataCell("Name/Signature:\n\nDate:", widths[4]),
        ],
      }),
    );
  });

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    rows,
  });
}

function overallStatusParagraph() {
  return new Paragraph({
    // Trimmed spacing from before:200/after:100 -> before:120/after:80.
    spacing: { before: 120, after: 80 },
    children: [
      run("Overall status after departmental review: ", { bold: true }),
      run("[ ] CLEARED     [ ] CONDITIONALLY CLEARED     [ ] NOT YET CLEARED"),
    ],
  });
}

// ── Section C ───────────────────────────────────────────────────────────

function sectionCTable(properties: ClearancePayload["properties"]) {
  const BASE_WIDTHS = [3505, 2995, 2131, 1526];
  const widths = scaleWidths(
    BASE_WIDTHS,
    LETTER_BASE_PAGE_WIDTH_DXA,
    PAGE_WIDTH_DXA,
  );
  const rows = [
    headerRow(
      [
        "Item / Account / Property",
        "Date Returned / Disabled",
        "Condition / Remarks",
        "Checked By",
      ],
      widths,
    ),
  ];

  properties.forEach((p) => {
    rows.push(
      new TableRow({
        children: [
          dataCell(p.item, widths[0]),
          blankCell(widths[1]),
          blankCell(widths[2]),
          blankCell(widths[3]),
        ],
      }),
    );
  });

  // "Other:" catch-all row, matching the uploaded template
  // rows.push(
  //   new TableRow({
  //     children: [
  //       dataCell("Other: ____________________", widths[0]),
  //       blankCell(widths[1]),
  //       blankCell(widths[2]),
  //       blankCell(widths[3]),
  //     ],
  //   }),
  // );

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    rows,
  });
}

// ── Section D (left blank for handwriting, 2 rows like the template) ───

function sectionDTable() {
  const BASE_WIDTHS = [3197, 2333, 1843, 2794];
  const widths = scaleWidths(
    BASE_WIDTHS,
    LETTER_BASE_PAGE_WIDTH_DXA,
    PAGE_WIDTH_DXA,
  );
  const rows = [
    headerRow(
      [
        "Description",
        "Supporting Reference",
        "Amount, if applicable",
        "Required Action / Due Date",
      ],
      widths,
    ),
  ];
  for (let i = 0; i < 2; i++) {
    rows.push(new TableRow({ children: widths.map((w) => blankCell(w)) }));
  }
  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    rows,
  });
}

// ── Section F signature block ───────────────────────────────────────────

function signatureBlock(employeeName: string) {
  const width = Math.floor(PAGE_WIDTH_DXA / 2);
  const cell = (lines: string[]) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      children: lines.map(
        (line) =>
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run(line)],
          }),
      ),
    });

  return new Table({
    width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: [width, width],
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
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
      }),
    ],
  });
}

// ── entry point ──────────────────────────────────────────────────────────

export async function generateClearanceDocx(
  payload: ClearancePayload,
  companyKey: CompanyKey = DEFAULT_COMPANY_KEY,
): Promise<Buffer> {
  const profile = COMPANY_PROFILES[companyKey] ?? COMPANY_PROFILES.infinitech;
  const logoPath = path.join(process.cwd(), "public/images", profile.logoFile);
  const hasLogo = fs.existsSync(logoPath);

  let logoTransformation = { width: 140, height: 70 };
  let logoBuffer: Buffer | null = null;

  if (hasLogo) {
    const rawLogoBuffer = fs.readFileSync(logoPath);
    logoBuffer = await trimLogoPadding(rawLogoBuffer);
    const { width: naturalWidth, height: naturalHeight } =
      getPngDimensions(logoBuffer);
    const targetWidth = 140;
    logoTransformation = {
      width: targetWidth,
      height: Math.round(targetWidth * (naturalHeight / naturalWidth)),
    };
  }

  const header = new Header({
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0, ...TIGHT_LINE },
        alignment: AlignmentType.CENTER,
        children:
          hasLogo && logoBuffer
            ? [
                new ImageRun({
                  type: "png",
                  data: logoBuffer,
                  transformation: logoTransformation,
                }),
              ]
            : [],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0, ...TIGHT_LINE },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: FOOTER_ADDRESS, size: 18, color: "595959" }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 0, ...TIGHT_LINE },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: FOOTER_PHONE, size: 18, color: "595959" }),
        ],
      }),
    ],
  });

  const topMargin = hasLogo
    ? HEADER_DISTANCE +
      logoTransformation.height * PIXELS_TO_TWIPS +
      HEADER_TOP_MARGIN_BUFFER
    : DEFAULT_TOP_MARGIN_NO_LOGO;

  const { employee, units, properties } = payload;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // A4 bond paper (was US Letter: 12240 x 15840).
            size: { width: PAGE_WIDTH_TWIPS, height: PAGE_HEIGHT_TWIPS },
            margin: {
              top: topMargin,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
              right: MARGIN_RIGHT,
              header: HEADER_DISTANCE,
              footer: FOOTER_DISTANCE,
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            // Trimmed spacing from before:100/after:200 -> before:60/after:120.
            spacing: { before: 60, after: 120 },
            children: [
              new TextRun({
                text: "EMPLOYEE CLEARANCE FORM",
                bold: true,
                size: 32,
                font: FONT,
              }),
            ],
          }),

          banner("A. EMPLOYEE AND SEPARATION INFORMATION"),
          sectionATable(employee),
          spacer(),

          instructionsParagraph(
            "Each responsible unit must mark the status, describe any pending accountability, and sign only after verification. Use N/A only when the item does not apply.",
          ),
          banner("B. DEPARTMENTAL CLEARANCE"),
          sectionBTable(units),
          overallStatusParagraph(),
          spacer(),

          banner("C. DETAILED PROPERTY AND ACCESS TURNOVER"),
          sectionCTable(properties),

          // Sections A, B, and C must stay together on page 1. A manual
          // page break here guarantees Section D always starts a fresh
          // page, rather than leaving it to Word's natural flow (which is
          // what the previous version intentionally did).
          new Paragraph({ children: [new PageBreak()] }),

          banner("D. OUTSTANDING ACCOUNTABILITIES, IF ANY"),
          paragraph(
            "Describe any unresolved property, financial, documentary, project, client, or accommodation-related accountability. Attach supporting records when necessary.",
          ),
          sectionDTable(),
          spacer(),

          banner("E. EMPLOYEE DECLARATION"),
          paragraph(
            "I confirm that I have returned all company property in my possession, completed the required turnover, and disclosed all company accounts, credentials, records, files, and pending matters under my responsibility. I further confirm that company data has been removed from my personal devices and storage, except where retention is authorized in writing. Any remaining accountability is accurately stated above.",
          ),

          banner("F. FINAL HR CERTIFICATION"),
          paragraph(
            "Based on the records and confirmations indicated in this form, the employee has completed the applicable company clearance requirements as of the date signed, subject to any subsequently discovered and properly documented accountability. This form records administrative clearance and does not waive rights or obligations provided by law, contract, or company policy.",
          ),
          spacer(180),
          signatureBlock(employee.employee_name),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
