// File: lib/coe/generate-coe-docx.ts
//
// Generates the Certificate of Employment .docx entirely in Next.js/TypeScript
// using the `docx` npm package. Header logo + footer are attached once to the
// section and repeat across both copies; EMPLOYEE'S COPY and EMPLOYER'S COPY
// are the same section separated by a page break.

import fs from "fs";
import path from "path";
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

const COMPANY_NAME =
  process.env.COE_COMPANY_NAME ?? "INFINITECH ADVERTISING CORPORATION";
const FOOTER_ADDRESS =
  process.env.COE_FOOTER_ADDRESS ??
  "Unit 311 Campos Rueda Bldg., Urban Avenue, Brgy. Pio Del Pilar, Makati City, 1230";
const FOOTER_PHONE = process.env.COE_FOOTER_PHONE ?? "(02) 7001-6157";
const ISSUED_CITY = process.env.COE_ISSUED_CITY ?? "Makati City, Philippines";
const SIGNATORY_ROLE =
  process.env.COE_SIGNATORY_ROLE ?? "Authorized Company Representative";

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number | null | undefined) =>
  `₱${(amount ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const ordinal = (n: number) => {
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

// Fills in every string/number field TextRun/formatters touch so a single
// null field from the API can never crash document generation again. Add
// new fields here as the Coe type grows.
function normalizeCoe(coe: Coe): Coe {
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
// scaled proportionally instead of stretched into a fixed box.
function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG signature (8 bytes) + IHDR chunk: width @ 16-19, height @ 20-23 (big-endian)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

// "Certificate No.   CE - 0050" — borderless table so label/value sit flush right,
// same trick used in the original template.
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
            children: [new Paragraph("")],
          }),
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            borders: noBorders(),
            children: [
              new Paragraph({
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

function buildCopy(coe: Coe, copyLabel: string): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      spacing: { after: 200 },
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
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: copyLabel, bold: true, size: 18, color: "595959" }),
      ],
    }),
  );

  children.push(buildCertNoRow(coe.certificate_no));
  children.push(new Paragraph({ text: "" }));

  // Body sentence — mirrors the sample: name / company / period / position /
  // department / salary, then each checked allowance appended in order.
  const bodyRuns: TextRun[] = [
    new TextRun("This is to certify that "),
    new TextRun({ text: coe.employee_name.toUpperCase(), bold: true }),
    new TextRun(" was employed by "),
    new TextRun({ text: COMPANY_NAME.toUpperCase(), bold: true }),
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
    bodyRuns.push(new TextRun(" allowance of "));
    bodyRuns.push(
      new TextRun({ text: formatCurrency(allowance.amount), bold: true }),
    );
  });
  bodyRuns.push(new TextRun("."));

  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
      children: bodyRuns,
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
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
      spacing: { after: 400 },
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

export async function generateCoeDocx(coeInput: Coe): Promise<Buffer> {
  const coe = normalizeCoe(coeInput);

  const logoPath = path.join(process.cwd(), "public/images/logo.png");
  const hasLogo = fs.existsSync(logoPath);

  let logoTransformation = { width: 140, height: 70 };
  let logoBuffer: Buffer | null = null;

  if (hasLogo) {
    logoBuffer = fs.readFileSync(logoPath);
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
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: FOOTER_ADDRESS, size: 18, color: "595959" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: FOOTER_PHONE, size: 18, color: "595959" }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // US Letter (DXA). Switch to A4 defaults if your office standard is A4.
            size: { width: 12240, height: 15840 },
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [
          ...buildCopy(coe, "EMPLOYEE'S COPY"),
          new Paragraph({ children: [new PageBreak()] }),
          ...buildCopy(coe, "EMPLOYER'S COPY"),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
