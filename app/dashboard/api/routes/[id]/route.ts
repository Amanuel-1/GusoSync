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
      // Check if user has permission to view routes (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// Helper function to check if user can modify routes (CONTROL_ADMIN only)
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
      // Only CONTROL_ADMIN can create, modify, or delete routes
      const hasPermission = user.role === 'CONTROL_ADMIN';
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// GET /dashboard/api/routes/[id] - Get specific route
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

    // Fetch route from backend
    console.log('Fetching route from backend:', id);
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/routes/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend route fetch failed:', backendResponse.status, errorData);
      return NextResponse.json(
        { error: 'Route not found', details: errorData },
        { status: backendResponse.status }
      );
    }

    const backendRoute = await backendResponse.json();
    console.log('Route fetched successfully from backend:', backendRoute);

    // Transform backend route to match frontend structure
    const transformedRoute = {
      id: backendRoute.id,
      name: backendRoute.name,
      color: '#0097fb',
      start: backendRoute.description?.split(' to ')[0] || backendRoute.name.split('-')[0] || 'Unknown',
      passBy: backendRoute.stop_ids || [],
      destination: backendRoute.description?.split(' to ')[1]?.split(' via ')[0] || backendRoute.name.split('-')[1] || 'Unknown',
      distance: backendRoute.total_distance || 0,
      stops: backendRoute.stop_ids?.length || 2,
      activeBuses: 0,
      expectedLoad: 'Medium' as const,
      regulatorName: 'Assigned Regulator',
      regulatorPhone: '+251911000000',
      is_active: backendRoute.is_active,
      created_at: backendRoute.created_at,
      updated_at: backendRoute.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedRoute
    });

  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /dashboard/api/routes/[id] - Update route
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can update routes.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const token = await getAuthToken();
    console.log('Updating route:', id, 'with data:', body);

    // Prepare update data for backend according to UpdateRouteRequest schema
    const backendUpdateData: any = {};

    if (body.name) backendUpdateData.name = body.name;
    if (body.start && body.destination) {
      backendUpdateData.description = `${body.start} to ${body.destination}${body.passBy && body.passBy.length > 0 ? ' via ' + body.passBy.join(', ') : ''}`;
    }
    if (body.passBy) backendUpdateData.stop_ids = body.passBy.length > 0 ? body.passBy : [body.start, body.destination];
    if (body.distance) backendUpdateData.total_distance = parseFloat(body.distance);
    if (body.distance) backendUpdateData.estimated_duration = parseFloat(body.distance) * 4;
    if (body.is_active !== undefined) backendUpdateData.is_active = body.is_active;

    console.log('Attempting to update route on backend with data:', backendUpdateData);
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/routes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUpdateData),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend route update failed:', backendResponse.status, errorData);
      return NextResponse.json(
        { error: 'Failed to update route', details: errorData },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();
    console.log('Route updated successfully on backend:', backendData);

    // Transform backend response to match frontend structure
    const transformedRoute = {
      id: backendData.id,
      name: backendData.name,
      color: body.color || '#0097fb',
      start: body.start || backendData.description?.split(' to ')[0] || 'Unknown',
      passBy: body.passBy || backendData.stop_ids || [],
      destination: body.destination || backendData.description?.split(' to ')[1]?.split(' via ')[0] || 'Unknown',
      distance: backendData.total_distance || 0,
      stops: body.stops || backendData.stop_ids?.length || 2,
      activeBuses: 0,
      expectedLoad: body.expectedLoad || 'Medium',
      regulatorName: body.regulatorName || 'Assigned Regulator',
      regulatorPhone: body.regulatorPhone || '+251911000000',
      is_active: backendData.is_active,
      created_at: backendData.created_at,
      updated_at: backendData.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedRoute,
      message: 'Route updated successfully'
    });

  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /dashboard/api/routes/[id] - Delete route
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can delete routes.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();
    console.log('Deleting route:', id);

    // Delete route from backend
    console.log('Attempting to delete route from backend:', id);
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/routes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend route deletion failed:', backendResponse.status, errorData);
      return NextResponse.json(
        { error: 'Failed to delete route', details: errorData },
        { status: backendResponse.status }
      );
    }

    console.log('Route deleted successfully from backend:', id);

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
