import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.email) {
      return NextResponse.json(
        { 
          message: 'Email is required',
          detail: [{ msg: 'Email field is required', type: 'value_error' }]
        },
        { status: 422 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          message: 'Invalid email format',
          detail: [{ msg: 'Invalid email format', type: 'value_error' }]
        },
        { status: 422 }
      );
    }

    console.log('Forwarding password reset request to backend:', `${BACKEND_API_BASE_URL}/api/accounts/password/reset/request`);

    // Forward request to backend
    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/api/accounts/password/reset/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: body.email }),
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
      console.log('Password reset request successful:', responseBody);
      return NextResponse.json(
        { 
          message: 'If an account with that email exists, a password reset link has been sent.',
          success: true
        },
        { status: 200 }
      );
    } else {
      console.error('Password reset request failed:', responseBody);
      
      // Handle different error scenarios
      let userMessage = 'Failed to process password reset request. Please try again.';
      let statusCode = backendResponse.status;

      if (backendResponse.status === 404) {
        // For security reasons, we don't reveal if the email exists or not
        userMessage = 'If an account with that email exists, a password reset link has been sent.';
        statusCode = 200;
      } else if (backendResponse.status === 429) {
        userMessage = 'Too many password reset requests. Please wait before trying again.';
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
    console.error('Error in password reset request API route:', error);

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
