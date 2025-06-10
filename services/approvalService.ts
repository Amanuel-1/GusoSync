// Updated interfaces to match backend API schema
interface PendingRegistration {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  profile_image?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface ApprovalActionRequest {
  action: 'APPROVED' | 'REJECTED';
  review_notes?: string | null;
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
  async getPendingRegistrations(statusFilter?: string): Promise<ApiResponse<PendingRegistration[]>> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);
      if (statusFilter) {
        url.searchParams.append('status_filter', statusFilter);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data, // Handle both wrapped and direct array responses
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

  // Get specific approval request
  async getApprovalRequest(requestId: string): Promise<ApiResponse<PendingRegistration>> {
    try {
      const response = await fetch(`${this.baseUrl}/${requestId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch approval request',
        };
      }
    } catch (error) {
      console.error('Error fetching approval request:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Approve a registration
  async approveRegistration(registrationId: string, _userData?: ApprovalRequest['userData'], reviewNotes?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${registrationId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'APPROVED',
          review_notes: reviewNotes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message || 'Registration approved successfully',
        };
      } else {
        return {
          success: false,
          message: data.error || data.message || 'Failed to approve registration',
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
  async rejectRegistration(registrationId: string, reviewNotes?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${registrationId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'REJECTED',
          review_notes: reviewNotes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message || 'Registration rejected successfully',
        };
      } else {
        return {
          success: false,
          message: data.error || data.message || 'Failed to reject registration',
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



  // Get pending requests count
  async getPendingRequestsCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/pending/count`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch pending count',
        };
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
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
      // Get all requests to calculate statistics
      const allPendingResponse = await this.getPendingRegistrations('PENDING');
      const allApprovedResponse = await this.getPendingRegistrations('APPROVED');
      const allRejectedResponse = await this.getPendingRegistrations('REJECTED');

      if (!allPendingResponse.success) {
        return {
          success: false,
          message: 'Failed to fetch statistics',
        };
      }

      const pending = allPendingResponse.data || [];
      const approved = allApprovedResponse.data || [];
      const rejected = allRejectedResponse.data || [];

      const pendingByRole = pending.reduce((acc, registration) => {
        acc[registration.role] = (acc[registration.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        data: {
          totalPending: pending.length,
          totalApproved: approved.length,
          totalRejected: rejected.length,
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
export type { PendingRegistration, ApprovalRequest, ApprovalActionRequest, ApiResponse };
