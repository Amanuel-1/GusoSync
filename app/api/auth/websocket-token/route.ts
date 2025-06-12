import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from HTTP-only cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return the token for WebSocket connection
    // This is safe because it's only accessible to authenticated users
    return NextResponse.json(
      { token: authToken.value },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting WebSocket token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
