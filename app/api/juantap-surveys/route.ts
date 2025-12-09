import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// POST - Submit Survey
export async function POST(request: NextRequest) {
  try {
    // Get FormData from request
    const formData = await request.formData();

    // Extract and validate email if provided
    const email = formData.get('email') as string;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    // Validate social media array if provided
    const socialMediaStr = formData.get('social_media') as string;
    if (socialMediaStr) {
      try {
        const socialMedia = JSON.parse(socialMediaStr);
        if (Array.isArray(socialMedia) && socialMedia.length > 0) {
          for (const social of socialMedia) {
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
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            errors: {
              social_media: ['Invalid social media format']
            }
          },
          { status: 422 }
        );
      }
    }

    // Forward FormData directly to Laravel backend
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys`, {
      method: 'POST',
      body: formData,
      // Add a reasonable timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    const data = await laravelResponse.json();

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
    // Check if it's a connection error
    const isConnectionError = error instanceof Error && (
      error.message.includes('fetch failed') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET')
    );

    return NextResponse.json(
      {
        success: false,
        message: isConnectionError 
          ? 'Cannot connect to backend server. Please ensure Laravel is running on ' + API_URL
          : 'Failed to submit survey',
        error: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          api_url: API_URL,
          error_type: error instanceof Error ? error.constructor.name : typeof error
        }
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
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    const data = await laravelResponse.json();

    if (!laravelResponse.ok) {
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    const isConnectionError = error instanceof Error && (
      error.message.includes('fetch failed') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET')
    );

    return NextResponse.json(
      {
        success: false,
        message: isConnectionError
          ? 'Cannot connect to backend server. Please ensure Laravel is running on ' + API_URL
          : 'Failed to fetch surveys',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
