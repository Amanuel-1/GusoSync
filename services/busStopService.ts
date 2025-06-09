import { BusStop, IncomingBus, BusStopWithIncomingBuses, CreateBusStopRequest, UpdateBusStopRequest } from '@/types/busStop';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  backend_limitation?: boolean;
}

class BusStopService {
  private baseUrl = '/dashboard/api/bus-stops';

  // Get all bus stops
  async getBusStops(): Promise<ApiResponse<BusStop[]>> {
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
          message: data.message || 'Failed to fetch bus stops',
        };
      }
    } catch (error) {
      console.error('Error fetching bus stops:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get bus stops with incoming buses
  async getBusStopsWithIncomingBuses(): Promise<ApiResponse<BusStopWithIncomingBuses[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/with-incoming-buses`, {
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
          message: data.message || 'Failed to fetch bus stops with incoming buses',
        };
      }
    } catch (error) {
      console.error('Error fetching bus stops with incoming buses:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get specific bus stop
  async getBusStop(id: string): Promise<ApiResponse<BusStop>> {
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
          message: data.message || 'Failed to fetch bus stop',
        };
      }
    } catch (error) {
      console.error('Error fetching bus stop:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get incoming buses for a specific bus stop
  async getIncomingBuses(busStopId: string): Promise<ApiResponse<IncomingBus[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${busStopId}/incoming-buses`, {
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
          message: data.message || 'Failed to fetch incoming buses',
        };
      }
    } catch (error) {
      console.error('Error fetching incoming buses:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Create bus stop
  async createBusStop(busStopData: CreateBusStopRequest): Promise<ApiResponse<BusStop>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busStopData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message || 'Bus stop created successfully',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to create bus stop',
        };
      }
    } catch (error) {
      console.error('Error creating bus stop:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Update bus stop
  async updateBusStop(id: string, busStopData: UpdateBusStopRequest): Promise<ApiResponse<BusStop>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busStopData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message || 'Bus stop updated successfully',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update bus stop',
        };
      }
    } catch (error) {
      console.error('Error updating bus stop:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Delete bus stop
  async deleteBusStop(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Bus stop deleted successfully',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to delete bus stop',
        };
      }
    } catch (error) {
      console.error('Error deleting bus stop:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export const busStopService = new BusStopService();
