import { NextResponse } from 'next/server';

const BACKEND_API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

export async function POST(request: Request) {
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

      // Transform camelCase to snake_case for backend registration
      const backendBody = {
        email: body.email,
        password: body.password,
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
