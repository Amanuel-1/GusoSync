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
      // Check if user has permission to generate reports (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// Function to fetch all analytics data
async function fetchAllAnalyticsData() {
  try {
    // Use relative URLs for internal API calls
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

    const [incidentsRes, personnelRes, systemRes, passengersRes, ticketsRes] = await Promise.all([
      fetch(`${baseUrl}/dashboard/api/analytics/incidents`),
      fetch(`${baseUrl}/dashboard/api/analytics/personnel`),
      fetch(`${baseUrl}/dashboard/api/analytics/system-performance`),
      fetch(`${baseUrl}/dashboard/api/analytics/passengers`),
      fetch(`${baseUrl}/dashboard/api/analytics/tickets`),
    ]);

    const [incidents, personnel, systemPerformance, passengers, tickets] = await Promise.all([
      incidentsRes.ok ? incidentsRes.json() : { data: null },
      personnelRes.ok ? personnelRes.json() : { data: null },
      systemRes.ok ? systemRes.json() : { data: null },
      passengersRes.ok ? passengersRes.json() : { data: null },
      ticketsRes.ok ? ticketsRes.json() : { data: null },
    ]);

    return {
      incidents: incidents.data,
      personnel: personnel.data,
      systemPerformance: systemPerformance.data,
      passengers: passengers.data,
      tickets: tickets.data,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw new Error('Failed to fetch analytics data');
  }
}

// POST /dashboard/api/analytics/generate-report-agent - Generate report using agent
export async function POST(request: NextRequest) {
  try {
    console.log('Generate report agent API called');
    
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dateRange = 'Last 30 days', reportType = 'comprehensive' } = body;
    
    console.log('Report generation request:', { dateRange, reportType, user: user?.email });

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI report generation is not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // For now, use mock data to test the basic functionality
    console.log('Using mock analytics data for testing...');
    const analyticsData = {
      incidents: {
        summary: { total: 25, resolved: 20, pending: 5, resolutionRate: 80 },
        trendData: [],
        byStatus: { resolved: 20, pending: 5 },
        bySource: { driver: 15, general: 10 }
      },
      personnel: {
        summary: { total: 150, active: 145, inactive: 5 },
        roleBreakdown: [
          { role: 'Driver', count: 100, color: '#3b82f6' },
          { role: 'Queue Regulator', count: 30, color: '#8b5cf6' },
          { role: 'Control Staff', count: 20, color: '#10b981' }
        ]
      },
      systemPerformance: {
        systemHealth: { overall: 92, busFleet: 88, routeNetwork: 95, uptime: 99 },
        summary: { activeBuses: 85, activeRoutes: 12, busUtilizationRate: 78 }
      },
      passengers: {
        summary: { total: 5000, active: 4800, recentRegistrations: 150 },
        registrationTrend: []
      },
      tickets: {
        summary: { total: 1200, used: 1000, totalRevenue: 24000, usageRate: 83 },
        salesTrend: []
      }
    };
    console.log('Mock analytics data prepared');

    // Import and use the agent (dynamic import to avoid issues)
    const { reportGenerationAgent } = await import('@/services/reportGenerationAgent');
    
    console.log('Generating report with agent...');
    const result = await reportGenerationAgent.generateReport(
      analyticsData,
      dateRange,
      reportType,
      user?.email || 'unknown-user'
    );

    console.log('Agent result:', { success: result.success, hasContent: !!result.content });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reportContent: result.content,
        metadata: {
          ...result.metadata,
          generatedBy: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Unknown User',
          generatedByEmail: user?.email,
          generatedByRole: user?.role,
        },
        reportId: result.reportId,
        generatedBy: user?.email,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}
