// File: lib/generate-clearance-pdf.ts
//
// Employee CLEARANCE CERTIFICATE as a PDF (A4, one page), drawn directly with
// pdf-lib so it doesn't depend on Word/LibreOffice being installed.
// Layout follows the approved sample "CL - 0055 - Rose Angeline Feolog Atienza".
//
// The clearance FORM (Sections A/B/C) is generate-clearance-form-pdf.ts.

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import {
  CERT_INTRO,
  CERT_SALUTATION,
  CERT_TITLE,
  DEFAULT_LOGO_WIDTH_PT,
  resolveCertificate,
  type ClearanceCertificateData,
  type TextSegment,
} from "./generate-clearance-shared";

// ── Page geometry (pt, measured from the TOP-left like the sample) ──────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT = 52.3;
const RIGHT = 537.5;
const TEXT_W = RIGHT - LEFT;
const CENTER = PAGE_W / 2;

// 0.3cm from the top of the page to the top of the logo — the logo should
// almost touch the top edge, same idea as the docx header. Width is now set
// per-letterhead (see DEFAULT_LOGO_WIDTH_PT / Letterhead.logoWidthPt) since
// different logo artwork reads bigger or smaller at the same point size.
const CM_TO_PT = 28.3465;
const LOGO_TOP = 0.3 * CM_TO_PT;

// The title's baseline is NOT a fixed number anymore. It used to be a hardcoded
// 111.9pt, which only worked for a logo of one particular height — any logo
// whose scaled height (at LOGO.width) sat lower than that baseline would run
// straight into the title text (this is what was happening with the ABIC
// logo, which includes two lines of company name under the icon). Instead we
// anchor the title a fixed gap below wherever the logo actually ends, the
// same way the docx version's paragraph flow naturally avoids the overlap.
const TITLE_GAP = 20; // space between the bottom of the logo and the title baseline
const TITLE = { size: 10 };

const SIZE_DETAIL = 8.35; // details block, salutation, signatory, footer
const SIZE_ROLE = 7.56; // italic "Authorized Company Representative"
const SIZE_PARA = 9.05; // body paragraphs

// These were originally fixed absolute baselines tuned against a title at
// 111.9pt. They're now expressed as offsets *below the title*, so the whole
// block of content shifts down (or up) together with the title instead of
// silently overlapping it when a logo is taller/shorter than expected.
const ROWS_GAP_FROM_TITLE = 47.3; // 159.2 - 111.9
const ROWS = { pitch: 13.5 };
const COL = { label1: 52.3, value1: 141.1, label2: 368.9, value2: 454.5 };
const SALUTATION_GAP_FROM_TITLE = 128.2; // 240.1 - 111.9

const PARA_GAP_FROM_TITLE = 157.2; // 269.1 - 111.9
const PARA = {
  pitch: 12.4,
  gap: 6.6, // extra space between paragraphs
  indent: 32.7,
};
const BLANK_MIN_WIDTH = 205; // the underline the name sits on

const SIGNATORY_GAP_FROM_TITLE = { name: 330.3, title: 344.1, role: 357.6 }; // -111.9 each
const FOOTER_BASELINES = [806.8, 816.5]; // anchored near the bottom of the page, unaffected by header height

const BLACK = rgb(0, 0, 0);

// Converts a top-origin baseline to pdf-lib's bottom-origin y. The 0.7pt nudge
// lines the text up with the sample, whose baselines were measured from ink.
const BASELINE_NUDGE = 0.7;
const yAt = (baseline: number) => PAGE_H - baseline - BASELINE_NUDGE;

// pdf-lib's built-in fonts only speak WinAnsi (Latin-1 + a few extras), so
// swap the common typographic characters and drop anything else it can't draw.
const safe = (s: string) =>
  s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7E\xA1-\xFF]/g, "?");

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  serif: PDFFont;
}

type Token =
  | {
      kind: "word";
      text: string;
      font: PDFFont;
      width: number;
      spaceBefore: boolean;
    }
  | { kind: "blank"; text: string; width: number; spaceBefore: boolean };

/** Splits styled segments into word tokens, remembering where spaces were. */
function tokenize(
  segments: TextSegment[],
  fonts: Fonts,
  size: number,
): Token[] {
  const tokens: Token[] = [];
  let pendingSpace = false;
  for (const seg of segments) {
    const font = seg.bold ? fonts.bold : fonts.regular;
    for (const piece of safe(seg.text).match(/\s+|\S+/g) ?? []) {
      if (/^\s+$/.test(piece)) {
        pendingSpace = true;
        continue;
      }
      tokens.push({
        kind: "word",
        text: piece,
        font,
        width: font.widthOfTextAtSize(piece, size),
        spaceBefore: pendingSpace && tokens.length > 0,
      });
      pendingSpace = false;
    }
  }
  return tokens;
}

