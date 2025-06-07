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
}

interface CreateUserRequest {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: 'BUS_DRIVER' | 'QUEUE_REGULATOR' | 'CONTROL_STAFF';
  profile_image?: string;
}

interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  profile_image?: string;
  is_active?: boolean;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class UserService {
  private baseUrl = '/api/users';

  // Get all users with optional filtering
  async getUsers(params?: {
    role?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<UsersResponse>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.append('role', params.role);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);

      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
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
          message: data.message || 'Failed to fetch users',
        };
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get drivers only
  async getDrivers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.getUsers({ role: 'BUS_DRIVER' });
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users || response.data,
        };
      }
      return response as ApiResponse<User[]>;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return {
        success: false,
        message: 'Failed to fetch drivers',
      };
    }
  }

  // Get queue regulators only
  async getQueueRegulators(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.getUsers({ role: 'QUEUE_REGULATOR' });
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users || response.data,
        };
      }
      return response as ApiResponse<User[]>;
    } catch (error) {
      console.error('Error fetching queue regulators:', error);
      return {
        success: false,
        message: 'Failed to fetch queue regulators',
      };
    }
  }

  // Get control staff only (admin only)
  async getControlStaff(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.getUsers({ role: 'CONTROL_STAFF' });
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users || response.data,
        };
      }
      return response as ApiResponse<User[]>;
    } catch (error) {
      console.error('Error fetching control staff:', error);
      return {
        success: false,
        message: 'Failed to fetch control staff',
      };
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        credentials: 'include',
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
          message: data.message || 'Failed to fetch user',
        };
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
          message: data.message || 'Failed to create user',
        };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
          message: data.message || 'Failed to update user',
        };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          message: data.message || 'Failed to delete user',
        };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Reset user password manually
  async resetUserPassword(id: string): Promise<ApiResponse<{ newPassword: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/reset-password`, {
        method: 'POST',
        credentials: 'include',
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
          message: data.message || 'Failed to reset password',
        };
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Toggle user active status
  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/toggle-status`, {
        method: 'POST',
        credentials: 'include',
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
          message: data.message || 'Failed to toggle user status',
        };
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export const userService = new UserService();
export type { User, CreateUserRequest, UpdateUserRequest, UsersResponse, ApiResponse };
