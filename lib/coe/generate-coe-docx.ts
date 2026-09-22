// File: lib/coe/generate-coe-docx.ts
//
// Generates the Certificate of Employment .docx entirely in Next.js/TypeScript
// using the `docx` npm package. Header logo + footer are attached once to the
// section and repeat across both copies; EMPLOYEE'S COPY and EMPLOYER'S COPY
// are the same section separated by a page break.
//
// ── SPACING (updated) ──────────────────────────────────────────────────
// Added extra breathing room in four places per request:
//   1. After the "Certificate No." row (the blank spacer paragraph that
//      follows buildCertNoRow, before the body text starts).
//   2. After the first body paragraph ("This is to certify that...").
//   3. After the second paragraph ("This certification is issued...").
//   4. After the "Issued this ... day of ... in ..." line.

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
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
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

// Distance (in twips, 1/1440 inch) from the physical page edge to the
// header/footer content. Set to 0 so the logo sits flush at the top of the
// page and the address/phone block sits flush at the bottom — no dead space
// above the header or below the footer. If a printer ever clips the logo or
// footer text too close to the edge, nudge these up a little (e.g. 150-200)
// rather than back to the old default of 720.
// 0.3cm = 0.3 / 2.54in * 1440 twips/in ≈ 170 twips.
const HEADER_DISTANCE = 170;
const FOOTER_DISTANCE = 0;

// docx's ImageRun transformation width/height are in pixels at 96 DPI;
// 1440 twips per inch ÷ 96 px per inch = 15 twips per pixel.
const PIXELS_TO_TWIPS = 15;
// Breathing room between the bottom of the (trimmed) logo and the first
// line of body content — not the whole fixed page margin, just a little air.
const HEADER_TOP_MARGIN_BUFFER = 650;
// Fallback top margin when there's no logo to size against.
const DEFAULT_TOP_MARGIN_NO_LOGO = 1000;

// Word applies its "Normal" style default line spacing (roughly 1.15x /
// 276 twips) to every paragraph unless a paragraph says otherwise. That
// extra leading is invisible in the editor but shows up as dead air above
// and below single-line header/footer content — the exact "big space on
// top" symptom, since spacing.before/after = 0 only controls space
// *between* paragraphs, not the line's own height. `line: 240` = exactly
// single-spaced (240 twips = 1 line at 12pt), which removes it.
const TIGHT_LINE = { line: 240, lineRule: "auto" as const };

// Most exported logo PNGs carry a chunk of transparent (or white) canvas
// around the actual mark — normal for a design file, but deadly here
// because the header height is derived straight from the image's pixel
// dimensions. Trimming that padding off before we ever measure/embed the
// image is what actually removes the gap; no page-margin setting can
// compensate for whitespace that's literally part of the source pixels.
async function trimLogoPadding(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer).trim().png().toBuffer();
  } catch {
    // If trim() finds nothing to trim (or the file isn't a clean PNG),
    // fall back to the original bytes rather than failing generation.
    return buffer;
  }
}

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: "FFFFFF",
} as const;

const noBorders = () => ({
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
});

