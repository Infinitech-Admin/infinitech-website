// File: lib/clearance-docx.ts
//
// SERVER ONLY (uses fs). Fills templates/employee-clearance.docx, which is
// the uploaded clearance form with these placeholders:
//
//   ${employee_name} ${employee_id} ${position} ${department}   Section A + F
//   ${unit} ${items}   inside ONE table row of Section B  -> row is cloned
//   ${item}            inside ONE table row of Section C  -> row is cloned
//
// Everything else (header logo, footer, colours, Section D/E/F wording,
// status checkboxes, Name/Signature/Date cells) is untouched, so the output
// looks exactly like the original file.
//
// Needs `jszip` (already a dependency of the `docx` package; otherwise
// `npm i jszip`).

import JSZip from "jszip";
import { readFile } from "fs/promises";
import path from "path";
import {
  normalizeItems,
  type ClearancePayload,
} from "@/components/admin/clearance-types";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "templates",
  "employee-clearance.docx",
);

type Values = Record<string, string>;

// Escape for XML text and drop characters XML 1.0 does not allow.
const xmlEscape = (s: string) =>
  s
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Replaces ${key}. Unknown keys are left alone.
const fill = (xml: string, values: Values) =>
  xml.replace(/\$\{(\w+)\}/g, (match, key: string) =>
    key in values ? xmlEscape(values[key]) : match,
  );

// Finds the table row containing `marker` and repeats it once per entry.
// (The template has no nested tables, so a non-greedy match is safe.
// `<w:tr[ >]` deliberately does not match `<w:trPr>`.)
const cloneRow = (xml: string, marker: string, rows: Values[]) =>
  xml.replace(/<w:tr[ >][\s\S]*?<\/w:tr>/g, (row) =>
    row.includes(marker)
      ? rows.map((values) => fill(row, values)).join("")
      : row,
  );

export async function buildClearanceDocx(
  payload: ClearancePayload,
): Promise<ArrayBuffer> {
  // `new Uint8Array(...)` copies the Buffer into a plain Uint8Array; newer
  // @types/node Buffers are not assignable to JSZip's InputFileFormat.
  const zip = await JSZip.loadAsync(
    new Uint8Array(await readFile(TEMPLATE_PATH)),
  );
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("Clearance template is missing document.xml");

  let xml = await docFile.async("string");

  // Section B and C: repeat the template rows first...
  xml = cloneRow(
    xml,
    "${unit}",
    payload.units.map((r) => ({
      unit: r.unit,
      items: normalizeItems(r.items),
    })),
  );
  xml = cloneRow(
    xml,
    "${item}",
    payload.properties.map((r) => ({ item: r.item })),
  );

  // ...then Section A + the employee name under Section F.
  const { employee } = payload;
  xml = fill(xml, {
    employee_name: employee.employee_name,
    employee_id: employee.id_number,
    position: employee.position,
    department: employee.department,
  });

  zip.file("word/document.xml", xml);
  return zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
