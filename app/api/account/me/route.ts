import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'https://guzosync-fastapi.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get('authToken');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the request to the FastAPI backend
    const apiUrl = `${API_BASE_URL}/api/account/me`;
    console.log('Forwarding user details request to:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (apiResponse.ok) {
      const userData = await apiResponse.json();
      console.log('User details fetched successfully:', userData);
      return NextResponse.json(userData, { status: 200 });
    } else {
      console.error('Failed to fetch user details from API:', apiResponse.status);
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch user details', details: errorData },
        { status: apiResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in /api/account/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