interface DrawParams {
  page: PDFPage;
  fonts: Fonts;
}

/** Shrinks text (down to a floor) so long values never spill into the next column. */
function drawFitted(
  { page }: DrawParams,
  text: string,
  x: number,
  baseline: number,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const t = safe(text);
  let s = size;
  while (s > 6.5 && font.widthOfTextAtSize(t, s) > maxWidth) s -= 0.25;
  page.drawText(t, { x, y: yAt(baseline), size: s, font, color: BLACK });
}

function drawCentered(
  { page }: DrawParams,
  text: string,
  baseline: number,
  font: PDFFont,
  size: number,
) {
  const t = safe(text);
  page.drawText(t, {
    x: CENTER - font.widthOfTextAtSize(t, size) / 2,
    y: yAt(baseline),
    size,
    font,
    color: BLACK,
  });
}

/**
 * Lays out one justified paragraph (greedy wrap, first-line indent, last line
 * left-aligned). Returns the baseline of the paragraph's last line.
 */
function drawParagraph(
  { page, fonts }: DrawParams,
  tokens: Token[],
  firstBaseline: number,
  drawBlankName?: string,
): number {
  const size = SIZE_PARA;
  const space = fonts.regular.widthOfTextAtSize(" ", size);

  // ── wrap ──
  const lines: Token[][] = [];
  let line: Token[] = [];
  let used = 0;
  const avail = (n: number) => TEXT_W - (n === 0 ? PARA.indent : 0);
  for (const t of tokens) {
    const add = t.width + (line.length > 0 && t.spaceBefore ? space : 0);
    if (line.length > 0 && used + add > avail(lines.length) + 0.01) {
      lines.push(line);
      line = [];
      used = 0;
    }
    used += t.width + (line.length > 0 && t.spaceBefore ? space : 0);
    line.push(t);
  }
  if (line.length) lines.push(line);

  // ── draw ──
  lines.forEach((ln, i) => {
    const baseline = firstBaseline + i * PARA.pitch;
    const y = yAt(baseline);
    const isLast = i === lines.length - 1;
    const lineWidth = avail(i);
    const natural = ln.reduce(
      (w, t, k) => w + t.width + (k > 0 && t.spaceBefore ? space : 0),
      0,
    );
    const gaps = ln.filter((t, k) => k > 0 && t.spaceBefore).length;
    const gapW =
      !isLast && gaps > 0 ? space + (lineWidth - natural) / gaps : space;

    let x = LEFT + (i === 0 ? PARA.indent : 0);
    ln.forEach((t, k) => {
      if (k > 0 && t.spaceBefore) x += gapW;
      if (t.kind === "blank") {
        // the bold name sits centred on a drawn underline
        const name = safe(drawBlankName ?? "");
        page.drawText(name, {
          x: x + (t.width - fonts.bold.widthOfTextAtSize(name, size)) / 2,
          y,
          size,
          font: fonts.bold,
          color: BLACK,
        });
        page.drawLine({
          start: { x, y: y - 1.6 },
          end: { x: x + t.width, y: y - 1.6 },
          thickness: 0.6,
          color: BLACK,
        });
      } else {
        page.drawText(t.text, { x, y, size, font: t.font, color: BLACK });
      }
      x += t.width;
    });
  });

  return firstBaseline + (lines.length - 1) * PARA.pitch;
}

