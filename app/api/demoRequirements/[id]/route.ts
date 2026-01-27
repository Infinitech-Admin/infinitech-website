import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_URL}/api/demo-requirements/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch demo requirement")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching demo requirement:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching the requirement",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_URL}/api/demo-requirements/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete demo requirement")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error deleting demo requirement:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while deleting the requirement",
      },
      { status: 500 }
    )
  }
}
