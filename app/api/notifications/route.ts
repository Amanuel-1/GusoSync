import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check permissions
async function checkPermission() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  if (!authToken) {
    return { authorized: false, user: null };
  }

  try {
    // Verify token by making a request to the backend
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      // All authenticated users can access notifications
      return { authorized: true, user };
    } else {
      console.error('Failed to verify user with token:', response.status);
      return { authorized: false, user: null };
    }
  } catch (error) {
    console.error('Error verifying user with token:', error);
    return { authorized: false, user: null };
  }
}

// GET /api/notifications - Get all notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access notifications.' },
        { status: 401 }
      );
    }

    const token = await getAuthToken();

    // Try to fetch from backend first
    if (token) {
      try {
        const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/notifications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (backendResponse.ok) {
          const notifications = await backendResponse.json();
          console.log('Successfully fetched notifications from backend:', notifications.length);
          return NextResponse.json(notifications);
        } else {
          console.log('Backend notifications endpoint not available, using fallback');
        }
      } catch (error) {
        console.log('Error fetching from backend notifications:', error);
      }
    }

    // Fallback: return empty array or mock notifications
    console.log('Using fallback notifications for user:', user?.username);
    
    // Return empty array for now - notifications will come via WebSocket
    return NextResponse.json([]);

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/mark-all-read - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access notifications.' },
        { status: 401 }
      );
    }

    const token = await getAuthToken();

    // Try to call backend endpoint
    if (token) {
      try {
        const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/notifications/mark-all-read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (backendResponse.ok) {
          const result = await backendResponse.json().catch(() => ({ success: true }));
          return NextResponse.json(result);
        } else {
          console.log('Backend mark-all-read endpoint not available');
        }
      } catch (error) {
        console.log('Error calling backend mark-all-read:', error);
      }
    }

    // Fallback: return success (since notifications are handled via WebSocket)
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in mark-all-read API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
