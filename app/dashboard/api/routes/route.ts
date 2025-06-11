import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user has permission to view routes
async function checkPermission(): Promise<{ authorized: boolean; user?: any }> {
  const token = await getAuthToken();
  if (!token) {
    return { authorized: false };
  }

  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      // Both CONTROL_STAFF and CONTROL_ADMIN can view routes
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// Helper function to check if user can modify routes (CONTROL_ADMIN only)
async function checkAdminPermission(): Promise<{ authorized: boolean; user?: any }> {
  const token = await getAuthToken();
  if (!token) {
    return { authorized: false };
  }

  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      // Only CONTROL_ADMIN can create, modify, or delete routes
      const hasPermission = user.role === 'CONTROL_ADMIN';
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// GET /dashboard/api/routes - Get all routes
export async function GET(request: NextRequest) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const { searchParams } = new URL(request.url);

    // Extract query parameters for pagination
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '1000'; // Set high limit to fetch all routes

    // Build query string - allow high limits for fetching all routes
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    // Use routes endpoint
    const endpoint = `${BACKEND_API_BASE_URL}/api/routes?${queryParams.toString()}`;

    console.log('Fetching routes from backend:', endpoint);
    const backendResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      const routes = await backendResponse.json();
      console.log('Successfully fetched routes:', routes.length);
      return NextResponse.json({
        data: routes,
        user_role: user?.role // Include user role for frontend permission checks
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to fetch routes:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch routes', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in GET /dashboard/api/routes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /dashboard/api/routes - Create new route
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can create routes.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();

    console.log('Creating route with data:', body);

    // Create route in backend
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/routes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend create response status:', backendResponse.status);

    if (backendResponse.ok) {
      const route = await backendResponse.json();
      console.log('Successfully created route:', route);
      return NextResponse.json({
        data: route,
        message: 'Route created successfully'
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to create route:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to create route', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in POST /dashboard/api/routes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
