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
      // Check if user has permission to view route statistics (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// GET /dashboard/api/routes/statistics - Get route statistics
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

    // Fetch routes from backend
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/routes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend routes fetch failed for statistics:', backendResponse.status, errorData);
      return NextResponse.json(
        { error: 'Failed to fetch routes for statistics', details: errorData },
        { status: backendResponse.status }
      );
    }

    const backendRoutes = await backendResponse.json();

    // Calculate statistics
    const totalRoutes = backendRoutes.length;
    const activeRoutes = backendRoutes.filter((route: any) => route.is_active !== false).length;
    const inactiveRoutes = totalRoutes - activeRoutes;

    const totalDistance = backendRoutes.reduce((sum: number, route: any) => sum + (route.total_distance || 0), 0);
    const averageDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0;

    // Calculate average duration
    const totalDuration = backendRoutes.reduce((sum: number, route: any) => sum + (route.estimated_duration || 0), 0);
    const averageDuration = totalRoutes > 0 ? totalDuration / totalRoutes : 0;

    const statistics = {
      totalRoutes,
      activeRoutes,
      inactiveRoutes,
      averageDistance,
      averageDuration,
      totalDistance
    };

    console.log('Route statistics calculated:', statistics);

    return NextResponse.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error calculating route statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
