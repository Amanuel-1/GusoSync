import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

export async function GET() {
  try {
    console.log('Testing backend connectivity...');
    
    // Test a simple endpoint that doesn't require authentication
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    
    if (response.ok) {
      const data = await response.json().catch(() => ({ message: 'Backend is responding' }));
      return NextResponse.json({
        success: true,
        message: 'Backend is reachable',
        status: response.status,
        data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Backend responded with error',
        status: response.status
      });
    }
  } catch (error) {
    console.error('Backend connectivity test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
