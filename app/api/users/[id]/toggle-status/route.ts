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

// POST /api/users/[id]/toggle-status - Toggle user active status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = Math.random().toString(36).substring(7);
  const { id } = params;
  console.log(`[${requestId}] POST /api/users/${id}/toggle-status - Starting status toggle`);

  try {
    console.log(`[${requestId}] Checking user permissions for status toggle`);
    const { authorized, user: currentUser } = await checkPermission();
    if (!authorized) {
      console.log(`[${requestId}] Authorization failed for status toggle - returning 403`);
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();

    // First get the user to check their current status and role
    const userApiUrl = `${BACKEND_API_BASE_URL}/api/account/${id}`;
    console.log(`[${requestId}] Fetching user details from: ${userApiUrl}`);

    const userResponse = await fetch(userApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[${requestId}] User fetch response: ${userResponse.status} ${userResponse.statusText}`);

    if (!userResponse.ok) {
      console.log(`[${requestId}] User not found for status toggle`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = await userResponse.json();
    console.log(`[${requestId}] User found for status toggle:`, {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      currentStatus: userData.is_active
    });

    // Check if toggling control staff status (admin only)
    if (userData.role === 'CONTROL_STAFF') {
      console.log(`[${requestId}] Toggling control staff status - checking admin permissions`);
      const { authorized: adminAuthorized } = await checkPermission('CONTROL_ADMIN');
      if (!adminAuthorized) {
        console.log(`[${requestId}] Non-admin trying to toggle control staff status - denying access`);
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required to modify control staff status.' },
          { status: 403 }
        );
      }
      console.log(`[${requestId}] Admin permissions confirmed for control staff status toggle`);
    }

    // Toggle the status
    const newStatus = !userData.is_active;
    console.log(`[${requestId}] Toggling status from ${userData.is_active} to ${newStatus}`);

    // Update user status
    const updateApiUrl = `${BACKEND_API_BASE_URL}/api/account/${id}`;
    console.log(`[${requestId}] Updating user status at: ${updateApiUrl}`);

    const updateResponse = await fetch(updateApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: newStatus,
      }),
    });

    console.log(`[${requestId}] Status update response: ${updateResponse.status} ${updateResponse.statusText}`);

    if (updateResponse.ok) {
      const updatedUser = await updateResponse.json();
      console.log(`[${requestId}] User status toggled successfully:`, {
        userId: updatedUser.id,
        newStatus: updatedUser.is_active,
        action: newStatus ? 'activated' : 'deactivated'
      });

      return NextResponse.json({
        message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
        user: updatedUser,
      });
    } else {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error(`[${requestId}] Failed to toggle user status:`, {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to toggle user status', details: errorData },
        { status: updateResponse.status }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Error in POST /api/users/${id}/toggle-status:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
