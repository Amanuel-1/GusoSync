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
      // Allow both CONTROL_ADMIN and CONTROL_STAFF to reallocate buses
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// PUT /dashboard/api/busses/[id]/reallocate/[routeId] - Reallocate bus to new route
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; routeId: string } }
) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const { id: busId, routeId } = params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token not found' },
        { status: 401 }
      );
    }

    // Get request body (reason and priority)
    const body = await request.json().catch(() => ({}));
    const { reason, priority } = body;

    console.log(`Reallocating bus ${busId} to route ${routeId}`, { reason, priority });

    // Call the backend reallocation endpoint
    // According to OpenAPI spec, this endpoint only expects path parameters, no body
    const endpoint = `${BACKEND_API_BASE_URL}/api/control-center/buses/${busId}/reallocate-route/${routeId}`;
    console.log('Calling backend endpoint:', endpoint);

    const backendResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // No body needed according to OpenAPI spec - only path parameters
    });

    console.log('Backend response status:', backendResponse.status);
    console.log('Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));

    if (backendResponse.ok) {
      let result;
      try {
        result = await backendResponse.json();
      } catch (e) {
        // If response doesn't have JSON body, that's okay for this endpoint
        result = { success: true };
      }
      console.log('Successfully reallocated bus:', result);

      return NextResponse.json({
        success: true,
        message: `Bus ${busId} successfully reallocated to route ${routeId}`,
        data: result
      });
    } else {
      let errorData;
      try {
        errorData = await backendResponse.json();
      } catch (e) {
        errorData = { detail: `HTTP ${backendResponse.status}: ${backendResponse.statusText}` };
      }

      console.error('Failed to reallocate bus:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData,
        endpoint
      });

      return NextResponse.json(
        {
          error: 'Failed to reallocate bus',
          detail: errorData.detail || errorData.message || `HTTP ${backendResponse.status}: ${backendResponse.statusText}`,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in bus reallocation API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
