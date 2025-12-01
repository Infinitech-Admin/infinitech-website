import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${API_URL}/api/inquiries/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiry', error: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log('📝 PATCH Request:', {
      url: `${API_URL}/api/inquiries/${id}/updatestatus`,
      body
    })

    const response = await fetch(`${API_URL}/api/inquiries/${id}/updatestatus`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    console.log('📥 Laravel Response:', {
      status: response.status,
      data
    })

    if (!response.ok) {
      console.error('❌ Laravel returned error:', data)
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('💥 PATCH Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update inquiry status', error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${API_URL}/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete inquiry', error: String(error) },
      { status: 500 }
    )
  }
}
