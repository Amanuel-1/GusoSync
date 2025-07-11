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

// GET /api/personnel/approvals - Get approval requests
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
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token not found' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status_filter');

    // Build backend API URL
    const backendUrl = new URL('/api/approvals/requests', BACKEND_API_BASE_URL);
    if (statusFilter) {
      backendUrl.searchParams.append('status_filter', statusFilter);
    }

    // Forward request to backend API
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: data
      });
    } else {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch approval requests' },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Error fetching approval requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


