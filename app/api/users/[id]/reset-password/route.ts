import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { sendRegistrationEmail } from '@/services/emailService';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  return authToken?.value || null;
}

// Helper function to check if user has permission
async function checkPermission(requiredRole?: string): Promise<{ authorized: boolean; user?: any }> {
  const token = await getAuthToken();
  if (!token) {
    return { authorized: false };
  }

  try {
    // Get current user details
    const userResponse = await fetch(`${BACKEND_API_BASE_URL}/api/account/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return { authorized: false };
    }

    const user = await userResponse.json();
    
    // Check if user has required role
    if (requiredRole) {
      const hasPermission = user.role === 'CONTROL_ADMIN' ||
                           (requiredRole === 'CONTROL_STAFF' && (user.role === 'CONTROL_STAFF' || user.role === 'CONTROL_ADMIN'));
      return { authorized: hasPermission, user };
    }

    // For general access, allow CONTROL_ADMIN and CONTROL_STAFF
    const hasGeneralPermission = user.role === 'CONTROL_ADMIN' || user.role === 'CONTROL_STAFF';
    return { authorized: hasGeneralPermission, user };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { authorized: false };
  }
}

// POST /api/users/[id]/reset-password - Manual password reset
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = Math.random().toString(36).substring(7);
  const { id } = params;
  console.log(`[${requestId}] POST /api/users/${id}/reset-password - Starting password reset`);

  try {
    console.log(`[${requestId}] Checking user permissions for password reset`);
    const { authorized } = await checkPermission();
    if (!authorized) {
      console.log(`[${requestId}] Authorization failed for password reset - returning 403`);
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Control Staff access required.' },
        { status: 403 }
      );
    }

    const token = await getAuthToken();

    // First get the user to check their role and get their email
    const userApiUrl = `${BACKEND_API_BASE_URL}/api/account/${id}`;
    console.log(`[${requestId}] Fetching user details from: ${userApiUrl}`);

    const userResponse = await fetch(userApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[${requestId}] User fetch response: ${userResponse.status} ${userResponse.statusText}`);

    if (!userResponse.ok) {
      console.log(`[${requestId}] User not found for password reset`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = await userResponse.json();
    console.log(`[${requestId}] User found for password reset:`, {
      userId: userData.id,
      email: userData.email,
      role: userData.role
    });

    // Check if resetting control staff password (admin only)
    if (userData.role === 'CONTROL_STAFF') {
      console.log(`[${requestId}] Resetting control staff password - checking admin permissions`);
      const { authorized: adminAuthorized } = await checkPermission('CONTROL_ADMIN');
      if (!adminAuthorized) {
        console.log(`[${requestId}] Non-admin trying to reset control staff password - denying access`);
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required to reset control staff password.' },
          { status: 403 }
        );
      }
      console.log(`[${requestId}] Admin permissions confirmed for control staff password reset`);
    }

    // Generate new password
    const newPassword = `Guzo${nanoid()}`;
    console.log(`[${requestId}] Generated new password: ${newPassword.substring(0, 8)}...`);

    // Update user password
    const passwordApiUrl = `${BACKEND_API_BASE_URL}/api/account/${id}/password`;
    console.log(`[${requestId}] Updating password at: ${passwordApiUrl}`);

    const updateResponse = await fetch(passwordApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_password: newPassword,
        reset_by_admin: true,
      }),
    });

    console.log(`[${requestId}] Password update response: ${updateResponse.status} ${updateResponse.statusText}`);

    if (updateResponse.ok) {
      console.log(`[${requestId}] Password updated successfully, sending email notification`);

      // Send email with new password
      let emailSent = false;
      try {
        await sendRegistrationEmail(
          userData.email,
          userData.email,
          newPassword
        );
        emailSent = true;
        console.log(`[${requestId}] Password reset email sent successfully to: ${userData.email}`);
      } catch (emailError) {
        console.error(`[${requestId}] Failed to send password reset email:`, emailError);
        // Continue even if email fails
      }

      console.log(`[${requestId}] Password reset completed successfully`);
      return NextResponse.json({
        message: 'Password reset successfully',
        newPassword: newPassword,
        emailSent: emailSent,
      });
    } else {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error(`[${requestId}] Failed to reset password:`, {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: 'Failed to reset password', details: errorData },
        { status: updateResponse.status }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Error in POST /api/users/${id}/reset-password:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
