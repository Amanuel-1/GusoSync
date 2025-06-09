export interface BusData {
  id: string;
  license_plate: string;
  bus_type: "STANDARD" | "ARTICULATED" | "MINIBUS";
  capacity: number;
  bus_status: "OPERATIONAL" | "MAINTENANCE" | "BREAKDOWN" | "IDLE";
  assigned_route_id?: string | null;
  assigned_driver_id?: string | null;
  manufacture_year?: number | null;
  bus_model?: string | null;
  created_at?: string;
  updated_at?: string;
  // Real-time tracking data from API
  current_location?: {
    latitude: number;
    longitude: number;
  } | null;
  last_location_update?: string | null;
  speed?: number | null;
  heading?: number | null;
  location_accuracy?: number | null;
  current_address?: string | null;
  // Computed fields for display
  name?: string;
  route_name?: string;
  driver_name?: string;
  is_active?: boolean;
}

export interface CreateBusRequest {
  license_plate: string;
  bus_type: "STANDARD" | "ARTICULATED" | "MINIBUS";
  capacity: number;
  bus_status?: "OPERATIONAL" | "MAINTENANCE" | "BREAKDOWN" | "IDLE";
  assigned_route_id?: string | null;
  assigned_driver_id?: string | null;
  manufacture_year?: number | null;
  bus_model?: string | null;
}

export interface UpdateBusRequest {
  license_plate?: string | null;
  bus_type?: "STANDARD" | "ARTICULATED" | "MINIBUS" | null;
  capacity?: number | null;
  bus_status?: "OPERATIONAL" | "MAINTENANCE" | "BREAKDOWN" | "IDLE" | null;
  assigned_route_id?: string | null;
  assigned_driver_id?: string | null;
  manufacture_year?: number | null;
  bus_model?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class BusService {
  private baseUrl = '/dashboard/api/busses';

  // Get all busses
  async getBusses(): Promise<ApiResponse<BusData[]>> {
    try {
      const response = await fetch(this.baseUrl, {
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
          message: data.message || 'Failed to fetch busses',
        };
      }
    } catch (error) {
      console.error('Error fetching busses:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get bus by ID
  async getBus(id: string): Promise<ApiResponse<BusData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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
          message: data.message || 'Failed to fetch bus',
        };
      }
    } catch (error) {
      console.error('Error fetching bus:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Create new bus
  async createBus(busData: CreateBusRequest): Promise<ApiResponse<BusData>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to create bus',
        };
      }
    } catch (error) {
      console.error('Error creating bus:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Update bus
  async updateBus(id: string, busData: UpdateBusRequest): Promise<ApiResponse<BusData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update bus',
        };
      }
    } catch (error) {
      console.error('Error updating bus:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Delete bus
  async deleteBus(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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
          message: data.message || 'Failed to delete bus',
        };
      }
    } catch (error) {
      console.error('Error deleting bus:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Toggle bus status
  async toggleBusStatus(id: string): Promise<ApiResponse<BusData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/toggle-status`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to toggle bus status',
        };
      }
    } catch (error) {
      console.error('Error toggling bus status:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export const busService = new BusService();
export type { BusData, CreateBusRequest, UpdateBusRequest };
