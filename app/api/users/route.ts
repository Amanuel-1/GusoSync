import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user has permission
async function checkPermission(requiredRole?: string): Promise<{ authorized: boolean; user?: any }> {
  console.log(`[AUTH] Checking permission for role: ${requiredRole || 'general'}`);

  const token = await getAuthToken();
  if (!token) {
    console.log('[AUTH] No auth token found');
    return { authorized: false };
  }

  try {
    console.log('[AUTH] Fetching user details from backend');
    // Get current user details
    const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      console.log(`[AUTH] Failed to fetch user details: ${userResponse.status} ${userResponse.statusText}`);
      return { authorized: false };
    }

    const user = await userResponse.json();
    console.log(`[AUTH] User authenticated: ${user.email} with role: ${user.role}`);

    // Check if user has required role
    if (requiredRole) {
      const hasPermission = user.role === 'CONTROL_ADMIN' ||
                           (requiredRole === 'CONTROL_STAFF' && (user.role === 'CONTROL_STAFF' || user.role === 'CONTROL_ADMIN'));
      console.log(`[AUTH] Required role: ${requiredRole}, User role: ${user.role}, Has permission: ${hasPermission}`);
      return { authorized: hasPermission, user };
    }

    // For general access, allow CONTROL_ADMIN and CONTROL_STAFF
    const hasGeneralPermission = user.role === 'CONTROL_ADMIN' || user.role === 'CONTROL_STAFF';
    console.log(`[AUTH] General access check - User role: ${user.role}, Has permission: ${hasGeneralPermission}`);
    return { authorized: hasGeneralPermission, user };
  } catch (error) {
    console.error('[AUTH] Error checking permissions:', error);
    return { authorized: false };
  }
}

