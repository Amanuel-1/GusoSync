import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { reportGenerationAgent } from '@/services/reportGenerationAgent';

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
      // Check if user has permission (control staff or admin)
      const hasPermission = ['CONTROL_STAFF', 'CONTROL_ADMIN'].includes(user.role);
      return { authorized: hasPermission, user };
    }
  } catch (error) {
    console.error('Error checking permission:', error);
  }

  return { authorized: false };
}

// GET /dashboard/api/analytics/report-agent-status - Get report generation agent status
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const status = reportGenerationAgent.getAgentStatus();
    const reports = reportGenerationAgent.getGeneratedReports();

    return NextResponse.json({
      success: true,
      data: {
        status,
        recentReports: reports.slice(-5), // Last 5 reports
        totalReports: reports.length,
      }
    });

  } catch (error) {
    console.error('Error getting report agent status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
