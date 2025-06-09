import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to verify user role from token
async function verifyUserRole(token: string): Promise<{ authorized: boolean; role?: string }> {
  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      const authorized = user.role === 'CONTROL_ADMIN' || user.role === 'CONTROL_STAFF';
      return { authorized, role: user.role };
    }
  } catch (error) {
    console.error('Error verifying user role:', error);
  }

  return { authorized: false };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('authToken');

    if (!authToken) {
      // No auth token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'authentication_required');
      return NextResponse.redirect(loginUrl);
    }

    // Verify user role
    const { authorized, role } = await verifyUserRole(authToken.value);

    if (!authorized) {
      // User doesn't have permission to access control system
      console.log(`Unauthorized access attempt to ${pathname} by user with role: ${role}`);
      
      // Clear the auth cookie since the user doesn't have proper permissions
      const response = NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      response.cookies.set({
        name: 'authToken',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
      });
      
      return response;
    }

    // User is authorized, continue to the requested page
    return NextResponse.next();
  }

  // For non-dashboard routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
