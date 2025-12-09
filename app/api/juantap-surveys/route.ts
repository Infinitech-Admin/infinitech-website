import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// POST - Submit Survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Received body:', body); // Debug log

    // Validate email format if provided
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            email: ['Please enter a valid email address']
          }
        },
        { status: 422 }
      );
    }

    // Validate social media array if provided (skip if null)
    if (body.social_media && Array.isArray(body.social_media) && body.social_media.length > 0) {
      for (const social of body.social_media) {
        if (!social.platform || !social.url) {
          return NextResponse.json(
            {
              success: false,
              errors: {
                social_media: ['Each social media entry must have platform and url']
              }
            },
            { status: 422 }
          );
        }
      }
    }

    // Send to Laravel backend
    const laravelResponse = await fetch(`${API_URL}/juantap-surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await laravelResponse.json();

    console.log('Laravel response:', data); // Debug log

    if (!laravelResponse.ok) {
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Survey submitted successfully',
        data: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit survey',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - List all surveys
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    
    // Fetch from Laravel backend
    const laravelResponse = await fetch(`${API_URL}/juantap-surveys?page=${page}`, {
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
    console.error('Error fetching surveys:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch surveys',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



