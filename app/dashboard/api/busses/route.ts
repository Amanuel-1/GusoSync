import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user has permission
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
      // Check if user has permission to access busses (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// Helper function to check if user can modify busses (CONTROL_ADMIN only)
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
      // Only CONTROL_ADMIN can create, modify, or delete busses
      const hasPermission = user.role === 'CONTROL_ADMIN';
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// GET /dashboard/api/busses - Get all busses
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

    // Extract query parameters for filtering and pagination
    const search = searchParams.get('search');
    const filter_by = searchParams.get('filter_by');
    const status = searchParams.get('status');
    const pn = searchParams.get('pn') || '1';
    const ps = searchParams.get('ps') || '1000'; // Set high limit to fetch all buses

    // Build query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (filter_by) queryParams.append('filter_by', filter_by);
    if (status) queryParams.append('status', status);
    queryParams.append('pn', pn);
    queryParams.append('ps', ps);

    // Use control-center endpoint for both admin and staff (both can view)
    const endpoint = `${BACKEND_API_BASE_URL}/api/buses?${queryParams.toString()}`;

    console.log('Fetching buses from backend:', endpoint);
    const backendResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      const busses = await backendResponse.json();
      console.log('Successfully fetched buses:', busses.length);
      return NextResponse.json({
        data: busses,
        user_role: user?.role // Include user role for frontend permission checks
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to fetch busses:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch buses', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in GET /dashboard/api/busses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /dashboard/api/busses - Create new bus (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can create buses.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();

    console.log('Creating bus with data:', body);

    // Create bus in backend using control-center endpoint
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/buses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      const newBus = await backendResponse.json();
      console.log('Successfully created bus:', newBus.id);
      return NextResponse.json({ data: newBus }, { status: 201 });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to create bus:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to create bus', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in POST /dashboard/api/busses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
