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
async function checkPermission(requiredRole?: string): Promise<{ authorized: boolean; user?: any }> {
  const token = await getAuthToken();
  if (!token) {
    return { authorized: false };
  }

  try {
    // Get current user details
    const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return { authorized: false };
    }

    const user = await userResponse.json();
    
    // Check if user has required role
    if (requiredRole) {
      const hasPermission = user.role === 'CONTROL_ADMIN' ||
                           (requiredRole === 'CONTROL_STAFF' && (user.role === 'CONTROL_STAFF' || user.role === 'CONTROL_ADMIN'));
      return { authorized: hasPermission, user };
    }

    // For general access, allow CONTROL_ADMIN and CONTROL_STAFF
    const hasGeneralPermission = user.role === 'CONTROL_ADMIN' || user.role === 'CONTROL_STAFF';
    return { authorized: hasGeneralPermission, user };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { authorized: false };
  }
}

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = Math.random().toString(36).substring(7);
  const { id } = params;
  console.log(`[${requestId}] GET /api/users/${id} - Starting request`);

  try {
    console.log(`[${requestId}] Checking user permissions`);
    const { authorized } = await checkPermission();
    if (!authorized) {
      console.log(`[${requestId}] Authorization failed - returning 403`);
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();

    // Try to get user details - we might need to check multiple endpoints
    // First try the general account endpoint
    const apiUrl = `${BACKEND_API_BASE_URL}/api/account/${id}`;
    console.log(`[${requestId}] Fetching user details from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[${requestId}] API response: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[${requestId}] Successfully fetched user:`, {
        userId: data.id,
        email: data.email,
        role: data.role,
        isActive: data.is_active
      });
      return NextResponse.json(data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[${requestId}] Failed to fetch user:`, {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch user', details: errorData },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Error in GET /api/users/${id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, user: currentUser } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const { id } = params;
    const body = await request.json();

    // First get the user to check their role
    const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = await userResponse.json();

    // Check if updating control staff (admin only)
    if (userData.role === 'CONTROL_STAFF') {
      const { authorized: adminAuthorized } = await checkPermission('CONTROL_ADMIN');
      if (!adminAuthorized) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required to update control staff.' },
          { status: 403 }
        );
      }
    }

    // Update user based on their role
    let apiUrl = `${BACKEND_API_BASE_URL}/api/account/${id}`;
    
    if (userData.role === 'BUS_DRIVER') {
      apiUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel/bus-drivers/${id}`;
    } else if (userData.role === 'QUEUE_REGULATOR') {
      apiUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel/queue-regulators/${id}`;
    }

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to update user', details: errorData },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, user: currentUser } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const { id } = params;

    // First get the user to check their role
    const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = await userResponse.json();

    // Check if deleting control staff (admin only)
    if (userData.role === 'CONTROL_STAFF') {
      const { authorized: adminAuthorized } = await checkPermission('CONTROL_ADMIN');
      if (!adminAuthorized) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required to delete control staff.' },
          { status: 403 }
        );
      }
    }

    // Delete user - for now we'll deactivate instead of hard delete
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/account/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: false }),
    });

    if (response.ok) {
      return NextResponse.json({ message: 'User deactivated successfully' });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to delete user', details: errorData },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