// "Certificate No.   CE - 0050" — borderless table so label/value sit flush right,
// same trick used in the original template. Each cell's own paragraph carries
// a little top/bottom spacing so the row doesn't sit flush against whatever
// is directly above/below it (EMPLOYEE'S COPY label above, body text below).
function buildCertNoRow(certificateNo: string) {
  const spaced = certificateNo.replace("-", " - ");
  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [6000, 2000, 1500],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 6000, type: WidthType.DXA },
            borders: noBorders(),
            children: [
              new Paragraph({ spacing: { before: 100, after: 100 }, text: "" }),
            ],
          }),
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            borders: noBorders(),
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Certificate No.", bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            borders: noBorders(),
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: spaced, italics: true })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildCopy(
  coe: Coe,
  copyLabel: string,
  companyName: string,
): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      spacing: { before: 300, after: 300 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "CERTIFICATE OF EMPLOYMENT",
          bold: true,
          size: 32,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 150 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: copyLabel, bold: true, size: 18, color: "595959" }),
      ],
    }),
  );

  children.push(buildCertNoRow(coe.certificate_no));
  // 1. Space after "Certificate No." — bumped from 300 -> 500 twips.
  children.push(new Paragraph({ spacing: { after: 500 }, text: "" }));

  // Body sentence — mirrors the sample: name / company / period / position /
  // department / salary, then each checked allowance appended in order.
  const bodyRuns: TextRun[] = [
    new TextRun("This is to certify that "),
    new TextRun({ text: coe.employee_name.toUpperCase(), bold: true }),
    new TextRun(" was employed by "),
    new TextRun({ text: companyName.toUpperCase(), bold: true }),
    new TextRun(" from "),
    new TextRun({ text: formatDate(coe.period_from), bold: true }),
    new TextRun(" to "),
    new TextRun({ text: formatDate(coe.period_to), bold: true }),
    new TextRun(" as "),
    new TextRun({ text: coe.position, bold: true }),
    new TextRun(" under the "),
    new TextRun({ text: coe.department, bold: true }),
    new TextRun(
      " Department. The employee received a monthly basic salary of ",
    ),
    new TextRun({ text: formatCurrency(coe.salary), bold: true }),
  ];

  coe.allowances.forEach((allowance, index) => {
    bodyRuns.push(new TextRun(index === 0 ? " and a monthly " : " and "));
    bodyRuns.push(new TextRun({ text: allowance.label ?? "", bold: true }));
    bodyRuns.push(new TextRun(" of "));
    bodyRuns.push(
      new TextRun({ text: formatCurrency(allowance.amount), bold: true }),
    );
  });
  bodyRuns.push(new TextRun("."));

  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      // 2. Space after the first paragraph — bumped from 200 -> 350 twips.
      spacing: { after: 350 },
      children: bodyRuns,
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      // 3. Space after the second paragraph — bumped from 200 -> 350 twips.
      spacing: { after: 350 },
      children: [
        new TextRun(
          "This certification is issued upon the employee's request for employment and other lawful purposes for which it may be required.",
        ),
      ],
    }),
  );

  const issuedDateRaw = new Date(coe.issued_at);
  const issuedDate = isNaN(issuedDateRaw.getTime())
    ? new Date()
    : issuedDateRaw;
  children.push(
    new Paragraph({
      // 4. Space after "Issued this ... day of ... in ..." — bumped from
      // 400 -> 550 twips.
      spacing: { after: 550 },
      children: [
        new TextRun("Issued this "),
        new TextRun({ text: ordinal(issuedDate.getDate()), bold: true }),
        new TextRun(" day of "),
        new TextRun({
          text: issuedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          bold: true,
        }),
        new TextRun(` in ${ISSUED_CITY}.`),
      ],
    }),
  );

  children.push(
    new Paragraph({ text: "Certified by:", spacing: { after: 600 } }),
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: coe.signatory_name, bold: true })],
    }),
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: coe.signatory_title, size: 20 })],
    }),
  );
  children.push(
    new Paragraph({
      spacing: { after: 400 },
      children: [new TextRun({ text: SIGNATORY_ROLE, size: 20 })],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "This document is not valid without the original signature and official company dry seal.",
          italics: true,
          size: 18,
          color: "2E4A9E",
        }),
      ],
    }),
  );

  return children;
}

export async function generateCoeDocx(
  coeInput: Coe,
  companyKey: CompanyKey = DEFAULT_COMPANY_KEY,
): Promise<Buffer> {
  const coe = normalizeCoe(coeInput);
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
    const targetHeight = Math.round(
      targetWidth * (naturalHeight / naturalWidth),
    );
    logoTransformation = { width: targetWidth, height: targetHeight };
  }

  const header = new Header({
    children: [
      new Paragraph({
        // spacing before/after 0 so the logo doesn't pick up the Normal
        // style's default paragraph spacing on top of the header distance
        // below — this paragraph should sit flush against wherever the
        // header area starts. `line: 240` additionally kills Word's default
        // ~1.15x line-height leading, which otherwise pads a single-line
        // image paragraph with visible space above/below it.
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

  // Sized off the *trimmed* logo's actual height so the gap between the
  // header and the body text tracks whatever the logo really measures —
  // a flat 1000-twip margin looked fine only by coincidence when the old,
  // padded logo happened to be about that tall.
  const topMargin = hasLogo
    ? HEADER_DISTANCE +
      logoTransformation.height * PIXELS_TO_TWIPS +
      HEADER_TOP_MARGIN_BUFFER
    : DEFAULT_TOP_MARGIN_NO_LOGO;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // US Letter (DXA). Switch to A4 defaults if your office standard is A4.
            size: { width: 12240, height: 15840 },
            margin: {
              top: topMargin,
              bottom: 1000,
              left: 1200,
              right: 1200,
              // Distance from the page edge to the header/footer area itself
              // (separate from the top/bottom body margins above). Flush to
              // the edge so there's no gap above the logo or below the
              // footer text.
              header: HEADER_DISTANCE,
              footer: FOOTER_DISTANCE,
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [
          ...buildCopy(coe, "EMPLOYEE'S COPY", profile.name),
          new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [new PageBreak()],
          }),
          ...buildCopy(coe, "EMPLOYER'S COPY", profile.name),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
