import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Fetch from Laravel backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support-tickets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tickets from backend")
    }

    const data = await response.json()

    return NextResponse.json({ data: data.data || [] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching tickets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
