

import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey ID is required",
        },
        { status: 400 }
      )
    }

    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    console.log(`[VideoSurvey] Fetching survey with ID: ${id}`)

    const laravelResponse = await fetch(`${laravelApiUrl}/api/video-surveys/${id}`, {
      headers: {
        Accept: "application/json",
      },
      cache: 'no-store',
    })

    if (!laravelResponse.ok) {
      const laravelError = await laravelResponse.json()
      console.error("[VideoSurvey] Laravel API fetch error:", laravelError)

      return NextResponse.json(
        {
          success: false,
          message: laravelError.message || "Failed to fetch survey",
        },
        { status: laravelResponse.status }
      )
    }

    const result = await laravelResponse.json()

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("[VideoSurvey] Error fetching video survey:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey ID is required",
        },
        { status: 400 }
      )
    }

    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    console.log(`[VideoSurvey] Deleting survey with ID: ${id}`)

    const laravelResponse = await fetch(`${laravelApiUrl}/api/video-surveys/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    })

    if (!laravelResponse.ok) {
      const laravelError = await laravelResponse.json()
      console.error("[VideoSurvey] Laravel API delete error:", laravelError)

      return NextResponse.json(
        {
          success: false,
          message: laravelError.message || "Failed to delete survey",
        },
        { status: laravelResponse.status }
      )
    }

    const result = await laravelResponse.json()

    return NextResponse.json({
      success: true,
      message: "Video survey deleted successfully",
      data: result,
    })
  } catch (error) {
    console.error("[VideoSurvey] Error deleting video survey:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const formData = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey ID is required",
        },
        { status: 400 }
      )
    }

    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    console.log(`[VideoSurvey] Updating survey with ID: ${id}`)

    const laravelResponse = await fetch(`${laravelApiUrl}/api/video-surveys/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!laravelResponse.ok) {
      const laravelError = await laravelResponse.json()
      console.error("[VideoSurvey] Laravel API update error:", laravelError)

      return NextResponse.json(
        {
          success: false,
          message: laravelError.message || "Failed to update survey",
          errors: laravelError.errors,
        },
        { status: laravelResponse.status }
      )
    }

    const result = await laravelResponse.json()

    return NextResponse.json({
      success: true,
      message: "Video survey updated successfully",
      data: result,
    })
  } catch (error) {
    console.error("[VideoSurvey] Error updating video survey:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
