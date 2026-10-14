import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (
      typeof password !== "string" ||
      password.length === 0 ||
      (identifier !== undefined &&
        (typeof identifier !== "string" || identifier.trim().length === 0))
    ) {
      return NextResponse.json(
        { message: "Enter a password and, for personnel accounts, a login identifier." },
        { status: 400 },
      );
    }

    const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";
    const loginResponse = await fetch(`${laravelUrl}/api/admin/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(identifier ? { identifier, password } : { password }),
      cache: "no-store",
    });
    const result = await loginResponse.json();

    if (!loginResponse.ok) {
      return NextResponse.json(
        { message: result.message || "Unable to sign in." },
        { status: loginResponse.status },
      );
    }

    const response = NextResponse.json(
      { message: "Login successful.", user: result.user },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );

    response.cookies.set("adminToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 500 },
    );
  }
}
