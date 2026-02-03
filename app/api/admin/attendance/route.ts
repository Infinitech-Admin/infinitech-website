import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const laravelUrl = process.env.LARAVEL_API_URL || "http://localhost:8000";

    console.log("🔍 Fetching from:", `${laravelUrl}/api/admin/attendance`);

    const response = await fetch(`${laravelUrl}/api/admin/attendance`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Response status:", response.status);
    
    const contentType = response.headers.get("content-type");
    console.log("📄 Content-Type:", contentType);

    // Get the raw text first
    const text = await response.text();
    console.log("📝 Response length:", text.length);
    console.log("📝 First 200 chars:", text.substring(0, 200));

    // Check if it's HTML (Laravel error page)
    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error("❌ Laravel returned HTML error page");
      
      // Try to extract error message from HTML
      const errorMatch = text.match(/<title>(.*?)<\/title>/);
      const errorTitle = errorMatch ? errorMatch[1] : "Unknown error";
      
      return NextResponse.json(
        {
          success: false,
          message: "Laravel backend error",
          error: errorTitle,
          hint: "Check: 1) Is Laravel running? 2) Database connected? 3) Table exists? 4) Check storage/logs/laravel.log",
        },
        { status: 500 }
      );
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON response from Laravel",
          error: text.substring(0, 200),
        },
        { status: 500 }
      );
    }

    console.log("✅ Data received:", data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend",
        error: error instanceof Error ? error.message : String(error),
        hint: "Is Laravel running on port 8000? Check LARAVEL_API_URL in .env.local",
      },
      { status: 500 }
    );
  }
}
