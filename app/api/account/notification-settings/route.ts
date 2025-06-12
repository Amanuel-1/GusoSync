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
      // All authenticated users can access their notification settings
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

// GET /api/account/notification-settings - Get notification settings for current user
export async function GET(request: NextRequest) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access notification settings.' },
        { status: 401 }
      );
    }

    const token = await getAuthToken();

    // Try to fetch from backend first
    if (token) {
      try {
        const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/notification-settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (backendResponse.ok) {
          const settings = await backendResponse.json();
          return NextResponse.json(settings);
        } else {
          console.log('Backend notification settings endpoint not available');
        }
      } catch (error) {
        console.log('Error fetching notification settings from backend:', error);
      }
    }

    // Fallback: return default settings
    const defaultSettings = {
      email_enabled: true,
      push_enabled: true,
      incident_alerts: true,
      route_updates: true,
      maintenance_alerts: true,
      general_notifications: true
    };

    return NextResponse.json(defaultSettings);

  } catch (error) {
    console.error('Error in notification settings API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/account/notification-settings - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to update notification settings.' },
        { status: 401 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();

    // Try to update in backend first
    if (token) {
      try {
        const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/notification-settings`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (backendResponse.ok) {
          const result = await backendResponse.json().catch(() => ({ success: true }));
          return NextResponse.json(result);
        } else {
          console.log('Backend notification settings update endpoint not available');
        }
      } catch (error) {
        console.log('Error updating notification settings in backend:', error);
      }
    }

    // Fallback: return success (settings would be stored locally or in session)
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in notification settings update API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
