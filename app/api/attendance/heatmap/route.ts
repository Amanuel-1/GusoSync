import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

async function checkPermission() {
  const token = await getAuthToken();
  if (!token) {
    return { authorized: false, user: null };
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
      const allowedRoles = ['CONTROL_STAFF', 'CONTROL_ADMIN'];
      return {
        authorized: allowedRoles.includes(user.role),
        user
      };
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
  }

  return { authorized: false, user: null };
}

// GET /api/attendance/heatmap - Get attendance heatmap data
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const { searchParams } = new URL(request.url);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    const userId = searchParams.get('user_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (userId) queryParams.append('user_id', userId);
    if (dateFrom) queryParams.append('date_from', dateFrom);
    if (dateTo) queryParams.append('date_to', dateTo);

    const endpoint = `${BACKEND_API_BASE_URL}/api/attendance/heatmap${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('Fetching attendance heatmap from:', endpoint);

    const backendResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error('Backend attendance heatmap fetch error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch attendance heatmap from backend' },
        { status: backendResponse.status }
      );
    }

    const heatmapData = await backendResponse.json();
    return NextResponse.json(heatmapData);

  } catch (error) {
    console.error('Error fetching attendance heatmap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
