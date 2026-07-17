// 📁 Place this file at: app/api/paid-ads-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/paid-ads-requests/${params.id}`, {
      headers: { Accept: "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { code: res.status, message: data.message || "Something Went Wrong" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Paid Ads Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/paid-ads-requests/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          code: res.status,
          message: data.message || "Something Went Wrong",
          errors: data.errors ?? null,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(
      {
        code: 200,
        message: "Request Updated Successfully!",
        data: data?.data ?? data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Update Paid Ads Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const {
    name,
    email,
    phone,
    businessName,
    adPlatforms,
    monthlyBudget,
    details,
  } = await req.json();

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/paid-ads-requests/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        businessName,
        adPlatforms,
        monthlyBudget,
        details,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          code: res.status,
          message: data.message || "Something Went Wrong",
          errors: data.errors ?? null,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(
      {
        code: 200,
        message: "Request Updated Successfully!",
        data: data?.data ?? data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Update Paid Ads Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(`${apiUrl}/api/paid-ads-requests/${params.id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { code: res.status, message: data.message || "Something Went Wrong" },
        { status: res.status },
      );
    }

    return NextResponse.json(
      { code: 200, message: "Request Deleted Successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Delete Paid Ads Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}
