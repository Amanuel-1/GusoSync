import { NextResponse } from 'next/server';

const BACKEND_API_BASE_URL = 'https://guzosync-backend.onrender.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let backendUrl = '';
    let requestType = '';

    // Determine if it's a registration or login request based on body content
    if (body.firstName && body.lastName && body.role) {
      // Registration request
      backendUrl = `${BACKEND_API_BASE_URL}/api/accounts/register`;
      requestType = 'registration';
      console.log('Forwarding registration request to:', backendUrl);
    } else if (body.email && body.password && !body.firstName) {
      // Login request
      backendUrl = `${BACKEND_API_BASE_URL}/api/accounts/login`;
      requestType = 'login';
      console.log('Forwarding login request to:', backendUrl);
    } else {
      // Invalid request body
      return NextResponse.json({ 
        message: 'Invalid request body. Please provide valid login or registration data.' 
      }, { status: 400 });
    }

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...body,role:'CONTROL_CENTER'}),
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

    // Handle different response scenarios
    if (backendResponse.ok) {
      // Success response
      console.log(`${requestType} successful:`, responseBody);
      return NextResponse.json(responseBody, { status: backendResponse.status });
    } else {
      // Error response from backend
      console.error(`${requestType} failed:`, responseBody);
      
      // Provide user-friendly error messages
      let userMessage = responseBody.message || `${requestType} failed. Please try again.`;
      
      if (backendResponse.status === 409) {
        userMessage = requestType === 'registration' 
          ? 'An account with this email already exists. Please try logging in instead.'
          : 'Invalid credentials. Please check your email and password.';
      } else if (backendResponse.status === 401) {
        userMessage = 'Invalid email or password. Please try again.';
      } else if (backendResponse.status >= 500) {
        userMessage = 'Server error. Please try again later.';
      }
      
      return NextResponse.json({ 
        message: userMessage,
        details: responseBody 
      }, { status: backendResponse.status });
    }

  } catch (error) {
    console.error('Error in API route:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({ 
        message: 'Unable to connect to the authentication service. Please check your internet connection and try again.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}
