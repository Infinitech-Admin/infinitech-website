import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Create a new FormData to send to Laravel
    const laravelFormData = new FormData()

    // Copy all text fields
    const fields = [
      "business_name",
      "business_type",
      "tagline",
      "contact_info",
      "primary_purposes",
      "primary_purposes_other",
      "target_audience",
      "key_features",
      "key_features_other",
      "product_image_sources",
      "color_style",
      "social_media_links",
      "location",
    ]

    for (const field of fields) {
      const value = formData.get(field)
      if (value) {
        laravelFormData.append(field, value)
      }
    }

    // Handle file upload (business logo)
    const logoFile = formData.get("business_logo")
    if (logoFile instanceof File) {
      laravelFormData.append("business_logo", logoFile)
    }

    // Send to Laravel backend
    const response = await fetch(`${API_URL}/api/demo-requirements`, {
      method: "POST",
      body: laravelFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to submit requirements",
          errors: errorData.errors,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error submitting demo requirements:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${API_URL}/api/demo-requirements`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch demo requirements")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching demo requirements:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching requirements",
      },
      { status: 500 }
    )
  }
}
