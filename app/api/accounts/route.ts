import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sendRegistrationEmail } from '@/services/emailService';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Helper function to determine if it's a logout request
function isLogoutRequest(url: string): boolean {
  return url.endsWith('/logout');
}

export async function POST(request: Request) {
  // Check if it's a logout request
  if (isLogoutRequest(request.url)) {
    // Create a response that clears the auth cookie
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear the auth cookie
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
  try {
    const body = await request.json();
    let backendUrl = '';
    let requestType = '';
    let backendResponse; // Declare backendResponse here

    // Determine if it's a registration or login request based on body content
    if (body.firstName && body.lastName && body.role) {
      // Registration request
      backendUrl = `${BACKEND_API_BASE_URL}/api/accounts/register`;
      requestType = 'registration';
      console.log('Forwarding registration request to:', backendUrl);

      let generatedPassword = body.password; // Default to provided password

      // Generate password for specific roles
      if (body.role === 'driver' || body.role === 'queue regulator') {
        generatedPassword = `Guzo${nanoid()}`;
        console.log(`Generated password for ${body.role}: ${generatedPassword}`);
      }

      // Transform camelCase to snake_case for backend registration
      const backendBody = {
        email: body.email,
        password: generatedPassword, // Use generated or provided password
        first_name: body.firstName,
        last_name: body.lastName,
        father_name: body.fatherName, // Assuming backend expects snake_case for fatherName too
        phone_number: body.phoneNumber,
        role: body.role,
        date_of_birth: body.dateOfBirth, // Assuming backend expects snake_case
        address: body.address, // Assuming nested objects are handled by backend
        emergency_contact: body.emergencyContact, // Assuming backend expects snake_case
        national_id: body.nationalId, // Assuming backend expects snake_case
        tin_number: body.tinNumber, // Assuming backend expects snake_case
        photo_url: body.photoUrl, // Assuming backend expects snake_case
        // Include other potential fields from FormData if needed by backend
        license_number: body.licenseNumber,
        license_expiry: body.licenseExpiry,
        license_class: body.licenseClass,
        driving_experience: body.drivingExperience,
        previous_employer: body.previousEmployer,
        vehicle_types: body.vehicleTypes,
        specialization: body.specialization,
        certifications: body.certifications,
        shift_preference: body.shiftPreference,
        languages: body.languages,
        technical_skills: body.technicalSkills,
      };

      backendResponse = await fetch(backendUrl, { // Assign to declared variable
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendBody), // Send the transformed body
      });

      // Process response for registration
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
        console.log(`${requestType} successful:`, responseBody);

        // Send email with credentials if password was generated
        if (body.role === 'driver' || body.role === 'queue regulator') {
          try {
            await sendRegistrationEmail(body.email, body.email, generatedPassword);
          } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
            // Log the error but still return success for the registration
          }
        }

        return NextResponse.json(responseBody, { status: backendResponse.status });
      } else {
        console.error(`${requestType} failed:`, responseBody);
        let userMessage = responseBody.message || `${requestType} failed. Please try again.`;
        if (backendResponse.status === 409) {
          userMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (backendResponse.status === 401) {
          userMessage = 'Invalid credentials. Please check your email and password.';
        } else if (backendResponse.status >= 500) {
          userMessage = 'Server error. Please try again later.';
        }
        return NextResponse.json({
          message: userMessage,
          details: responseBody
        }, { status: backendResponse.status });
      }


    } else if (body.email && body.password && !body.firstName) {
      // Login request - forward as is (assuming login uses camelCase or backend handles it)
      backendUrl = `${BACKEND_API_BASE_URL}/api/accounts/login`;
      requestType = 'login';
      console.log('Forwarding login request to:', backendUrl);

      backendResponse = await fetch(backendUrl, { // Assign to declared variable
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Process response for login
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
        console.log(`${requestType} successful:`, responseBody);
        
        // For login requests, ensure we have user data to store in sessionStorage
        if (requestType === 'login') {
          // Set the token in an HTTP-only cookie
          const response = NextResponse.json(responseBody, { status: backendResponse.status });
          
          // Get the token from the response body
          const token = responseBody.token || responseBody.access_token;
          
          if (token) {
            // Set the token in an HTTP-only cookie
            // maxAge is set to 7 days (in seconds)
            response.cookies.set({
              name: 'authToken',
              value: token,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production', // Only use secure in production
              sameSite: 'strict',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          }
          
          return response;
        }
        
        return NextResponse.json(responseBody, { status: backendResponse.status });
      } else {
        console.error(`${requestType} failed:`, responseBody);
        let userMessage = responseBody.message || `${requestType} failed. Please try again.`;
        if (backendResponse.status === 409) {
          userMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (backendResponse.status === 401) {
          userMessage = 'Invalid credentials. Please check your email and password.';
        } else if (backendResponse.status >= 500) {
          userMessage = 'Server error. Please try again later.';
        }
        return NextResponse.json({
          message: userMessage,
          details: responseBody
        }, { status: backendResponse.status });
      }


    } else {
      // Invalid request body
      return NextResponse.json({
        message: 'Invalid request body. Please provide valid login or registration data.'
      }, { status: 400 });
    }

  } catch (error: unknown) { // Explicitly type error as unknown
    console.error('Error in API route:', error);

    // Check for specific network errors
    if (error instanceof Error && error.cause && typeof error.cause === 'object' && 'code' in error.cause && error.cause.code === 'UND_ERR_HEADERS_TIMEOUT') {
      return NextResponse.json({
        message: 'The authentication service is taking too long to respond. It might be temporarily unavailable. Please try again later.'
      }, { status: 504 }); // Use 504 Gateway Timeout status code
    }
    // Check if it's a generic fetch error
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
