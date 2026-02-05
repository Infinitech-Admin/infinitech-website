import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/api/client-assessment/${params.uuid}`, {
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
          message: data.message || 'Failed to retrieve assessment',
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
        message: 'Failed to retrieve assessment',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${LARAVEL_API_URL}/api/client-assessment/${params.uuid}`, {
      method: 'POST', // Laravel uses POST with _method field for PUT in FormData
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to update assessment',
          errors: data.errors || {},
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || 'Assessment updated successfully',
        data: data.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update assessment',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/api/client-assessment/${params.uuid}`, {
      method: 'DELETE',
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
          message: data.message || 'Failed to delete assessment',
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || 'Assessment deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete assessment',
      },
      { status: 500 }
    )
  }
}
