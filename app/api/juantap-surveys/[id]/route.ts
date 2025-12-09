import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// GET - Get specific survey by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch from Laravel backend
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await laravelResponse.json();

    if (!laravelResponse.ok) {
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch survey',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
