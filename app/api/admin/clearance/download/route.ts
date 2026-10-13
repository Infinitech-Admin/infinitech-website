// File: app/api/admin/clearance/download/route.ts

// POST /api/admin/clearance/download
//
// Body: ClearanceDownloadPayload (see components/admin/clearance-types.ts)
// the usual ClearancePayload (employee/units/properties) plus:
//   company: "infinitech" | "abic" -> which letterhead to use
//   format: "docx" | "pdf"          -> which file to build
//
// Returns the filled file. Nothing is stored here — the file is generated
// on the fly, the same way the COE download works.

import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { generateClearanceDocx } from "@/lib/clearance/generate-clearance-docx";
import { generateClearancePdf } from "@/lib/clearance/generate-clearance-pdf";

import { COMPANY_OPTIONS } from "@/components/admin/coe-types";

import {
  buildClearanceFilename,
  type ClearanceDocFormat,
  type ClearanceDownloadPayload,
} from "@/components/admin/clearance-types";

export const runtime = "nodejs"; // needs fs (logo files) + sharp

const MAX_ROWS = 50;
const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL || "http://localhost:8000";

const VALID_COMPANIES = new Set(COMPANY_OPTIONS.map((o) => o.value));

const VALID_FORMATS = new Set<ClearanceDocFormat>(["docx", "pdf"]);

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function parsePayload(body: any): ClearanceDownloadPayload | null {
  const e = body?.employee;

  if (!e || !Array.isArray(body?.units) || !Array.isArray(body?.properties)) {
    return null;
  }

  const units = body.units
    .slice(0, MAX_ROWS)
    .map((r: any) => ({
      unit: str(r?.unit, 100),
      items: str(r?.items, 2000),
    }))
    .filter((r: { unit: string; items: string }) => r.unit && r.items);

  const properties = body.properties
    .slice(0, MAX_ROWS)
    .map((r: any) => ({
      item: str(r?.item, 200),
    }))
    .filter((r: { item: string }) => r.item);

  const employee = {
    employee_id: Number(e.employee_id) || 0,
    employee_name: str(e.employee_name, 150),
    id_number: str(e.id_number, 50),
    position: str(e.position, 150),
    department: str(e.department, 150),
  };

  const company = VALID_COMPANIES.has(body?.company) ? body.company : null;

  const format = VALID_FORMATS.has(body?.format) ? body.format : null;

  if (
    employee.employee_id <= 0 ||
    !employee.employee_name ||
    !units.length ||
    !properties.length ||
    !company ||
    !format
  ) {
    return null;
  }

  return {
    employee,
    units,
    properties,
    company,
    format,
  };
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const payload = parsePayload(await request.json());

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid clearance data",
        },
        { status: 400 },
      );
    }

    const { format, company, ...docPayload } = payload;
    const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;
    if (!serviceToken) {
      return NextResponse.json(
        { success: false, message: "Employee service is not configured." },
        { status: 500 },
      );
    }

    const backendHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${serviceToken}`,
    };
    const employeeResponse = await fetch(
      `${LARAVEL_API_URL}/api/employee-masterfile/${payload.employee.employee_id}`,
      { headers: backendHeaders, cache: "no-store" },
    );
    if (!employeeResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Unable to verify the clearance employee." },
        { status: employeeResponse.status },
      );
    }

    const employeeResult = await employeeResponse.json();
    const employeeRecord = employeeResult?.data;
    if (
      Number(employeeRecord?.id) !== payload.employee.employee_id ||
      String(employeeRecord?.id_number ?? "").trim() !==
        payload.employee.id_number
    ) {
      return NextResponse.json(
        { success: false, message: "The clearance employee could not be verified." },
        { status: 404 },
      );
    }

    if (employeeRecord.signature_path) {
      const signatureResponse = await fetch(
        `${LARAVEL_API_URL}/api/employee-masterfile/${payload.employee.employee_id}/files/signature`,
        { headers: backendHeaders, cache: "no-store" },
      );
      if (!signatureResponse.ok) {
        return NextResponse.json(
          { success: false, message: "Unable to load the employee signature." },
          { status: signatureResponse.status },
        );
      }

      const mimeType = signatureResponse.headers.get("content-type");
      if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
        return NextResponse.json(
          { success: false, message: "The employee signature has an unsupported format." },
          { status: 415 },
        );
      }

      docPayload.employee_signature = {
        data: new Uint8Array(await signatureResponse.arrayBuffer()),
        mimeType,
      };
    }

    const file =
      format === "pdf"
        ? await generateClearancePdf(docPayload, company)
        : await generateClearanceDocx(docPayload, company);

    const filename = buildClearanceFilename(
      payload.employee.employee_name,
      payload.employee.id_number,
      format,
    );

    const contentType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // Node.js Buffer -> Uint8Array
    // NextResponse expects a Web-compatible BodyInit.
    const fileData = new Uint8Array(file);

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Clearance generation failed:", error);

    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate the clearance form",
        ...(isDev && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 },
    );
  }
}
