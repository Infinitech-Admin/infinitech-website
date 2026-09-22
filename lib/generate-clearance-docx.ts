import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
  LineRuleType,
  HeightRule,
  NoBreakHyphen,
} from "docx";
import {
  CERT_INTRO,
  CERT_SALUTATION,
  CERT_TITLE,
  resolveCertificate,
  type ClearanceCertificateData,
  type TextSegment,
} from "./generate-clearance-shared";

const FONT = "Arial";
const FOOTER_FONT = "Times New Roman";

// Half-points (docx sizes are in half-points): 17 = 8.5pt.
const SIZE_BODY = 17;
const SIZE_TITLE = 20;
const SIZE_ROLE = 15;
// The body paragraphs are set a touch larger than the details block (9pt vs 8.5pt).
const SIZE_PARA = 18;
// Docx only takes whole half-points, so a hair of tracking (twips) gets the 9pt
// paragraphs to the ≈9.15pt the sample uses and keeps the same line breaks.
const PARA_TRACKING = 2;

// Twips (1pt = 20)
const BODY_LINE = 248; // 12.4pt line pitch, like the sample
const ROW_LINE = 270; // 13.5pt rows in the details block (rows grow if a long value wraps)
const PAGE = { width: 11906, height: 16838 }; // A4
// Top margin: 0.3cm (1cm = 566.93 twips), so the logo almost touches the top
// of the page — same spacing as the PDF header.
const MARGIN = { top: 170, left: 1046, right: 1156, bottom: 900 };
const TEXT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right; // 9704

// Details block: label | value | label | value
const COLS = [1780, 4560, 1712, TEXT_WIDTH - 1780 - 4560 - 1712];

const NBSP = "\u00A0";
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NONE,
  bottom: NONE,
  left: NONE,
  right: NONE,
  insideHorizontal: NONE,
  insideVertical: NONE,
};

const run = (
  text: string,
  opts: {
    bold?: boolean;
    italics?: boolean;
    size?: number;
    underline?: { type: (typeof UnderlineType)[keyof typeof UnderlineType] };
    characterSpacing?: number;
  } = {},
) => new TextRun({ text, font: FONT, size: SIZE_BODY, ...opts });

/**
 * Hyphens inside a word ("company-issued") become non-breaking hyphens so Word
 * never splits a compound word across two lines — same behaviour as the PDF.
 */
const segmentRuns = (segments: TextSegment[]) =>
  segments.map((s) => {
    const parts = s.text.split(/(?<=\w)-(?=\w)/);
    const children = parts.flatMap((part, i) =>
      i < parts.length - 1 ? [part, new NoBreakHyphen()] : [part],
    );
    return new TextRun({
      children,
      font: FONT,
      size: SIZE_PARA,
      bold: s.bold,
      characterSpacing: PARA_TRACKING,
    });
  });

const bodyParagraph = (children: TextRun[], indent = true) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: indent ? { firstLine: 654 } : undefined, // ≈ 32.7pt, same as the sample
    spacing: {
      line: BODY_LINE,
      lineRule: LineRuleType.EXACT,
      after: 140,
    },
    children,
  });

/** Detail cell — `bold` for the labels, plain for the values. */
const cell = (text: string, width: number, bold = false, italic = false) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
    margins: { top: 0, bottom: 0, left: 0, right: 60 },
    children: [
      new Paragraph({
        spacing: { line: ROW_LINE, lineRule: LineRuleType.EXACT },
        children: [run(text, { bold, italics: italic })],
      }),
    ],
  });

const detailRow = (
  l1: string,
  v1: string,
  l2 = "",
  v2 = "",
  italicValue1 = false,
) =>
  new TableRow({
    height: { value: ROW_LINE, rule: HeightRule.ATLEAST },
    children: [
      cell(l1, COLS[0], true),
      cell(v1, COLS[1], false, italicValue1),
      cell(l2, COLS[2], true),
      cell(v2, COLS[3]),
    ],
  });

/**
 * The name sits on a blank line: bold, underlined, padded with non-breaking
 * spaces so the line is a similar length whatever the name is (NBSPs are never
 * stretched by justification, so the underline stays put).
 */
