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
      // Check if user has permission to manage routes (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// POST /dashboard/api/routes/[id]/toggle-status - Toggle route status
export async function POST(
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
    console.log('Toggling status for route:', id);

    // First get the current route to know its current status
    const getResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/routes/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getResponse.ok) {
      const errorData = await getResponse.json().catch(() => ({}));
      console.error('Failed to fetch route for status toggle:', getResponse.status, errorData);
      return NextResponse.json(
        { error: 'Route not found', details: errorData },
        { status: getResponse.status }
      );
    }

    const currentRoute = await getResponse.json();

    // Toggle the status
    const updateResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/routes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: !currentRoute.is_active
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error('Failed to toggle route status:', updateResponse.status, errorData);
      return NextResponse.json(
        { error: 'Failed to update route status', details: errorData },
        { status: updateResponse.status }
      );
    }

    const updatedRoute = await updateResponse.json();
    console.log('Route status toggled successfully:', updatedRoute);

    // Transform backend response to match frontend structure
    const transformedRoute = {
      id: updatedRoute.id,
      name: updatedRoute.name,
      color: '#0097fb',
      start: updatedRoute.description?.split(' to ')[0] || updatedRoute.name.split('-')[0] || 'Unknown',
      passBy: updatedRoute.stop_ids || [],
      destination: updatedRoute.description?.split(' to ')[1]?.split(' via ')[0] || updatedRoute.name.split('-')[1] || 'Unknown',
      distance: updatedRoute.total_distance || 0,
      stops: updatedRoute.stop_ids?.length || 2,
      activeBuses: 0,
      expectedLoad: 'Medium' as const,
      regulatorName: 'Assigned Regulator',
      regulatorPhone: '+251911000000',
      is_active: updatedRoute.is_active,
      created_at: updatedRoute.created_at,
      updated_at: updatedRoute.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedRoute,
      message: `Route ${updatedRoute.is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error toggling route status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
