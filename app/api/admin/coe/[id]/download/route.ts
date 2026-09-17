// File: app/api/admin/coe/[id]/download/route.ts
//
// Document generation happens here (TypeScript/Next.js), not in Laravel.
// This route only asks Laravel for the certificate's data (JSON), then
// builds the .docx or .pdf itself and streams it to the browser.

import { type NextRequest, NextResponse } from "next/server";
import { generateCoeDocx } from "@/lib/coe/generate-coe-docx";
import { generateCoePdf } from "@/lib/coe/generate-coe-pdf";
import type { Coe, CompanyKey } from "@/components/admin/coe-types";

const laravelUrl = process.env.NEXT_PUBLIC_API_UR || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ?company=abic or ?company=infinitech — anything else (missing,
    // mistyped) falls back to infinitech rather than erroring out.
    const companyParam = request.nextUrl.searchParams.get("company");
    const company: CompanyKey = companyParam === "abic" ? "abic" : "infinitech";

    // ?format=pdf or ?format=docx — anything else (missing, mistyped) falls
    // back to docx, so old links without a format param keep working exactly
    // as before.
    const formatParam = request.nextUrl.searchParams.get("format");
    const format: "docx" | "pdf" = formatParam === "pdf" ? "pdf" : "docx";

    const response = await fetch(`${laravelUrl}/api/admin/coe/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await response.text();

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error(
        "❌ Laravel returned HTML error page for coe/[id]/download GET",
      );
      return NextResponse.json(
        {
          success: false,
          message: "Laravel backend error",
          hint: "Check: 1) Is Laravel running? 2) Database connected? 3) Check storage/logs/laravel.log",
        },
        { status: 500 },
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON response from Laravel",
          error: text.substring(0, 200),
        },
        { status: 500 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message ?? "Certificate not found" },
        { status: response.status },
      );
    }

    const coe: Coe = data.data;
    const buffer =
      format === "pdf"
        ? await generateCoePdf(coe, company)
        : await generateCoeDocx(coe, company);

    const contentType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const filename =
      format === "pdf"
        ? `${coe.certificate_no}-COE.pdf`
        : `${coe.certificate_no}-COE.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("❌ coe/[id]/download GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate the certificate document",
        error: error instanceof Error ? error.message : String(error),
        hint: "Is Laravel running? Check LARAVEL_API_URL in .env.local",
      },
      { status: 500 },
    );
  }
}
