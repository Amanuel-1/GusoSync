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

// GET /dashboard/api/busses/[id] - Get specific bus
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();

    // Fetch bus from backend
    console.log('Fetching bus from backend:', id);
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      const bus = await backendResponse.json();
      console.log('Successfully fetched bus:', bus);
      return NextResponse.json({ data: bus });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to fetch bus:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch bus', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in GET /dashboard/api/busses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /dashboard/api/busses/[id] - Update bus
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can update busses.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();
    const body = await request.json();

    console.log('Updating bus:', id, 'with data:', body);

    // Update bus in backend
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend update response status:', backendResponse.status);

    if (backendResponse.ok) {
      const bus = await backendResponse.json();
      console.log('Successfully updated bus:', bus);
      return NextResponse.json({ 
        data: bus, 
        message: 'Bus updated successfully' 
      });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to update bus:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to update bus', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in PUT /dashboard/api/busses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /dashboard/api/busses/[id] - Delete bus (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can delete buses.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();

    console.log('Deleting bus:', id);

    // Delete bus in backend using control-center endpoint
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      console.log('Successfully deleted bus:', id);
      return NextResponse.json({ message: 'Bus deleted successfully' });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to delete bus:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to delete bus', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /dashboard/api/busses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
