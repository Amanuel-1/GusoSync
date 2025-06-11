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

// GET /api/attendance - Get attendance records
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

    console.log('Attendance records request:', {
      user: user?.email,
      role: user?.role,
      hasToken: !!token,
      searchParams: Object.fromEntries(searchParams.entries())
    });
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    const userId = searchParams.get('user_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const attendanceStatus = searchParams.get('attendance_status');

    if (userId) queryParams.append('user_id', userId);
    if (dateFrom) queryParams.append('date_from', dateFrom);
    if (dateTo) queryParams.append('date_to', dateTo);
    if (attendanceStatus) queryParams.append('attendance_status', attendanceStatus);

    const endpoint = `${BACKEND_API_BASE_URL}/api/attendance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('Fetching attendance records from:', endpoint);

    const backendResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error('Backend attendance fetch error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData,
        endpoint: endpoint
      });
      return NextResponse.json(
        {
          error: 'Failed to fetch attendance records from backend',
          details: errorData,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const attendanceData = await backendResponse.json();
    return NextResponse.json(attendanceData);

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Mark attendance
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();

    const endpoint = `${BACKEND_API_BASE_URL}/api/attendance`;
    
    console.log('Marking attendance:', endpoint);

    const backendResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error('Backend attendance mark error:', errorData);
      return NextResponse.json(
        { error: 'Failed to mark attendance' },
        { status: backendResponse.status }
      );
    }

    const attendanceData = await backendResponse.json();
    return NextResponse.json(attendanceData, { status: 201 });

  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
