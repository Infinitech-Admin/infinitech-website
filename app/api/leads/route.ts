// app/api/leads/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const leadData = await request.json();
    
    // Call your Laravel backend
    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${laravelApiUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(leadData)
    });

    if (!response.ok) {
      throw new Error('Failed to save lead to Laravel backend');
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save lead',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
