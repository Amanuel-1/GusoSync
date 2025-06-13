import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.token) {
      return NextResponse.json(
        { 
          message: 'Reset token is required',
          detail: [{ msg: 'Token field is required', type: 'value_error' }]
        },
        { status: 422 }
      );
    }

    if (!body.new_password) {
      return NextResponse.json(
        { 
          message: 'New password is required',
          detail: [{ msg: 'New password field is required', type: 'value_error' }]
        },
        { status: 422 }
      );
    }

    // Validate password strength (basic validation)
    if (body.new_password.length < 8) {
      return NextResponse.json(
        { 
          message: 'Password must be at least 8 characters long',
          detail: [{ msg: 'Password must be at least 8 characters long', type: 'value_error' }]
        },
        { status: 422 }
      );
    }

    console.log('Forwarding password reset confirmation to backend:', `${BACKEND_API_BASE_URL}/api/accounts/password/reset/confirm`);

    // Forward request to backend
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/accounts/password/reset/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: body.token,
        new_password: body.new_password 
      }),
    });

    let responseBody;
    try {
      responseBody = await backendResponse.json();
    } catch (parseError) {
      console.error('Error parsing backend response:', parseError);
      return NextResponse.json({
        message: 'Backend service is currently unavailable. Please try again later.'
      }, { status: 503 });
    }

    if (backendResponse.ok) {
      console.log('Password reset confirmation successful:', responseBody);
      return NextResponse.json(
        { 
          message: 'Your password has been reset successfully. You can now log in with your new password.',
          success: true
        },
        { status: 200 }
      );
    } else {
      console.error('Password reset confirmation failed:', responseBody);
      
      // Handle different error scenarios
      let userMessage = 'Failed to reset password. Please try again.';
      let statusCode = backendResponse.status;

      if (backendResponse.status === 400) {
        userMessage = 'Invalid or expired reset token. Please request a new password reset.';
      } else if (backendResponse.status === 404) {
        userMessage = 'Invalid reset token. Please request a new password reset.';
      } else if (backendResponse.status === 429) {
        userMessage = 'Too many password reset attempts. Please wait before trying again.';
      } else if (backendResponse.status >= 500) {
        userMessage = 'Server error. Please try again later.';
      } else if (responseBody.detail && Array.isArray(responseBody.detail)) {
        userMessage = responseBody.detail[0]?.msg || userMessage;
      } else if (responseBody.message) {
        userMessage = responseBody.message;
      }

      return NextResponse.json({
        message: userMessage,
        detail: responseBody.detail || []
      }, { status: statusCode });
    }

  } catch (error: unknown) {
    console.error('Error in password reset confirmation API route:', error);

    // Handle network errors
    if (error instanceof Error && error.cause && typeof error.cause === 'object' && 'code' in error.cause && error.cause.code === 'UND_ERR_HEADERS_TIMEOUT') {
      return NextResponse.json({
        message: 'The service is taking too long to respond. Please try again later.'
      }, { status: 504 });
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        message: 'Unable to connect to the service. Please check your internet connection and try again.'
      }, { status: 503 });
    }

    return NextResponse.json({
      message: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
}
