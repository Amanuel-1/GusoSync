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

// GET /api/bus-stops/[id] - Get specific bus stop
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();

    // Use /api/buses/stops endpoint for all users
    const endpoint = `${BACKEND_API_BASE_URL}/api/buses/stops/${id}`;

    console.log(`Fetching bus stop ${id} from /api/buses/stops endpoint`);

    const backendResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      const busStop = await backendResponse.json();
      console.log('Successfully fetched bus stop:', busStop);
      return NextResponse.json({ data: busStop });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to fetch bus stop:', {
        endpoint,
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch bus stop', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/bus-stops/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/bus-stops/[id] - Update bus stop
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can update bus stops.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();
    const body = await request.json();

    console.log('Updating bus stop:', id, 'with data:', body);

    // Update bus stop in backend using /api/buses/stops
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/stops/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend update response status:', backendResponse.status);

    if (backendResponse.ok) {
      const busStop = await backendResponse.json();
      console.log('Successfully updated bus stop:', busStop);
      return NextResponse.json({ 
        data: busStop, 
        message: 'Bus stop updated successfully' 
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to update bus stop:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to update bus stop', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/bus-stops/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/bus-stops/[id] - Delete bus stop
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can delete bus stops.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();
    console.log('Deleting bus stop:', id);

    // Delete bus stop from backend using /api/buses/stops
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/stops/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend delete response status:', backendResponse.status);

    if (backendResponse.ok) {
      console.log('Successfully deleted bus stop:', id);
      return NextResponse.json({
        message: 'Bus stop deleted successfully'
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to delete bus stop:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to delete bus stop', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/bus-stops/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
