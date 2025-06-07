import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user has admin permission
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
      // Check if user has admin role
      const isAdmin = user.role === 'CONTROL_ADMIN';
      return { authorized: isAdmin, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// GET /api/personnel/approvals - Get pending registrations
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();

    // For now, we'll return mock data since the backend doesn't have a pending registrations endpoint yet
    // In a real implementation, this would fetch from a pending_registrations table
    const mockPendingRegistrations = [
      {
        id: '1',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+251911234567',
        role: 'CONTROL_STAFF',
        created_at: '2024-01-15T10:30:00Z',
        submitted_by: 'admin@gusosync.com',
        status: 'pending'
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone_number: '+251922345678',
        role: 'CONTROL_STAFF',
        created_at: '2024-01-14T14:20:00Z',
        submitted_by: 'supervisor@gusosync.com',
        status: 'pending'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockPendingRegistrations
    });

  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/personnel/approvals - Approve or reject a registration
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();
    const { registrationId, action, userData } = body;

    if (!registrationId || !action || (action === 'approve' && !userData)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Create the user account
      const createUserResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/personnel/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password || `Guzo${Math.random().toString(36).substring(2, 15)}`,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          role: userData.role,
          profile_image: userData.profile_image,
        }),
      });

      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json();
        return NextResponse.json(
          { error: errorData.message || 'Failed to create user account' },
          { status: createUserResponse.status }
        );
      }

      const newUser = await createUserResponse.json();

      // In a real implementation, we would:
      // 1. Remove the registration from pending_registrations table
      // 2. Send notification email to the user
      // 3. Log the approval action

      return NextResponse.json({
        success: true,
        message: 'Registration approved and user account created',
        data: newUser
      });

    } else if (action === 'reject') {
      // In a real implementation, we would:
      // 1. Remove the registration from pending_registrations table
      // 2. Send rejection notification email to the user
      // 3. Log the rejection action

      return NextResponse.json({
        success: true,
        message: 'Registration rejected'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing registration approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/personnel/approvals/[id] - Update a pending registration
export async function PUT(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { registrationId, updates } = body;

    if (!registrationId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update the pending registration
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Pending registration updated'
    });

  } catch (error) {
    console.error('Error updating pending registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/personnel/approvals/[id] - Delete a pending registration
export async function DELETE(request: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete the pending registration
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Pending registration deleted'
    });

  } catch (error) {
    console.error('Error deleting pending registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
