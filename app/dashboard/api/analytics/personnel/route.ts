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

// GET /dashboard/api/analytics/personnel - Get personnel analytics
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

    // Fetch personnel from backend
    const personnelResponse = await fetch(`${BACKEND_API_BASE_URL}/api/control-center/personnel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!personnelResponse.ok) {
      console.error('Personnel API error:', personnelResponse.status, personnelResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch personnel from backend' },
        { status: personnelResponse.status }
      );
    }

    const personnel = await personnelResponse.json();

    // Fetch attendance data from multiple sources
    let generalAttendanceData = [];
    let driverAttendanceData = [];

    try {
      const [generalAttendanceRes, driverAttendanceRes] = await Promise.all([
        fetch(`${BACKEND_API_BASE_URL}/api/attendance/today`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${BACKEND_API_BASE_URL}/api/drivers/attendance/today`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (generalAttendanceRes.ok) {
        generalAttendanceData = await generalAttendanceRes.json();
      }

      if (driverAttendanceRes.ok) {
        driverAttendanceData = await driverAttendanceRes.json();
      }
    } catch (error) {
      console.log('Attendance data not available:', error);
    }

    // Combine attendance data
    const attendanceData = [
      ...generalAttendanceData.map((record: any) => ({ ...record, source: 'general' })),
      ...driverAttendanceData.map((record: any) => ({ ...record, source: 'driver' }))
    ];

    // Calculate analytics
    const totalPersonnel = personnel.length;
    
    // Group by role
    const personnelByRole = personnel.reduce((acc: any, person: any) => {
      const role = person.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Active vs inactive personnel
    const activePersonnel = personnel.filter((person: any) => person.is_active !== false).length;
    const inactivePersonnel = totalPersonnel - activePersonnel;

    // Attendance statistics
    const totalAttendanceToday = attendanceData.length;
    const attendanceRate = totalPersonnel > 0 ? Math.round((totalAttendanceToday / totalPersonnel) * 100) : 0;

    // Personnel by department/role breakdown
    const roleBreakdown = [
      {
        role: 'Bus Drivers',
        count: personnelByRole['BUS_DRIVER'] || 0,
        color: '#0097fb',
      },
      {
        role: 'Queue Regulators',
        count: personnelByRole['QUEUE_REGULATOR'] || 0,
        color: '#ff8a00',
      },
      {
        role: 'Control Staff',
        count: personnelByRole['CONTROL_STAFF'] || 0,
        color: '#e92c2c',
      },
      {
        role: 'Control Admin',
        count: personnelByRole['CONTROL_ADMIN'] || 0,
        color: '#28a745',
      },
    ];

    // Recent personnel additions (last 10)
    const recentPersonnel = personnel
      .sort((a: any, b: any) => new Date(b.created_at || b.date_joined || '').getTime() - new Date(a.created_at || a.date_joined || '').getTime())
      .slice(0, 10);

    const analytics = {
      summary: {
        total: totalPersonnel,
        active: activePersonnel,
        inactive: inactivePersonnel,
        attendanceToday: totalAttendanceToday,
        attendanceRate,
      },
      byRole: personnelByRole,
      roleBreakdown,
      recentPersonnel,
      attendanceData,
      attendanceBreakdown: {
        generalAttendance: generalAttendanceData.length,
        driverAttendance: driverAttendanceData.length,
        totalAttendance: attendanceData.length,
      }
    };

    console.log('Personnel analytics calculated:', analytics.summary);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error calculating personnel analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
