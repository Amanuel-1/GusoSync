"use client"

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { showToast } from '@/lib/toast';

// Updated interface to match backend API response
export interface RouteData {
  id: string;
  name: string;
  description?: string | null;
  stop_ids: string[];
  total_distance?: number | null;
  estimated_duration?: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRouteRequest {
  name: string;
  description?: string | null;
  stop_ids: string[];
  total_distance?: number | null;
  estimated_duration?: number | null;
  is_active: boolean;
}

export interface UpdateRouteRequest {
  name?: string | null;
  description?: string | null;
  stop_ids?: string[];
  total_distance?: number | null;
  estimated_duration?: number | null;
  is_active?: boolean;
}

interface UseRouteManagementReturn {
  // Data
  routes: RouteData[];
  statistics: {
    totalRoutes: number;
    activeRoutes: number;
    inactiveRoutes: number;
    averageDistance: number;
    averageDuration: number;
    totalDistance: number;
  } | null;
  userRole: string | null;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRoutes: (params?: { page?: string; limit?: string; search?: string; is_active?: boolean }) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createRoute: (routeData: CreateRouteRequest) => Promise<{ success: boolean; message?: string }>;
  updateRoute: (id: string, routeData: UpdateRouteRequest) => Promise<{ success: boolean; message?: string }>;
  deleteRoute: (id: string) => Promise<{ success: boolean; message?: string }>;
  toggleRouteStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
  getRoute: (id: string) => Promise<RouteData | null>;
  refreshData: () => Promise<void>;
}

export function useRouteManagementAPI(): UseRouteManagementReturn {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [statistics, setStatistics] = useState<{
    totalRoutes: number;
    activeRoutes: number;
    inactiveRoutes: number;
    averageDistance: number;
    averageDuration: number;
    totalDistance: number;
  } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all routes (with pagination to get all routes)
  const fetchRoutes = useCallback(async (params?: { page?: string; limit?: string; search?: string; is_active?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      let allRoutes: RouteData[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const limit = 100; // Use maximum allowed limit

      // Helper function to build query params
      const buildQueryParams = (page: number, limit: number) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
        return queryParams;
      };

      // If specific params are provided, just fetch that page
      if (params?.page && params?.limit) {
        const queryParams = buildQueryParams(parseInt(params.page), Math.min(parseInt(params.limit), 100));

        const url = `/dashboard/api/routes?${queryParams.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        if (response.ok) {
          setRoutes(data.data || []);
          setUserRole(data.user_role || null);
        } else {
          setError(data.error || 'Failed to fetch routes');
          showToast.error(data.error || 'Failed to fetch routes');
        }
        return;
      }

      // Fetch all pages to get all routes
      while (hasMorePages) {
        const queryParams = buildQueryParams(currentPage, limit);

        const url = `/dashboard/api/routes?${queryParams.toString()}`;

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          const pageRoutes = data.data || [];
          allRoutes = [...allRoutes, ...pageRoutes];
          setUserRole(data.user_role || null);

          // If we got fewer routes than the limit, we've reached the last page
          if (pageRoutes.length < limit) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
        } else {
          console.error('Failed to fetch routes:', data);
          setError(data.error || 'Failed to fetch routes');
          showToast.error(data.error || 'Failed to fetch routes');
          hasMorePages = false;
        }
      }

      console.log('Total routes fetched:', allRoutes.length);
      setRoutes(allRoutes);
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while fetching routes';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics from routes data
  const fetchStatistics = useCallback(async () => {
    if (routes.length > 0) {
      const activeRoutes = routes.filter(route => route.is_active);
      const totalDistance = routes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
      const totalDuration = routes.reduce((sum, route) => sum + (route.estimated_duration || 0), 0);
      
      const stats = {
        totalRoutes: routes.length,
        activeRoutes: activeRoutes.length,
        inactiveRoutes: routes.length - activeRoutes.length,
        averageDistance: routes.length > 0 ? totalDistance / routes.length : 0,
        averageDuration: routes.length > 0 ? totalDuration / routes.length : 0,
        totalDistance,
      };
      setStatistics(stats);
    }
  }, [routes]);

  // Create a new route (Admin only)
  const createRoute = useCallback(async (routeData: CreateRouteRequest) => {
    try {
      const response = await fetch('/dashboard/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(routeData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Route created successfully');
        await fetchRoutes(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to create route');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating route';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchRoutes]);

  // Update a route (Admin only)
  const updateRoute = useCallback(async (id: string, routeData: UpdateRouteRequest) => {
    try {
      const response = await fetch(`/dashboard/api/routes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(routeData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Route updated successfully');
        await fetchRoutes(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to update route');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating route';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchRoutes]);

  // Delete a route (Admin only)
  const deleteRoute = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/dashboard/api/routes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Route deleted successfully');
        await fetchRoutes(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to delete route');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while deleting route';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchRoutes]);

  // Toggle route status (Admin only)
  const toggleRouteStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/dashboard/api/routes/${id}/toggle-status`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Route status updated successfully');
        await fetchRoutes(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to update route status');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating route status';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchRoutes]);

  // Get route by ID
  const getRoute = useCallback(async (id: string): Promise<RouteData | null> => {
    try {
      const response = await fetch(`/dashboard/api/routes/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        showToast.error(data.error || 'Failed to fetch route');
        return null;
      }
    } catch (err) {
      showToast.error('An unexpected error occurred while fetching route');
      return null;
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchRoutes();
  }, [fetchRoutes]);

  // Calculate statistics when routes change
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Initial fetch
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return {
    routes,
    statistics,
    userRole,
    loading,
    error,
    fetchRoutes,
    fetchStatistics,
    createRoute,
    updateRoute,
    deleteRoute,
    toggleRouteStatus,
    getRoute,
    refreshData,
  };
}
