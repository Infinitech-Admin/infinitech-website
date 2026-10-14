import { type NextRequest, NextResponse } from "next/server"
import { laravelServiceHeaders } from "@/lib/laravel-service-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const apiUrl = process.env.LARAVEL_API_URL;
    if (!apiUrl) throw new Error("LARAVEL_API_URL is not configured");

    const response = await fetch(`${apiUrl}/api/support-tickets`, {
      method: "GET",
      headers: {
        ...laravelServiceHeaders(),
        Accept: "application/json",
      },
    })

    const data = await response.json()

    return NextResponse.json(
      response.ok ? { data: data.data || [] } : data,
      { status: response.status },
    )
  } catch (error) {
    console.error("[v0] Error fetching tickets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
