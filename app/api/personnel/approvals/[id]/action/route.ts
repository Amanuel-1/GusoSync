import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check admin permission
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
      const authorized = user.role === 'CONTROL_ADMIN';
      return { authorized, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// POST /api/personnel/approvals/[id]/action - Process approval request (approve/reject)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token not found' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { action, review_notes } = body;

    console.log('Processing approval action:', { id, action, review_notes });

    if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const requestBody = {
      action,
      review_notes: review_notes || null,
    };

    console.log('Sending request to backend:', {
      url: `${BACKEND_API_BASE_URL}/api/approvals/requests/${id}/action`,
      body: requestBody
    });

    // Forward request to backend API
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/approvals/requests/${id}/action`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Backend response:', { status: response.status, data });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: data,
        message: action === 'APPROVED' ? 'Registration approved successfully' : 'Registration rejected successfully'
      });
    } else {
      console.error('Backend error:', data);
      return NextResponse.json(
        { error: data.detail || data.message || `Failed to ${action.toLowerCase()} registration` },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Error processing approval action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
