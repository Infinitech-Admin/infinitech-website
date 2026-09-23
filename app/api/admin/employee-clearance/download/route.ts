// File: app/api/admin/employee-clearance/download/route.ts
//
// POST -> calls the Laravel API to persist the clearance certificate record
// and get back the server-assigned certificate_no (sequential, starting at
// "CL - 0056"), then builds the certificate (Word or PDF) from that data and
// returns it as a download. The file itself is still generated here, in
// Next.js — Laravel never touches PDF/DOCX generation.
//
// (The clearance FORM download lives in app/api/admin/clearance/download.)

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { generateClearanceDocx } from "@/lib/generate-clearance-docx";
import { generateClearancePdf } from "@/lib/generate-clearance-pdf";
import {
  buildClearanceCertificateFilename,
  type ClearanceCertificateData,
} from "@/lib/generate-clearance-shared";

// pdf-lib / docx / fs need the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL;
// Shared secret between THIS Next.js server and Laravel — not the admin's
// personal token. The admin's adminToken means nothing to Laravel; it was
// never issued by it. Laravel checks this instead of auth:sanctum.
const LARAVEL_SERVICE_TOKEN = process.env.LARAVEL_SERVICE_TOKEN;

// certificate_no is no longer client-supplied — Laravel assigns it.
const REQUIRED = [
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

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  if (!LARAVEL_API_URL) {
    return NextResponse.json(
      { success: false, message: "LARAVEL_API_URL is not configured" },
      { status: 500 },
    );
  }

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

  // 1. Persist the record in Laravel and get the assigned certificate_no.
  let record: { certificate_no: string } | null = null;
  try {
    const upstream = await fetch(`${LARAVEL_API_URL}/api/employee-clearance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(LARAVEL_SERVICE_TOKEN
          ? { Authorization: `Bearer ${LARAVEL_SERVICE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        company,
        employee_name: body.employee_name,
        id_number: body.id_number,
        position: body.position,
        department: body.department,
        last_working_day: body.last_working_day,
        date_issued: body.date_issued || undefined,
        signatory_name: body.signatory_name || undefined,
        signatory_title: body.signatory_title || undefined,
        format,
      }),
    });

    const payload = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return NextResponse.json(
        payload ?? {
          success: false,
          message: "Failed to save the clearance certificate",
        },
        { status: upstream.status },
      );
    }

    record = payload;
  } catch (error) {
    console.error("Could not reach the clearance certificate service:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not reach the clearance certificate service",
      },
      { status: 502 },
    );
  }

  if (!record?.certificate_no) {
    return NextResponse.json(
      {
        success: false,
        message: "Clearance certificate service returned no certificate number",
      },
      { status: 502 },
    );
  }

  // 2. Build the file locally using the server-assigned certificate_no.
  const data: ClearanceCertificateData = {
    certificate_no: record.certificate_no,
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
