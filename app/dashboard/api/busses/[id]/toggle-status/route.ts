import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user can modify busses (CONTROL_ADMIN only)
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
      // Only CONTROL_ADMIN can modify bus status
      const hasPermission = user.role === 'CONTROL_ADMIN';
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking admin permission:', error);
  }

  return { authorized: false };
}

// POST /dashboard/api/busses/[id]/toggle-status - Toggle bus status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can change bus status.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const token = await getAuthToken();
    console.log('Toggling status for bus:', id);

    // First get the current bus to know its current status
    const getResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getResponse.ok) {
      const errorData = await getResponse.json().catch(() => ({}));
      console.error('Failed to fetch bus for status toggle:', {
        status: getResponse.status,
        statusText: getResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch bus details', details: errorData },
        { status: getResponse.status }
      );
    }

    const bus = await getResponse.json();
    console.log('Current bus status:', bus.bus_status);

    // Determine new status (toggle between OPERATIONAL and IDLE)
    const newStatus = bus.bus_status === 'OPERATIONAL' ? 'IDLE' : 'OPERATIONAL';
    console.log('New bus status will be:', newStatus);

    // Update the bus status
    const updateResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bus_status: newStatus
      }),
    });

    console.log('Backend status toggle response:', updateResponse.status);

    if (updateResponse.ok) {
      const updatedBus = await updateResponse.json();
      console.log('Successfully toggled bus status:', updatedBus);
      return NextResponse.json({
        data: updatedBus,
        message: `Bus status changed to ${newStatus.toLowerCase()}`
      });
    } else {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error('Failed to toggle bus status:', {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to toggle bus status', details: errorData },
        { status: updateResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in POST /dashboard/api/busses/[id]/toggle-status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
