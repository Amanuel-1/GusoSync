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
  role: 'PASSENGER' | 'CONTROL_STAFF'; // Updated role types
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

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Use the local API endpoint for login
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        return {
          success: true,
          data: data,
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

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
export type { LoginRequest, RegisterRequest, AuthResponse };
