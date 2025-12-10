import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// POST - Submit Survey
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Validate email if provided
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

    // Forward FormData to Laravel backend with extended timeout
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(90000), // 90 seconds (increased from 30)
    });

    // Check if response is JSON or HTML error page
    const contentType = laravelResponse.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await laravelResponse.json();
    } else {
      // Handle HTML error responses (504, 502, etc.)
      const text = await laravelResponse.text();
      console.error('Non-JSON response from backend:', text.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          message: 'Backend server error. Please try again or contact support.',
          error: `Server returned ${laravelResponse.status}: ${laravelResponse.statusText}`,
          debug: {
            status: laravelResponse.status,
            statusText: laravelResponse.statusText,
            api_url: API_URL
          }
        },
        { status: 500 }
      );
    }

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
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Request timeout. The server took too long to respond. Please try again with a smaller image or check your connection.',
          error: 'Timeout after 90 seconds',
          debug: {
            api_url: API_URL,
            error_type: 'TimeoutError'
          }
        },
        { status: 504 }
      );
    }

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
          : 'Failed to submit survey. Please try again.',
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
    
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const contentType = laravelResponse.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await laravelResponse.json();
    } else {
      const text = await laravelResponse.text();
      console.error('Non-JSON response from backend:', text.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          message: 'Backend server error',
          error: `Server returned ${laravelResponse.status}: ${laravelResponse.statusText}`
        },
        { status: 500 }
      );
    }

    if (!laravelResponse.ok) {
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Request timeout',
          error: 'Timeout after 10 seconds'
        },
        { status: 504 }
      );
    }

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
