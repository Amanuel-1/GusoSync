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

// GET /dashboard/api/analytics/incidents - Get incidents analytics
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

    // Fetch incidents from multiple sources
    const [generalIncidentsRes, driverIncidentsRes] = await Promise.all([
      fetch(`${BACKEND_API_BASE_URL}/api/issues?limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${BACKEND_API_BASE_URL}/api/drivers/incidents?limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    let generalIncidents = [];
    let driverIncidents = [];

    if (generalIncidentsRes.ok) {
      generalIncidents = await generalIncidentsRes.json();
    } else {
      console.error('General incidents API error:', generalIncidentsRes.status, generalIncidentsRes.statusText);
    }

    if (driverIncidentsRes.ok) {
      driverIncidents = await driverIncidentsRes.json();
    } else {
      console.log('Driver incidents not accessible or empty');
    }

    // Combine all incidents and mark their source
    const incidents = [
      ...generalIncidents.map((incident: any) => ({ ...incident, source: 'general' })),
      ...driverIncidents.map((incident: any) => ({ ...incident, source: 'driver' }))
    ];

    // Calculate analytics
    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter((incident: any) => incident.status === 'resolved').length;
    const pendingIncidents = incidents.filter((incident: any) => incident.status === 'pending').length;
    const inProgressIncidents = incidents.filter((incident: any) => incident.status === 'in_progress').length;

    // Group by type
    const incidentsByType = incidents.reduce((acc: any, incident: any) => {
      const type = incident.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Group by severity
    const incidentsBySeverity = incidents.reduce((acc: any, incident: any) => {
      const severity = incident.severity || 'Unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});

    // Group by source
    const incidentsBySource = incidents.reduce((acc: any, incident: any) => {
      const source = incident.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Recent incidents (last 10)
    const recentIncidents = incidents
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Calculate trend data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayIncidents = incidents.filter((incident: any) => {
        const incidentDate = new Date(incident.created_at).toISOString().split('T')[0];
        return incidentDate === dateStr;
      });

      trendData.push({
        date: dateStr,
        count: dayIncidents.length,
        resolved: dayIncidents.filter((i: any) => i.status === 'resolved').length,
        pending: dayIncidents.filter((i: any) => i.status === 'pending').length,
      });
    }

    const analytics = {
      summary: {
        total: totalIncidents,
        resolved: resolvedIncidents,
        pending: pendingIncidents,
        inProgress: inProgressIncidents,
        resolutionRate: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
      },
      byType: incidentsByType,
      bySeverity: incidentsBySeverity,
      bySource: incidentsBySource,
      recentIncidents,
      trendData,
      breakdown: {
        generalIncidents: generalIncidents.length,
        driverIncidents: driverIncidents.length,
      }
    };

    console.log('Incidents analytics calculated:', analytics.summary);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error calculating incidents analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
