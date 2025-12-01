import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    console.log(`🔄 Updating inquiry ${params.id} status to:`, status)

    const response = await fetch(`${API_URL}/inquiries/${params.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Status update failed:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ Status updated successfully')
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('💥 Error updating status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update status', error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Deleting inquiry ${params.id}`)

    const response = await fetch(`${API_URL}/inquiries/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Delete failed:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ Inquiry deleted successfully')
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('💥 Error deleting inquiry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete inquiry', error: String(error) },
      { status: 500 }
    )
  }
}
