export interface BusRoute {
  id: string;
  name: string;
  color: string;
  start: string;
  passBy: string[];
  destination: string;
  distance: number;
  stops: number;
  activeBuses: number;
  expectedLoad: "Low" | "Medium" | "High" | "Very High";
  regulatorName: string;
  regulatorPhone: string;
  // Additional fields for management
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRouteRequest {
  name: string;
  color: string;
  start: string;
  passBy: string[];
  destination: string;
  distance: number;
  stops: number;
  expectedLoad: "Low" | "Medium" | "High" | "Very High";
  regulatorName: string;
  regulatorPhone: string;
  is_active?: boolean;
}

export interface UpdateRouteRequest {
  name?: string;
  color?: string;
  start?: string;
  passBy?: string[];
  destination?: string;
  distance?: number;
  stops?: number;
  expectedLoad?: "Low" | "Medium" | "High" | "Very High";
  regulatorName?: string;
  regulatorPhone?: string;
  is_active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  backend_limitation?: boolean;
}

class RouteService {
  private baseUrl = '/dashboard/api/routes';

  // Get all routes
  async getRoutes(): Promise<ApiResponse<BusRoute[]>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Check if this is a backend limitation response
        if (data.backend_limitation) {
          console.warn('Backend limitation:', data.message);
          // Still return success but with empty data and the limitation message
          return {
            success: true,
            data: data.data || [],
            message: data.message,
            backend_limitation: true,
          };
        }

        return {
          success: true,
          data: data.data || data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch routes',
        };
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get route by ID
  async getRouteById(id: string): Promise<ApiResponse<BusRoute>> {
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
          message: data.message || 'Failed to fetch route',
        };
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Create new route
  async createRoute(routeData: CreateRouteRequest): Promise<ApiResponse<BusRoute>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(routeData),
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
          message: data.message || 'Failed to create route',
        };
      }
    } catch (error) {
      console.error('Error creating route:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Update route
  async updateRoute(id: string, routeData: UpdateRouteRequest): Promise<ApiResponse<BusRoute>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(routeData),
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
          message: data.message || 'Failed to update route',
        };
      }
    } catch (error) {
      console.error('Error updating route:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Delete route
  async deleteRoute(id: string): Promise<ApiResponse<void>> {
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
          message: data.message || 'Failed to delete route',
        };
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Toggle route status
  async toggleRouteStatus(id: string): Promise<ApiResponse<BusRoute>> {
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
          message: data.message || 'Failed to toggle route status',
        };
      }
    } catch (error) {
      console.error('Error toggling route status:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get route statistics
  async getRouteStatistics(): Promise<ApiResponse<{
    totalRoutes: number;
    activeRoutes: number;
    inactiveRoutes: number;
    averageDistance: number;
    averageDuration: number;
    totalDistance: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`, {
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
          message: data.message || 'Failed to fetch route statistics',
        };
      }
    } catch (error) {
      console.error('Error fetching route statistics:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export const routeService = new RouteService();
export type { ApiResponse };
