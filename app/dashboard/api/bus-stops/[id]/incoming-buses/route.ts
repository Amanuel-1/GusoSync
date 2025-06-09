import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user can access bus stops (both CONTROL_STAFF and CONTROL_ADMIN)
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
      // Check if user has permission to access bus stops (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// Helper function to calculate minutes until arrival
function calculateMinutesAway(estimatedArrivalTime?: string): number | undefined {
  if (!estimatedArrivalTime) return undefined;
  
  const now = new Date();
  const arrivalTime = new Date(estimatedArrivalTime);
  const diffMs = arrivalTime.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  
  return diffMinutes > 0 ? diffMinutes : 0;
}

// GET /dashboard/api/bus-stops/[id]/incoming-buses - Get incoming buses for a specific bus stop
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

    console.log('Fetching incoming buses for bus stop:', id);

    // Fetch incoming buses from backend
    const backendResponse = await fetch(
      `${BACKEND_API_BASE_URL}/api/buses/stops/${id}/incoming-buses`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Backend response status:', backendResponse.status);

    if (backendResponse.ok) {
      let incomingBuses = await backendResponse.json();
      console.log('Successfully fetched incoming buses:', incomingBuses.length);

      // Enhance incoming buses with calculated fields
      incomingBuses = incomingBuses.map((bus: any) => ({
        ...bus,
        minutes_away: calculateMinutesAway(bus.estimated_arrival_time),
      }));

      // TODO: In a real implementation, you might want to fetch additional details
      // about the bus, driver, and route from other endpoints to enrich the data
      // For now, we'll return the basic trip information

      return NextResponse.json({ data: incomingBuses });
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Failed to fetch incoming buses:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to fetch incoming buses', details: errorData },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error in GET /dashboard/api/bus-stops/[id]/incoming-buses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
