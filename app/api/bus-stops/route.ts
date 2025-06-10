import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user can access bus stops (both CONTROL_STAFF and CONTROL_ADMIN)
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
      // Check if user has permission to access bus stops (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// Helper function to check if user can modify bus stops (CONTROL_ADMIN only)
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
      // Only CONTROL_ADMIN can create, modify, or delete bus stops
      const hasPermission = user.role === 'CONTROL_ADMIN';
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// GET /api/bus-stops - Get all bus stops
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

    // Use /api/buses/stops endpoint for all users (both CONTROL_STAFF and CONTROL_ADMIN)
    const endpoint = `${BACKEND_API_BASE_URL}/api/buses/stops`;

    console.log('Fetching bus stops from /api/buses/stops endpoint');

    const backendResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      const busStops = await backendResponse.json();
      console.log('Successfully fetched bus stops:', busStops.length);
      return NextResponse.json({ data: busStops, user_role: user.role });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to fetch bus stops:', {
        endpoint,
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch bus stops', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/bus-stops:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bus-stops - Create new bus stop
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can create bus stops.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();

    console.log('Creating bus stop with data:', body);

    // Create bus stop in backend using /api/buses/stops
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/stops`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend create response status:', backendResponse.status);

    if (backendResponse.ok) {
      const busStop = await backendResponse.json();
      console.log('Successfully created bus stop:', busStop);
      return NextResponse.json({ 
        data: busStop, 
        message: 'Bus stop created successfully' 
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to create bus stop:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to create bus stop', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/bus-stops:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