// GET /api/users - Get all users with optional filtering
export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] GET /api/users - Starting request`);

  try {
    console.log(`[${requestId}] Checking user permissions`);
    const { authorized, user: currentUser } = await checkPermission();
    if (!authorized) {
      console.log(`[${requestId}] Authorization failed - returning 403`);
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const { searchParams } = new URL(request.url);

    const role = searchParams.get('role');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const search = searchParams.get('search');

    console.log(`[${requestId}] Request parameters:`, {
      role,
      page,
      limit,
      search,
      userRole: currentUser?.role,
      userEmail: currentUser?.email
    });

    let allPersonnel: any[] = [];

    // Determine which personnel to fetch based on user role and requested role
    const isAdmin = currentUser?.role === 'CONTROL_ADMIN';

    if (role) {
      console.log(`[${requestId}] Fetching specific role: ${role}`);

      // Check if requesting control staff (admin only)
      if (role === 'CONTROL_STAFF' && !isAdmin) {
        console.log(`[${requestId}] Non-admin user trying to access control staff - denying access`);
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required to view control staff.' },
          { status: 403 }
        );
      }

      // Fetch specific role using role_filter parameter
      const params = new URLSearchParams();
      params.append('role_filter', role);
      const apiUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel?${params.toString()}`;

      console.log(`[${requestId}] Making API request to: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`[${requestId}] API response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const personnel = await response.json();
        console.log(`[${requestId}] Successfully fetched ${personnel.length} personnel records for role: ${role}`);

        allPersonnel = personnel.map((person: any) => ({
          id: person.id,
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email,
          role: person.role,
          phone_number: person.phone_number,
          profile_image: person.profile_image,
          is_active: person.is_active,
          created_at: person.created_at,
          updated_at: person.updated_at,
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[${requestId}] Failed to fetch personnel:`, {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        return NextResponse.json(
          { error: 'Failed to fetch personnel', details: errorData },
          { status: response.status }
        );
      }
    } else {
      console.log(`[${requestId}] Fetching all personnel - user is admin: ${isAdmin}`);

      // Fetch all personnel based on user permissions
      if (isAdmin) {
        // Admin can fetch all personnel including control staff
        const apiUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel`;
        console.log(`[${requestId}] Admin fetching all personnel from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`[${requestId}] All personnel API response status: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const personnel = await response.json();
          console.log(`[${requestId}] Successfully fetched ${personnel.length} total personnel records`);

          allPersonnel = personnel.map((person: any) => ({
            id: person.id,
            first_name: person.first_name,
            last_name: person.last_name,
            email: person.email,
            role: person.role,
            phone_number: person.phone_number,
            profile_image: person.profile_image,
            is_active: person.is_active,
            created_at: person.created_at,
            updated_at: person.updated_at,
          }));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error(`[${requestId}] Failed to fetch all personnel:`, {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          return NextResponse.json(
            { error: 'Failed to fetch personnel', details: errorData },
            { status: response.status }
          );
        }
      } else {
        // Control staff can only fetch drivers and queue regulators
        console.log(`[${requestId}] Control staff fetching drivers and queue regulators separately`);

        const driverParams = new URLSearchParams();
        driverParams.append('role_filter', 'BUS_DRIVER');

        const regulatorParams = new URLSearchParams();
        regulatorParams.append('role_filter', 'QUEUE_REGULATOR');

        const driverUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel?${driverParams.toString()}`;
        const regulatorUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel?${regulatorParams.toString()}`;

        console.log(`[${requestId}] Making parallel requests to:`, { driverUrl, regulatorUrl });

        const [driversResponse, regulatorsResponse] = await Promise.all([
          fetch(driverUrl, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(regulatorUrl, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          })
        ]);

        console.log(`[${requestId}] Parallel API responses:`, {
          driversStatus: `${driversResponse.status} ${driversResponse.statusText}`,
          regulatorsStatus: `${regulatorsResponse.status} ${regulatorsResponse.statusText}`
        });

        // Process drivers
        if (driversResponse.ok) {
          const drivers = await driversResponse.json();
          console.log(`[${requestId}] Successfully fetched ${drivers.length} drivers`);

          allPersonnel.push(...drivers.map((person: any) => ({
            id: person.id,
            first_name: person.first_name,
            last_name: person.last_name,
            email: person.email,
            role: person.role,
            phone_number: person.phone_number,
            profile_image: person.profile_image,
            is_active: person.is_active,
            created_at: person.created_at,
            updated_at: person.updated_at,
          })));
        } else {
          console.error(`[${requestId}] Failed to fetch drivers:`, {
            status: driversResponse.status,
            statusText: driversResponse.statusText
          });
        }

        // Process queue regulators
        if (regulatorsResponse.ok) {
          const regulators = await regulatorsResponse.json();
          console.log(`[${requestId}] Successfully fetched ${regulators.length} queue regulators`);

          allPersonnel.push(...regulators.map((person: any) => ({
            id: person.id,
            first_name: person.first_name,
            last_name: person.last_name,
            email: person.email,
            role: person.role,
            phone_number: person.phone_number,
            profile_image: person.profile_image,
            is_active: person.is_active,
            created_at: person.created_at,
            updated_at: person.updated_at,
          })));
        } else {
          console.error(`[${requestId}] Failed to fetch queue regulators:`, {
            status: regulatorsResponse.status,
            statusText: regulatorsResponse.statusText
          });
        }
      }
    }

    console.log(`[${requestId}] Total personnel fetched before filtering: ${allPersonnel.length}`);

    // Apply search filter if provided
    if (search) {
      console.log(`[${requestId}] Applying search filter: "${search}"`);
      const searchLower = search.toLowerCase();
      const originalCount = allPersonnel.length;
      allPersonnel = allPersonnel.filter(person =>
        person.first_name.toLowerCase().includes(searchLower) ||
        person.last_name.toLowerCase().includes(searchLower) ||
        person.email.toLowerCase().includes(searchLower)
      );
      console.log(`[${requestId}] Search filter applied: ${originalCount} -> ${allPersonnel.length} records`);
    }

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPersonnel = allPersonnel.slice(startIndex, endIndex);

    console.log(`[${requestId}] Pagination applied:`, {
      totalRecords: allPersonnel.length,
      page: pageNum,
      limit: limitNum,
      startIndex,
      endIndex,
      returnedRecords: paginatedPersonnel.length
    });

    const response = {
      users: paginatedPersonnel,
      total: allPersonnel.length,
      page: pageNum,
      limit: limitNum,
    };

    console.log(`[${requestId}] GET /api/users completed successfully - returning ${paginatedPersonnel.length} records`);
    return NextResponse.json(response);

  } catch (error) {
    console.error(`[${requestId}] Error in GET /api/users:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] POST /api/users - Starting user creation request`);

  try {
    console.log(`[${requestId}] Checking user permissions for user creation`);
    const { authorized } = await checkPermission();
    if (!authorized) {
      console.log(`[${requestId}] Authorization failed for user creation - returning 403`);
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();
    const body = await request.json();

    console.log(`[${requestId}] User creation request body:`, {
      email: body.email,
      role: body.role,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      hasProfileImage: !!body.profile_image
    });

    // Check if creating control staff (admin only)
    if (body.role === 'CONTROL_STAFF') {
      console.log(`[${requestId}] Creating control staff - checking admin permissions`);
      const { authorized: adminAuthorized } = await checkPermission('CONTROL_ADMIN');
      if (!adminAuthorized) {
        console.log(`[${requestId}] Non-admin trying to create control staff - denying access`);
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required to create control staff.' },
          { status: 403 }
        );
      }
      console.log(`[${requestId}] Admin permissions confirmed for control staff creation`);
    }

    // Determine endpoint and password handling based on role
    let apiUrl: string;
    let backendBody: any;
    let generatedPassword = body.password;
    let passwordGenerated = false;

    if (body.role === 'CONTROL_STAFF') {
      // Control staff uses accounts/register endpoint and requires password
      apiUrl = `${BACKEND_API_BASE_URL}/api/accounts/register`;
      if (!body.password) {
        // Generate password if not provided
        generatedPassword = `Guzo${nanoid()}`;
        passwordGenerated = true;
        console.log(`[${requestId}] Generated password for ${body.role}: ${generatedPassword.substring(0, 8)}...`);
      } else {
        console.log(`[${requestId}] Using provided password for ${body.role}`);
      }

      backendBody = {
        email: body.email,
        password: generatedPassword,
        first_name: body.first_name,
        last_name: body.last_name,
        phone_number: body.phone_number,
        role: body.role,
        profile_image: body.profile_image,
      };
    } else {
      // Bus drivers and queue regulators use personnel/register endpoint (no password required)
      apiUrl = `${BACKEND_API_BASE_URL}/api/control-center/personnel/register`;
      passwordGenerated = true; // Always generate for drivers and regulators

      backendBody = {
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        phone_number: body.phone_number,
        role: body.role,
        profile_image: body.profile_image,
      };

      console.log(`[${requestId}] Using personnel register endpoint for ${body.role} (password auto-generated by backend)`);
    }
  

    console.log(`[${requestId}] Making user creation request to: ${apiUrl}`);
    console.log(`[${requestId}] Backend request body:`, {
      ...backendBody,
      password: backendBody.password ? '[REDACTED]' : '[NOT_INCLUDED]'
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
    });

    console.log(`[${requestId}] User creation API response: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[${requestId}] User created successfully:`, {
        userId: data.id,
        email: data.email,
        role: data.role
      });

      // Return the created user data along with generated password if applicable
      const responseData = {
        ...data,
        ...(passwordGenerated && { generatedPassword })
      };

      console.log(`[${requestId}] POST /api/users completed successfully`);
      return NextResponse.json(responseData);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[${requestId}] Failed to create user:`, {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to create user', details: errorData },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Error in POST /api/users:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
