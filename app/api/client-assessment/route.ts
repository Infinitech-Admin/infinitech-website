import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward the form data to Laravel API
    const response = await fetch(`${LARAVEL_API_URL}/api/client-assessment`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to submit assessment',
          errors: data.errors || {},
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || 'Client assessment submitted successfully',
        data: data.data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'

    const response = await fetch(`${LARAVEL_API_URL}/api/client-assessment?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to retrieve assessments',
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: data.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve assessments',
      },
      { status: 500 }
    )
  }
}
