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

// GET /dashboard/api/analytics/routes-reallocated - Get route reallocation analytics
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

    // Fetch reallocation requests from backend
    let reallocationRequests = [];
    try {
      const reallocationResponse = await fetch(`${BACKEND_API_BASE_URL}/api/buses/reallocation/requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (reallocationResponse.ok) {
        reallocationRequests = await reallocationResponse.json();
      }
    } catch (error) {
      console.log('Reallocation requests not available:', error);
      // If the endpoint doesn't exist or returns an error, we'll use mock data
    }

    // If no real data is available, generate some mock data for demonstration
    if (!Array.isArray(reallocationRequests) || reallocationRequests.length === 0) {
      console.log('Using mock reallocation data for analytics');

      // Fetch real reallocation data from the reallocation agent
      try {
        const response = await fetch(`${request.url.split('/dashboard')[0]}/api/reallocation?type=decisions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.decisions) {
            // Transform agent decisions to match the expected format
            reallocationRequests = data.decisions.map((decision: any, index: number) => ({
              id: decision.id || `decision_${index}`,
              route_id: decision.toRouteId || 'unknown',
              bus_id: decision.busId || 'unknown',
              reason: decision.agentDecision?.reasoning || 'No reason provided',
              status: decision.status || 'completed',
              priority: 'medium', // Default priority since agent decisions don't have this field
              created_at: decision.timestamp || new Date().toISOString(),
              requested_by: 'system_agent',
            }));
          } else {
            reallocationRequests = [];
          }
        } else {
          console.error('Failed to fetch reallocation decisions');
          reallocationRequests = [];
        }
      } catch (error) {
        console.error('Error fetching reallocation data:', error);
        reallocationRequests = [];
      }
    }

    // Calculate analytics
    const totalRequests = reallocationRequests.length;
    
    // Group by status
    const requestsByStatus = reallocationRequests.reduce((acc: any, request: any) => {
      const status = request.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Group by reason
    const requestsByReason = reallocationRequests.reduce((acc: any, request: any) => {
      const reason = request.reason || 'unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    // Group by priority
    const requestsByPriority = reallocationRequests.reduce((acc: any, request: any) => {
      const priority = request.priority || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Calculate success rate
    const completedRequests = requestsByStatus['completed'] || 0;
    const approvedRequests = requestsByStatus['approved'] || 0;
    const successfulRequests = completedRequests + approvedRequests;
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;

    // Recent requests (last 10)
    const recentRequests = reallocationRequests
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Trend data (last 30 days)
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRequests = reallocationRequests.filter((request: any) => {
        const requestDate = new Date(request.created_at).toISOString().split('T')[0];
        return requestDate === dateStr;
      });

      trendData.push({
        date: dateStr,
        total: dayRequests.length,
        completed: dayRequests.filter((r: any) => r.status === 'completed').length,
        pending: dayRequests.filter((r: any) => r.status === 'pending').length,
        approved: dayRequests.filter((r: any) => r.status === 'approved').length,
      });
    }

    const analytics = {
      summary: {
        total: totalRequests,
        pending: requestsByStatus['pending'] || 0,
        approved: requestsByStatus['approved'] || 0,
        completed: requestsByStatus['completed'] || 0,
        rejected: requestsByStatus['rejected'] || 0,
        successRate,
      },
      byStatus: requestsByStatus,
      byReason: requestsByReason,
      byPriority: requestsByPriority,
      recentRequests,
      trendData,
    };

    console.log('Route reallocation analytics calculated:', analytics.summary);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error calculating route reallocation analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
