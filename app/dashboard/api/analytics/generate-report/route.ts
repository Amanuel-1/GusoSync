import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
async function fetchAllAnalyticsData(token: string) {
  try {
    const [incidentsRes, personnelRes, systemRes, routesRes, passengersRes, ticketsRes] = await Promise.all([
      fetch(`${BACKEND_API_BASE_URL}/api/issues?limit=100`),
      fetch(`${BACKEND_API_BASE_URL}/api/control-center/personnel`),
      fetch(`${BACKEND_API_BASE_URL}/api/buses?ps=100`),
      fetch(`${BACKEND_API_BASE_URL}/api/routes?limit=100`),
      fetch(`${BACKEND_API_BASE_URL}/api/control-center/passengers?limit=100`),
      fetch(`${BACKEND_API_BASE_URL}/api/tickets?limit=100`),
    ]);

    const [incidents, personnel, buses, routes, passengers, tickets] = await Promise.all([
      incidentsRes.ok ? incidentsRes.json() : [],
      personnelRes.ok ? personnelRes.json() : [],
      systemRes.ok ? systemRes.json() : [],
      routesRes.ok ? routesRes.json() : [],
      passengersRes.ok ? passengersRes.json() : [],
      ticketsRes.ok ? ticketsRes.json() : [],
    ]);

    return {
      incidents,
      personnel,
      buses,
      routes,
      passengers,
      tickets,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw new Error('Failed to fetch analytics data');
  }
}

// Function to process and structure analytics data for AI
function processAnalyticsData(rawData: any, dateRange: string) {
  const currentDate = new Date();
  const days = dateRange === 'Last 7 days' ? 7 : 
               dateRange === 'Last 30 days' ? 30 : 
               dateRange === 'Last 90 days' ? 90 : 365;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Process incidents
  const incidents = Array.isArray(rawData.incidents) ? rawData.incidents : [];
  const filteredIncidents = incidents.filter((incident: any) => {
    const incidentDate = new Date(incident.created_at || incident.date || '');
    return incidentDate >= startDate;
  });

  // Process personnel
  const personnel = Array.isArray(rawData.personnel) ? rawData.personnel : [];
  const personnelByRole = personnel.reduce((acc: any, person: any) => {
    const role = person.role || 'Unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // Process system data
  const buses = Array.isArray(rawData.buses) ? rawData.buses : [];
  const routes = Array.isArray(rawData.routes) ? rawData.routes : [];
  const activeBuses = buses.filter((bus: any) => bus.status === 'active' || bus.is_active !== false).length;
  const activeRoutes = routes.filter((route: any) => route.is_active !== false).length;

  // Process passengers
  const passengers = Array.isArray(rawData.passengers) ? rawData.passengers : [];
  const recentPassengers = passengers.filter((passenger: any) => {
    const regDate = new Date(passenger.created_at || passenger.date_joined || '');
    return regDate >= startDate;
  });

  // Process tickets (mock data if not available)
  const tickets = Array.isArray(rawData.tickets) ? rawData.tickets : [];
  
  return {
    reportMetadata: {
      title: `GusoSync Transportation System Analytics Report`,
      dateRange: `${startDate.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`,
      generatedAt: currentDate.toISOString(),
      period: dateRange,
    },
    keyMetrics: {
      totalIncidents: filteredIncidents.length,
      resolvedIncidents: filteredIncidents.filter((i: any) => i.status === 'resolved').length,
      pendingIncidents: filteredIncidents.filter((i: any) => i.status === 'pending').length,
      totalPersonnel: personnel.length,
      activePersonnel: personnel.filter((p: any) => p.is_active !== false).length,
      totalBuses: buses.length,
      activeBuses,
      totalRoutes: routes.length,
      activeRoutes,
      totalPassengers: passengers.length,
      newPassengers: recentPassengers.length,
      totalTickets: tickets.length,
    },
    detailedAnalysis: {
      incidents: {
        byStatus: filteredIncidents.reduce((acc: any, incident: any) => {
          const status = incident.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        byType: filteredIncidents.reduce((acc: any, incident: any) => {
          const type = incident.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        bySeverity: filteredIncidents.reduce((acc: any, incident: any) => {
          const severity = incident.severity || 'unknown';
          acc[severity] = (acc[severity] || 0) + 1;
          return acc;
        }, {}),
      },
      personnel: {
        byRole: personnelByRole,
        activeVsInactive: {
          active: personnel.filter((p: any) => p.is_active !== false).length,
          inactive: personnel.filter((p: any) => p.is_active === false).length,
        },
      },
      systemPerformance: {
        busUtilization: totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0,
        routeUtilization: totalRoutes > 0 ? Math.round((activeRoutes / totalRoutes) * 100) : 0,
        systemHealth: Math.round(((activeBuses + activeRoutes) / (totalBuses + totalRoutes)) * 100) || 0,
      },
      passengerGrowth: {
        total: passengers.length,
        newRegistrations: recentPassengers.length,
        growthRate: passengers.length > 0 ? Math.round((recentPassengers.length / passengers.length) * 100) : 0,
      },
    },
    businessContext: {
      objectives: [
        "Improve transportation system efficiency",
        "Enhance passenger experience and safety",
        "Optimize resource allocation and utilization",
        "Reduce operational incidents and response time",
        "Increase system reliability and performance"
      ],
      targetAudience: "Transportation Management and Control Center Staff",
      keyQuestions: [
        "What are the main operational challenges affecting system performance?",
        "How effective is our incident response and resolution process?",
        "What trends indicate areas for improvement in resource utilization?",
        "How is passenger growth affecting system capacity and performance?",
        "What actionable insights can drive operational improvements?"
      ]
    }
  };
}

// POST /dashboard/api/analytics/generate-report - Generate analytics report
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
    const { dateRange = 'Last 30 days', reportType = 'comprehensive' } = body;

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI report generation is not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`Generating ${reportType} report for ${dateRange} by user:`, user.email);

    // Fetch all analytics data
    const rawData = await fetchAllAnalyticsData(token);
    
    // Process and structure the data
    const processedData = processAnalyticsData(rawData, dateRange);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate a comprehensive, professional analytics report for GusoSync Transportation System based on the following data:

${JSON.stringify(processedData, null, 2)}

Requirements:
1. Create a formal, executive-level report suitable for transportation management
2. Include executive summary, key findings, detailed analysis, and actionable recommendations
3. Focus on operational efficiency, safety, and performance improvements
4. Provide specific, measurable recommendations with expected impact
5. Use professional business language and structure
6. Include data-driven insights and trend analysis
7. Format as a complete report with clear sections and subsections

The report should be comprehensive yet concise, highlighting critical issues and opportunities for improvement in the transportation system.
`;

    // Generate the report content using Gemini AI
    const result = await model.generateContent(prompt);
    const reportContent = result.response.text();

    console.log('Report generated successfully');

    return NextResponse.json({
      success: true,
      data: {
        reportContent,
        metadata: processedData.reportMetadata,
        generatedBy: user.email,
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
