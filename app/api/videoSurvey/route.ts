// ============================================
// app/api/videoSurvey/route.ts
// ============================================

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    console.log("[VideoSurvey] Received video survey data:", formData)

    // Validate required fields
    if (!formData.company_name || !formData.industry) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            company_name: formData.company_name ? "" : "Company name is required",
            industry: formData.industry ? "" : "Industry is required",
          },
        },
        { status: 400 },
      )
    }

    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const laravelResponse = await fetch(`${laravelApiUrl}/api/video-surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!laravelResponse.ok) {
      const laravelError = await laravelResponse.json()
      console.error("[VideoSurvey] Laravel API error:", laravelError)

      return NextResponse.json(
        {
          success: false,
          message: laravelError.message || "Failed to submit survey to backend",
          errors: laravelError.errors,
        },
        { status: laravelResponse.status },
      )
    }

    const result = await laravelResponse.json()

    return NextResponse.json({
      success: true,
      message: "Video survey submitted successfully",
      data: result,
    })
  } catch (error) {
    console.error("[VideoSurvey] Error processing video survey:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    
    console.log("[VideoSurvey] Fetching surveys from Laravel API...")
    
    const response = await fetch(`${laravelApiUrl}/api/video-surveys?page=${page}`, {
      headers: {
        Accept: "application/json",
      },
      cache: 'no-store', // Prevent caching
    })

    if (!response.ok) {
      console.error("[VideoSurvey] Laravel API returned error status:", response.status)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to fetch surveys",
          data: []
        }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[VideoSurvey] Received data structure:", {
      success: data.success,
      hasData: !!data.data,
      dataKeys: data.data ? Object.keys(data.data) : [],
    })

    return NextResponse.json({
      success: true,
      data: data.data, // This will contain the paginated Laravel response
    })
  } catch (error) {
    console.error("[VideoSurvey] Error fetching surveys:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        data: []
      },
      { status: 500 },
    )
  }
}

