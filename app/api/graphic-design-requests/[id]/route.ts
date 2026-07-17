// 📁 Place this file at: app/api/graphic-design-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(
      `${apiUrl}/api/graphic-design-requests/${params.id}`,
      { headers: { Accept: "application/json" } },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { code: res.status, message: data.message || "Something Went Wrong" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Graphic Design Request Error:", error);
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
  const { name, email, phone, businessName, designCategories, details } =
    await req.json();

  try {
    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const res = await fetch(
      `${apiUrl}/api/graphic-design-requests/${params.id}`,
      {
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
          designCategories,
          details,
        }),
      },
    );

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
    console.error("❌ Update Graphic Design Request Error:", error);
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

    const res = await fetch(
      `${apiUrl}/api/graphic-design-requests/${params.id}`,
      {
        method: "DELETE",
        headers: { Accept: "application/json" },
      },
    );

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
    console.error("❌ Delete Graphic Design Request Error:", error);
    return NextResponse.json(
      { code: 500, message: "Something Went Wrong" },
      { status: 500 },
    );
  }
}
