interface PendingRegistration {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  profile_image?: string;
  created_at: string;
  submitted_by?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApprovalRequest {
  registrationId: string;
  action: 'approve' | 'reject';
  userData?: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: string;
    profile_image?: string;
    password?: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApprovalService {
  private baseUrl = '/api/personnel/approvals';

  // Get all pending registrations
  async getPendingRegistrations(): Promise<ApiResponse<PendingRegistration[]>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch pending registrations',
        };
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Approve a registration
  async approveRegistration(registrationId: string, userData: ApprovalRequest['userData']): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          registrationId,
          action: 'approve',
          userData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to approve registration',
        };
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Reject a registration
  async rejectRegistration(registrationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          registrationId,
          action: 'reject',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to reject registration',
        };
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Update a pending registration
  async updatePendingRegistration(registrationId: string, updates: Partial<PendingRegistration>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          registrationId,
          updates,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update pending registration',
        };
      }
    } catch (error) {
      console.error('Error updating pending registration:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Delete a pending registration
  async deletePendingRegistration(registrationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${registrationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to delete pending registration',
        };
      }
    } catch (error) {
      console.error('Error deleting pending registration:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get approval statistics
  async getApprovalStatistics(): Promise<ApiResponse<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    pendingByRole: Record<string, number>;
  }>> {
    try {
      // This would typically be a separate endpoint
      // For now, we'll calculate from pending registrations
      const pendingResponse = await this.getPendingRegistrations();
      
      if (!pendingResponse.success || !pendingResponse.data) {
        return {
          success: false,
          message: 'Failed to fetch statistics',
        };
      }

      const pending = pendingResponse.data;
      const pendingByRole = pending.reduce((acc, registration) => {
        acc[registration.role] = (acc[registration.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        data: {
          totalPending: pending.length,
          totalApproved: 0, // Would come from database
          totalRejected: 0, // Would come from database
          pendingByRole,
        },
      };
    } catch (error) {
      console.error('Error fetching approval statistics:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export const approvalService = new ApprovalService();
export type { PendingRegistration, ApprovalRequest, ApiResponse };
