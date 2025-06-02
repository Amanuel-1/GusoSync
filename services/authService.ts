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
  role: 'PASSENGER' | 'CONTROL_CENTER' | 'QUEUE_REGULATOR';
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

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
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
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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
