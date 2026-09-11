// File: app/api/admin/coe/route.ts
import { type NextRequest, NextResponse } from "next/server";
import {
  computeNextCertificateNo,
  DEFAULT_SIGNATORY_NAME,
  DEFAULT_SIGNATORY_TITLE,
} from "@/lib/coe/certificate-number";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search");
    const url = new URL(`${laravelUrl}/api/admin/coe`);
    if (search) url.searchParams.set("search", search);

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await response.text();

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error("❌ Laravel returned HTML error page for coe GET");
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

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ coe GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend",
        error: error instanceof Error ? error.message : String(error),
        hint: "Is Laravel running? Check LARAVEL_API_URL in .env.local",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Certificate numbering + default signatory are decided here, not in
    // Laravel — ask it for the highest certificate_no on file, then compute
    // the next one ourselves.
    const lastRes = await fetch(`${laravelUrl}/api/admin/coe/last-number`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const lastText = await lastRes.text();

    if (lastText.includes("<!DOCTYPE") || lastText.includes("<html")) {
      console.error(
        "❌ Laravel returned HTML error page for coe/last-number GET",
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

    let lastData;
    try {
      lastData = JSON.parse(lastText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON response from Laravel",
          error: lastText.substring(0, 200),
        },
        { status: 500 },
      );
    }

    const certificateNo = computeNextCertificateNo(
      lastData?.data?.last_certificate_no ?? null,
    );

    const payload = {
      ...body,
      certificate_no: certificateNo,
      signatory_name: body.signatory_name || DEFAULT_SIGNATORY_NAME,
      signatory_title: body.signatory_title || DEFAULT_SIGNATORY_TITLE,
    };

    const response = await fetch(`${laravelUrl}/api/admin/coe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error("❌ Laravel returned HTML error page for coe POST");
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

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ coe POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend",
        error: error instanceof Error ? error.message : String(error),
        hint: "Is Laravel running? Check LARAVEL_API_URL in .env.local",
      },
      { status: 500 },
    );
  }
}
