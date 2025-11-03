import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ message: "Password required" }, { status: 400 })
    }

    // Validate admin password from environment
    const adminPassword = process.env.ADMIN_PASSWORD
    if (password !== adminPassword) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 })
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex")

    const response = NextResponse.json({ message: "Login successful", token }, { status: 200 })

    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
