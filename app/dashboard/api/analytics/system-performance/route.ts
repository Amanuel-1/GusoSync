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

// GET /dashboard/api/analytics/system-performance - Get system performance analytics
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

    // Fetch buses data
    const busesResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses?ps=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Fetch routes data
    const routesResponse = await fetch(`${BACKEND_API_BASE_URL}/api/routes?limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let buses = [];
    let routes = [];

    if (busesResponse.ok) {
      buses = await busesResponse.json();
    }

    if (routesResponse.ok) {
      routes = await routesResponse.json();
    }

    // Calculate system performance metrics
    const totalBuses = buses.length;
    const activeBuses = buses.filter((bus: any) => bus.status === 'active' || bus.is_active !== false).length;
    const inactiveBuses = totalBuses - activeBuses;
    const busUtilizationRate = totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0;

    const totalRoutes = routes.length;
    const activeRoutes = routes.filter((route: any) => route.is_active !== false).length;
    const inactiveRoutes = totalRoutes - activeRoutes;
    const routeUtilizationRate = totalRoutes > 0 ? Math.round((activeRoutes / totalRoutes) * 100) : 0;

    // Calculate average route metrics
    const totalDistance = routes.reduce((sum: number, route: any) => sum + (route.total_distance || 0), 0);
    const averageDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0;

    const totalDuration = routes.reduce((sum: number, route: any) => sum + (route.estimated_duration || 0), 0);
    const averageDuration = totalRoutes > 0 ? totalDuration / totalRoutes : 0;

    // Bus status distribution
    const busStatusDistribution = buses.reduce((acc: any, bus: any) => {
      const status = bus.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Performance metrics over time (simulated data for demonstration)
    const performanceData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate performance metrics (in real implementation, this would come from actual data)
      performanceData.push({
        date: dateStr,
        busUtilization: Math.max(60, Math.min(95, busUtilizationRate + (Math.random() - 0.5) * 20)),
        routeEfficiency: Math.max(70, Math.min(98, routeUtilizationRate + (Math.random() - 0.5) * 15)),
        systemUptime: Math.max(95, Math.min(100, 99 + (Math.random() - 0.5) * 3)),
      });
    }

    // System health indicators
    const systemHealth = {
      overall: Math.round((busUtilizationRate + routeUtilizationRate + 99) / 3), // Including simulated uptime
      busFleet: busUtilizationRate,
      routeNetwork: routeUtilizationRate,
      uptime: 99.2, // Simulated uptime percentage
    };

    const analytics = {
      summary: {
        totalBuses,
        activeBuses,
        inactiveBuses,
        busUtilizationRate,
        totalRoutes,
        activeRoutes,
        inactiveRoutes,
        routeUtilizationRate,
        averageDistance: Math.round(averageDistance * 100) / 100,
        averageDuration: Math.round(averageDuration),
      },
      busStatusDistribution,
      performanceData,
      systemHealth,
      metrics: {
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalDuration: Math.round(totalDuration),
        averageDistance: Math.round(averageDistance * 100) / 100,
        averageDuration: Math.round(averageDuration),
      }
    };

    console.log('System performance analytics calculated:', analytics.summary);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error calculating system performance analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
