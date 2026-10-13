import { type NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";

const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

type RouteContext = {
  params: Promise<{ id: string; issuanceId: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const authError = requireAdminAuth(request);

  if (authError) return authError;

  const { id, issuanceId } = await params;

  if (!/^\d+$/.test(id) || !/^\d+$/.test(issuanceId)) {
    return NextResponse.json(
      { success: false, message: "Issuance not found." },
      { status: 404 },
    );
  }

  const serviceToken = process.env.LARAVEL_SERVICE_TOKEN;

  if (!serviceToken) {
    return NextResponse.json(
      { success: false, message: "Employee service is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${laravelUrl}/api/employee-masterfile/${id}/id-issuances/${issuanceId}/actions`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceToken}`,
        },
        body: JSON.stringify(await request.json()),
        cache: "no-store",
      },
    );

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch (error) {
    console.error("Employee ID issuance action proxy failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach the employee service." },
      { status: 500 },
    );
  }
}
