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

// GET /dashboard/api/bus-stops/with-incoming-buses - Get all bus stops with incoming buses
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

    // First, get all bus stops
    let busStopsResponse;
    if (user?.role === 'CONTROL_ADMIN') {
      busStopsResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/bus-stops`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      busStopsResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/stops`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!busStopsResponse.ok) {
      const errorData = await busStopsResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch bus stops', details: errorData },
        { status: busStopsResponse.status }
      );
    }

    const busStops = await busStopsResponse.json();
    console.log('Fetched bus stops:', busStops.length);

    // For each bus stop, get incoming buses
    const busStopsWithIncoming = await Promise.all(
      busStops.map(async (busStop: any) => {
        try {
          const incomingResponse = await fetch(
            `${BACKEND_API_BASE_URL}/api/buses/stops/${busStop.id}/incoming-buses`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          let incomingBuses = [];
          if (incomingResponse.ok) {
            incomingBuses = await incomingResponse.json();
            
            // Enhance incoming buses with calculated fields
            incomingBuses = incomingBuses.map((bus: any) => ({
              ...bus,
              minutes_away: calculateMinutesAway(bus.estimated_arrival_time),
            }));
          } else {
            console.warn(`Failed to fetch incoming buses for stop ${busStop.id}`);
          }

          // Calculate next arrival
          const nextArrival = incomingBuses
            .filter((bus: any) => bus.estimated_arrival_time)
            .sort((a: any, b: any) => 
              new Date(a.estimated_arrival_time).getTime() - new Date(b.estimated_arrival_time).getTime()
            )[0]?.estimated_arrival_time;

          return {
            ...busStop,
            incoming_buses: incomingBuses,
            total_incoming: incomingBuses.length,
            next_arrival: nextArrival,
          };
        } catch (error) {
          console.error(`Error fetching incoming buses for stop ${busStop.id}:`, error);
          return {
            ...busStop,
            incoming_buses: [],
            total_incoming: 0,
            next_arrival: undefined,
          };
        }
      })
    );

    console.log('Successfully processed bus stops with incoming buses');
    return NextResponse.json({ data: busStopsWithIncoming });

  } catch (error) {
    console.error('Error in GET /dashboard/api/bus-stops/with-incoming-buses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
