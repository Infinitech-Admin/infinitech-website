// File: app/api/admin/employee-clearance/download/route.ts
//
// POST -> builds the Employee Clearance Certificate (Word or PDF) and returns
// it as a download. Nothing is stored; the file is generated from the payload.
//
// (The clearance FORM download lives in app/api/admin/clearance/download.)

import { NextResponse } from "next/server";
import { generateClearanceDocx } from "@/lib/generate-clearance-docx";
import { generateClearancePdf } from "@/lib/generate-clearance-pdf";
import {
  buildClearanceCertificateFilename,
  type ClearanceCertificateData,
} from "@/lib/generate-clearance-shared";

// pdf-lib / docx / fs need the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED = [
  "certificate_no",
  "employee_name",
  "id_number",
  "position",
  "department",
  "last_working_day",
] as const;

const MIME = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
} as const;

export async function POST(request: Request) {
  // TODO: add the same admin-token check your /api/admin/clearance/download
  // route uses — this endpoint currently trusts any caller.

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const missing = REQUIRED.filter((k) => !String(body[k] ?? "").trim());
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, message: `Missing: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const format: "docx" | "pdf" = body.format === "docx" ? "docx" : "pdf";
  const company: string | undefined = body.company || undefined;

  const data: ClearanceCertificateData = {
    certificate_no: String(body.certificate_no).trim(),
    employee_name: String(body.employee_name),
    id_number: String(body.id_number),
    position: String(body.position),
    department: String(body.department),
    last_working_day: String(body.last_working_day),
    date_issued: body.date_issued ? String(body.date_issued) : undefined,
    signatory_name: body.signatory_name || undefined,
    signatory_title: body.signatory_title || undefined,
    signatory_role: body.signatory_role || undefined,
  };

  try {
    const file =
      format === "docx"
        ? await generateClearanceDocx(data, company)
        : await generateClearancePdf(data, company);

    const filename = buildClearanceCertificateFilename(data, format);

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": MIME[format],
        // filename* keeps "ñ" and other non-ASCII characters intact
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Clearance certificate generation failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build the clearance certificate" },
      { status: 500 },
    );
  }
}