function nameBlank(name: string): TextRun {
  const TARGET_PT = 205; // underline length in the sample
  const NBSP_PT = 2.5; // width of a non-breaking space at 9pt Arial
  const approxNameWidth = name.length * 4.9;
  const pad = Math.max(
    3,
    Math.round((TARGET_PT - approxNameWidth) / 2 / NBSP_PT),
  );
  const padding = NBSP.repeat(pad);
  return run(`${padding}${name}${padding}`, {
    bold: true,
    size: SIZE_PARA,
    underline: { type: UnderlineType.SINGLE },
  });
}

export async function generateClearanceDocx(
  data: ClearanceCertificateData,
  company?: string,
): Promise<Buffer> {
  const c = await resolveCertificate(data, company);

  // Logo: 187px wide (≈140pt @96dpi), scaled to the *trimmed* logo's real
  // aspect ratio — not a hardcoded guess, since that only matched one
  // particular company's logo shape and distorted/mis-sized any other.
  const LOGO_W = 187;
  const LOGO_H = Math.round((LOGO_W * c.logoHeight) / c.logoWidth);

  const doc = new Document({
    creator: c.letterhead.companyName,
    title: `${CERT_TITLE} — ${c.certificateNo}`,
    styles: { default: { document: { run: { font: FONT, size: SIZE_BODY } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: MARGIN.top,
              left: MARGIN.left,
              right: MARGIN.right,
              bottom: MARGIN.bottom,
              footer: 440,
            },
          },
        },
        footers: {
          default: new Footer({
            children: c.letterhead.footerLines.map(
              (line) =>
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 194, lineRule: LineRuleType.EXACT },
                  children: [
                    new TextRun({
                      text: line,
                      font: FOOTER_FONT,
                      size: SIZE_BODY,
                    }),
                  ],
                }),
            ),
          }),
        },
        children: [
          // ── Letterhead ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new ImageRun({
                type: "png",
                data: c.logo,
                transformation: { width: LOGO_W, height: LOGO_H },
                altText: {
                  title: c.letterhead.companyName,
                  description: "Company logo",
                  name: "logo",
                },
              }),
            ],
          }),

          // ── Title ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 434, after: 0 },
            children: [run(CERT_TITLE, { bold: true, size: SIZE_TITLE })],
          }),

          // ── Details block ──
          new Paragraph({
            spacing: {
              before: 0,
              after: 0,
              line: 686,
              lineRule: LineRuleType.EXACT,
            },
            children: [],
          }),
          new Table({
            width: { size: TEXT_WIDTH, type: WidthType.DXA },
            columnWidths: COLS,
            borders: NO_BORDERS,
            rows: [
              detailRow(
                "Certificate No.",
                c.certificateNo,
                "Date Issued",
                c.dateIssued,
                true,
              ),
              detailRow(
                "Employee Name",
                c.employeeName,
                "Employee ID",
                c.idNumber,
              ),
              detailRow("Position", c.position, "Department", c.department),
              detailRow("Last Working Day", c.lastWorkingDay),
            ],
          }),

          // ── Salutation ──
          new Paragraph({
            spacing: {
              before: 560,
              after: 0,
              line: 250,
              lineRule: LineRuleType.EXACT,
            },
            children: [run(CERT_SALUTATION, { bold: true })],
          }),

          // ── Body ──
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 654 },
            spacing: {
              before: 340,
              line: BODY_LINE,
              lineRule: LineRuleType.EXACT,
              after: 140,
            },
            children: [
              run(`${CERT_INTRO} `, {
                size: SIZE_PARA,
                characterSpacing: PARA_TRACKING,
              }),
              nameBlank(c.employeeName),
              ...segmentRuns(c.paragraphs.p1Rest),
            ],
          }),
          bodyParagraph(segmentRuns(c.paragraphs.p2)),
          bodyParagraph(segmentRuns(c.paragraphs.p3)),

          // ── Signatory ──
          new Paragraph({
            spacing: {
              before: 1170,
              after: 0,
              line: 276,
              lineRule: LineRuleType.EXACT,
            },
            children: [run(c.signatoryName, { bold: true })],
          }),
          new Paragraph({
            spacing: { after: 0, line: 276, lineRule: LineRuleType.EXACT },
            children: [run(c.signatoryTitle)],
          }),
          new Paragraph({
            spacing: { after: 0, line: 270, lineRule: LineRuleType.EXACT },
            children: [
              run(c.signatoryRole, { italics: true, size: SIZE_ROLE }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
