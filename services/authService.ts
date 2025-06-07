import { v4 as uuidv4 } from 'uuid';
import { sendRegistrationEmail } from './emailService';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Keep legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'CONTROL_STAFF' | 'BUS_DRIVER' | 'QUEUE_REGULATOR'; // Updated role types to match backend
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
  };
  emergencyContact?: {
    name: string;
    phoneNumber: string;
  };
  fatherName?: string; // Added father's name
  nationalId?: string; // Added National ID
  tinNumber?: string; // Added TIN Number
  photo?: File; // Photo file for upload
  photoUrl?: string; // URL of the uploaded photo
  // Driver-specific fields
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
  drivingExperience?: number;
  previousEmployer?: string;
  vehicleTypes?: string[];
  // Control staff fields
  specialization?: string;
  certifications?: string[];
  shiftPreference?: string;
  languages?: string[];
  technicalSkills?: string[];
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  };
}

class AuthService {
  private baseUrl = '/api/accounts';
  private apiBaseUrl = 'https://guzosync-fastapi.onrender.com';
  private backendApiBaseUrl = 'https://guzosync-backend.onrender.com';

  // Method to fetch current user details using access token
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/account/me', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const userData = await response.json();
        // Transform backend response to match our User interface
        const user: User = {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          phone_number: userData.phone_number,
          profile_image: userData.profile_image,
          is_active: userData.is_active,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          // Legacy fields for backward compatibility
          firstName: userData.first_name,
          lastName: userData.last_name,
          photoUrl: userData.profile_image,
        };
        return user;
      } else {
        console.error('Failed to fetch user details:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Use the local API endpoint for login
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        // Include credentials to allow cookies to be set
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.access_token || data.token; // Get token from response

        if (token) {
          // After successful login, fetch complete user details
          // Wait a brief moment for the cookie to be set, then fetch user data
          await new Promise(resolve => setTimeout(resolve, 100));
          const user = await this.getCurrentUser();
          if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
          }
        }

        return {
          success: true,
          data: data, // Return original data including token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Handle file upload if photo is provided
      if (userData.photo) {
        const photoData = await this.uploadPhoto(userData.photo);
        if (photoData.success && photoData.photoUrl) {
          // Add the photo URL to the user data
          userData = { ...userData, photoUrl: photoData.photoUrl };
        } else {
          return {
            success: false,
            message: 'Failed to upload photo. Please try again.',
          };
        }
      }

      // Remove the photo file from the request as it can't be serialized to JSON
      const { photo, ...userDataWithoutPhoto } = userData;

      // Use the local API endpoint for registration
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataWithoutPhoto),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  async uploadPhoto(file: File): Promise<{ success: boolean; photoUrl?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          photoUrl: data.photoUrl,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to upload photo',
        };
      }

    } catch (error) {
      console.error('Photo upload error:', error);
      return {
        success: false,
        message: 'Network error during photo upload',
      };
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    // try {
    //   const response = await fetch(`${this.apiBaseUrl}/api/accounts/password/reset/request`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ email }),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.detail?.[0]?.msg || 'Failed to request password reset.');
    //   }
    // } catch (error: any) {
    //   console.error('Request password reset error:', error);
    //   throw new Error(error.message || 'An error occurred during password reset request.');
    // }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    // try {
    //   const response = await fetch(`${this.apiBaseUrl}/api/accounts/password/reset/confirm`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ token, new_password: newPassword }),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.detail?.[0]?.msg || 'Failed to confirm password reset.');
    //   }
    // } catch (error: any) {
    //   console.error('Confirm password reset error:', error);
    //   throw new Error(error.message || 'An error occurred during password reset confirmation.');
    // }
  }

  async logout(): Promise<void> {
    // Call logout endpoint to clear the HTTP-only cookie
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear user data from sessionStorage
    sessionStorage.removeItem('currentUser');
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem('currentUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Ensure backward compatibility by adding legacy fields if missing
          if (user.first_name && !user.firstName) {
            user.firstName = user.first_name;
          }
          if (user.last_name && !user.lastName) {
            user.lastName = user.last_name;
          }
          if (user.profile_image && !user.photoUrl) {
            user.photoUrl = user.profile_image;
          }
          return user;
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  }

  // Method to refresh user data from the server
  async refreshUserData(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    return user;
  }

  isAuthenticated(): boolean {
    // We'll check if we have user data in sessionStorage
    // The actual authentication is handled by the server via HTTP-only cookies
    return this.getUser() !== null;
  }

  // Permission checking methods
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  canManageControlStaff(): boolean {
    // Only CONTROL_ADMIN can manage control staff
    return this.hasRole('CONTROL_ADMIN');
  }

  canManagePersonnel(): boolean {
    // CONTROL_ADMIN and CONTROL_STAFF can manage personnel (drivers and queue regulators)
    const user = this.getUser();
    return user?.role === 'CONTROL_ADMIN' || user?.role === 'CONTROL_STAFF';
  }

  isAdmin(): boolean {
    return this.hasRole('CONTROL_ADMIN');
  }
}

// Helper function to decode JWT payload
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}

export const authService = new AuthService();
export type { User, LoginRequest, RegisterRequest, AuthResponse };
