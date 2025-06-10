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
      // Check if user has permission to view analytics (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// GET /dashboard/api/analytics/passengers - Get passengers analytics
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

    // Fetch passengers from backend
    const passengersResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/passengers?limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!passengersResponse.ok) {
      console.error('Passengers API error:', passengersResponse.status, passengersResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch passengers from backend' },
        { status: passengersResponse.status }
      );
    }

    const passengers = await passengersResponse.json();

    // Calculate analytics
    const totalPassengers = passengers.length;
    
    // Active vs inactive passengers
    const activePassengers = passengers.filter((passenger: any) => passenger.is_active !== false).length;
    const inactivePassengers = totalPassengers - activePassengers;

    // Group by registration date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = passengers.filter((passenger: any) => {
      const registrationDate = new Date(passenger.created_at || passenger.date_joined || '');
      return registrationDate >= thirtyDaysAgo;
    }).length;

    // Registration trend data (last 30 days)
    const registrationTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRegistrations = passengers.filter((passenger: any) => {
        const passengerDate = new Date(passenger.created_at || passenger.date_joined || '').toISOString().split('T')[0];
        return passengerDate === dateStr;
      });

      registrationTrend.push({
        date: dateStr,
        registrations: dayRegistrations.length,
        active: dayRegistrations.filter((p: any) => p.is_active !== false).length,
      });
    }

    // Recent passengers (last 10)
    const recentPassengers = passengers
      .sort((a: any, b: any) => new Date(b.created_at || b.date_joined || '').getTime() - new Date(a.created_at || a.date_joined || '').getTime())
      .slice(0, 10);

    // Passenger demographics (if available)
    const demographics = {
      verified: passengers.filter((p: any) => p.is_verified === true).length,
      unverified: passengers.filter((p: any) => p.is_verified === false).length,
      withProfileImage: passengers.filter((p: any) => p.profile_image).length,
    };

    const analytics = {
      summary: {
        total: totalPassengers,
        active: activePassengers,
        inactive: inactivePassengers,
        recentRegistrations,
        verificationRate: totalPassengers > 0 ? Math.round((demographics.verified / totalPassengers) * 100) : 0,
      },
      demographics,
      registrationTrend,
      recentPassengers,
      growth: {
        thisMonth: recentRegistrations,
        growthRate: totalPassengers > 0 ? Math.round((recentRegistrations / totalPassengers) * 100) : 0,
      }
    };

    console.log('Passengers analytics calculated:', analytics.summary);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error calculating passengers analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
