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

// POST /dashboard/api/analytics/generate-pdf-agent - Generate PDF using agent
export async function POST(request: NextRequest) {
  try {
    const { authorized, user } = await checkPermission();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Control staff or admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reportContent, metadata } = body;

    if (!reportContent || !metadata) {
      return NextResponse.json(
        { error: 'Report content and metadata are required' },
        { status: 400 }
      );
    }

    console.log('Generating PDF for user:', user?.email);

    // Import and use the agent (dynamic import to avoid issues)
    const { reportGenerationAgent } = await import('@/services/reportGenerationAgent');

    // Generate PDF
    const pdfBuffer = await reportGenerationAgent.generatePDF(reportContent, metadata);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `GusoSync-Analytics-Report-${timestamp}.pdf`;

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report. Please try again.' },
      { status: 500 }
    );
  }
}
