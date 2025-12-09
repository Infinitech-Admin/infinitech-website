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

    // Log the request for debugging
    console.log('[Next.js API] Forwarding request to Laravel:', `${API_URL}/api/juantap-surveys`);

    // Forward FormData directly to Laravel backend with increased timeout
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60000), // Increased to 60 seconds for large uploads
    });

    console.log('[Next.js API] Laravel response status:', laravelResponse.status);
    console.log('[Next.js API] Laravel response headers:', Object.fromEntries(laravelResponse.headers.entries()));

    // Handle 504 Gateway Timeout specifically
    if (laravelResponse.status === 504) {
      return NextResponse.json(
        {
          success: false,
          message: 'Request timed out. The server took too long to respond. Please try again or upload a smaller image.',
          error: 'Gateway Timeout',
          debug: {
            api_url: API_URL,
            status: 504
          }
        },
        { status: 504 }
      );
    }

    // Check if response is JSON before parsing
    const contentType = laravelResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await laravelResponse.text();
      console.error('[Next.js API] Non-JSON response from Laravel:', text.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from server. Expected JSON but received HTML or plain text.',
          error: 'Invalid Response Type',
          debug: {
            api_url: API_URL,
            status: laravelResponse.status,
            content_type: contentType,
            response_preview: text.substring(0, 200)
          }
        },
        { status: 500 }
      );
    }

    // Parse JSON response
    let data;
    try {
      data = await laravelResponse.json();
    } catch (jsonError) {
      console.error('[Next.js API] Failed to parse JSON:', jsonError);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to parse server response',
          error: jsonError instanceof Error ? jsonError.message : 'JSON Parse Error',
          debug: {
            api_url: API_URL,
            status: laravelResponse.status
          }
        },
        { status: 500 }
      );
    }

    // Return error response from Laravel
    if (!laravelResponse.ok) {
      console.error('[Next.js API] Laravel returned error:', data);
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    // Success
    console.log('[Next.js API] Survey submitted successfully');
    return NextResponse.json(
      {
        success: true,
        message: 'Survey submitted successfully',
        data: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[Next.js API] Error in POST handler:', error);

    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Request timed out after 60 seconds. Please try uploading a smaller image or check your connection.',
          error: 'Timeout',
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
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT')
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
          error_type: error instanceof Error ? error.constructor.name : typeof error,
          error_name: error instanceof Error ? error.name : 'Unknown'
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
    
    console.log('[Next.js API] Fetching surveys from Laravel, page:', page);

    // Fetch from Laravel backend
    const laravelResponse = await fetch(`${API_URL}/api/juantap-surveys?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15 seconds
    });

    console.log('[Next.js API] Laravel GET response status:', laravelResponse.status);

    // Handle 504 Gateway Timeout
    if (laravelResponse.status === 504) {
      return NextResponse.json(
        {
          success: false,
          message: 'Request timed out while fetching surveys',
          error: 'Gateway Timeout'
        },
        { status: 504 }
      );
    }

    // Check content type
    const contentType = laravelResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await laravelResponse.text();
      console.error('[Next.js API] Non-JSON response:', text.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from server',
          error: 'Invalid Response Type',
          debug: {
            content_type: contentType,
            response_preview: text.substring(0, 200)
          }
        },
        { status: 500 }
      );
    }

    const data = await laravelResponse.json();

    if (!laravelResponse.ok) {
      console.error('[Next.js API] Laravel returned error:', data);
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[Next.js API] Error in GET handler:', error);

    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Request timed out while fetching surveys',
          error: 'Timeout'
        },
        { status: 504 }
      );
    }

    const isConnectionError = error instanceof Error && (
      error.message.includes('fetch failed') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT')
    );

    return NextResponse.json(
      {
        success: false,
        message: isConnectionError
          ? 'Cannot connect to backend server. Please ensure Laravel is running on ' + API_URL
          : 'Failed to fetch surveys',
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
