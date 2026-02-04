import { NextRequest, NextResponse } from "next/server";

/**
 * Get the real client IP address from the request
 * Handles various proxy/CDN scenarios (Cloudflare, Vercel, etc.)
 */
function getClientIP(request: NextRequest): string {
  // Check Cloudflare
  const cfIP = request.headers.get("CF-Connecting-IP");
  if (cfIP) return cfIP;

  // Check X-Real-IP
  const realIP = request.headers.get("X-Real-IP");
  if (realIP) return realIP;

  // Check X-Forwarded-For (get first IP in chain)
  const forwardedFor = request.headers.get("X-Forwarded-For");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[0].trim();
  }

  // Vercel-specific header
  const vercelIP = request.headers.get("X-Vercel-Forwarded-For");
  if (vercelIP) {
    const ips = vercelIP.split(",");
    return ips[0].trim();
  }

  // Fallback (this should rarely happen with proper proxy setup)
  return "unknown";
}

// POST - Time In
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, time_in } = body;

    if (!full_name || !time_in) {
      return NextResponse.json(
        { success: false, message: "Full name and time in are required" },
        { status: 400 }
      );
    }

    // Get client's real IP
    const clientIP = getClientIP(request);

    // Forward request to Laravel with client IP in headers
    const response = await fetch(
      `${process.env.LARAVEL_API_URL}/api/attendance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Forward the real client IP to Laravel
          "X-Forwarded-For": clientIP,
          "X-Real-IP": clientIP,
        },
        body: JSON.stringify({ full_name, time_in }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Add more context for IP-related errors
      if (response.status === 403) {
        return NextResponse.json(
          {
            ...data,
            message: data.message || "Access denied: IP address mismatch",
          },
          { status: 403 }
        );
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Time In error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save time in" },
      { status: 500 }
    );
  }
}

// PUT - Time Out
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, time_out } = body;

    if (!full_name || !time_out) {
      return NextResponse.json(
        { success: false, message: "Full name and time out are required" },
        { status: 400 }
      );
    }

    // Get client's real IP
    const clientIP = getClientIP(request);

    // Forward request to Laravel with client IP in headers
    const response = await fetch(
      `${process.env.LARAVEL_API_URL}/api/attendance`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Forward the real client IP to Laravel
          "X-Forwarded-For": clientIP,
          "X-Real-IP": clientIP,
        },
        body: JSON.stringify({ full_name, time_out }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Add more context for IP-related errors
      if (response.status === 403) {
        return NextResponse.json(
          {
            ...data,
            message: data.message || "Access denied: IP address mismatch",
          },
          { status: 403 }
        );
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Time Out error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save time out" },
      { status: 500 }
    );
  }
}