export async function generateClearancePdf(
  data: ClearanceCertificateData,
  company?: string,
): Promise<Buffer> {
  const c = await resolveCertificate(data, company);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${CERT_TITLE} — ${c.certificateNo}`);
  pdf.setAuthor(c.letterhead.companyName);
  pdf.setCreator(c.letterhead.companyName);

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
    serif: await pdf.embedFont(StandardFonts.TimesRoman),
  };
  const ctx: DrawParams = { page, fonts };

  // ── Letterhead ──
  const logoBytes = new Uint8Array(c.logo.byteLength);
  c.logo.copy(logoBytes);

  const logo = await pdf.embedPng(logoBytes);

  const logoWidth = c.letterhead.logoWidthPt ?? DEFAULT_LOGO_WIDTH_PT;
  const logoH = (logoWidth * logo.height) / logo.width;

  page.drawImage(logo, {
    x: CENTER - logoWidth / 2,
    y: PAGE_H - LOGO_TOP - logoH,
    width: logoWidth,
    height: logoH,
  });

  // ── Title ──
  // Anchored below the *actual* bottom of the logo, whatever its real height
  // turns out to be, instead of a baseline tuned for one specific logo shape.
  const titleBaseline = LOGO_TOP + logoH + TITLE_GAP;
  drawCentered(ctx, CERT_TITLE, titleBaseline, fonts.bold, TITLE.size);

  // Everything below the title keeps the exact spacing it had in the approved
  // sample — it just now hangs off the (possibly shifted) title baseline
  // instead of off the page origin, so header and body never collide.
  const ROWS_FIRST_BASELINE = titleBaseline + ROWS_GAP_FROM_TITLE;
  const SALUTATION_BASELINE = titleBaseline + SALUTATION_GAP_FROM_TITLE;
  const PARA_FIRST_BASELINE = titleBaseline + PARA_GAP_FROM_TITLE;
  const SIGNATORY = {
    name: titleBaseline + SIGNATORY_GAP_FROM_TITLE.name,
    title: titleBaseline + SIGNATORY_GAP_FROM_TITLE.title,
    role: titleBaseline + SIGNATORY_GAP_FROM_TITLE.role,
  };

  // ── Details block ──
  const rows: Array<[string, string, string, string, boolean?]> = [
    ["Certificate No.", c.certificateNo, "Date Issued", c.dateIssued, true],
    ["Employee Name", c.employeeName, "Employee ID", c.idNumber],
    ["Position", c.position, "Department", c.department],
    ["Last Working Day", c.lastWorkingDay, "", ""],
  ];
  rows.forEach(([l1, v1, l2, v2, italicV1], i) => {
    const baseline = ROWS_FIRST_BASELINE + i * ROWS.pitch;
    drawFitted(
      ctx,
      l1,
      COL.label1,
      baseline,
      fonts.bold,
      SIZE_DETAIL,
      COL.value1 - COL.label1 - 4,
    );
    drawFitted(
      ctx,
      v1,
      COL.value1,
      baseline,
      italicV1 ? fonts.italic : fonts.regular,
      SIZE_DETAIL,
      COL.label2 - COL.value1 - 8,
    );
    if (l2)
      drawFitted(
        ctx,
        l2,
        COL.label2,
        baseline,
        fonts.bold,
        SIZE_DETAIL,
        COL.value2 - COL.label2 - 4,
      );
    if (v2)
      drawFitted(
        ctx,
        v2,
        COL.value2,
        baseline,
        fonts.regular,
        SIZE_DETAIL,
        RIGHT - COL.value2,
      );
  });

  // ── Salutation ──
  page.drawText(CERT_SALUTATION, {
    x: LEFT,
    y: yAt(SALUTATION_BASELINE),
    size: SIZE_DETAIL,
    font: fonts.bold,
    color: BLACK,
  });

  // ── Body ──
  const nameW = fonts.bold.widthOfTextAtSize(safe(c.employeeName), SIZE_PARA);
  const blankW = Math.max(BLANK_MIN_WIDTH, nameW + 36);

  const p1: Token[] = [
    ...tokenize([{ text: CERT_INTRO }], fonts, SIZE_PARA),
    { kind: "blank", text: "", width: blankW, spaceBefore: true },
    ...tokenize(c.paragraphs.p1Rest, fonts, SIZE_PARA),
  ];
  let baseline = drawParagraph(ctx, p1, PARA_FIRST_BASELINE, c.employeeName);
  baseline = drawParagraph(
    ctx,
    tokenize(c.paragraphs.p2, fonts, SIZE_PARA),
    baseline + PARA.pitch + PARA.gap,
  );
  drawParagraph(
    ctx,
    tokenize(c.paragraphs.p3, fonts, SIZE_PARA),
    baseline + PARA.pitch + PARA.gap,
  );

  // ── Signatory ──
  page.drawText(safe(c.signatoryName), {
    x: LEFT,
    y: yAt(SIGNATORY.name),
    size: SIZE_DETAIL,
    font: fonts.bold,
    color: BLACK,
  });
  page.drawText(safe(c.signatoryTitle), {
    x: LEFT,
    y: yAt(SIGNATORY.title),
    size: SIZE_DETAIL,
    font: fonts.regular,
    color: BLACK,
  });
  page.drawText(safe(c.signatoryRole), {
    x: LEFT,
    y: yAt(SIGNATORY.role),
    size: SIZE_ROLE,
    font: fonts.italic,
    color: BLACK,
  });

  // ── Footer (centered, serif) ──
  c.letterhead.footerLines
    .slice(0, FOOTER_BASELINES.length)
    .forEach((text, i) => {
      drawCentered(ctx, text, FOOTER_BASELINES[i], fonts.serif, SIZE_DETAIL);
    });

  return Buffer.from(await pdf.save());
}
