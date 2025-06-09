import { useState, useEffect, useCallback } from 'react';
import { routeService, type BusRoute, type CreateRouteRequest, type UpdateRouteRequest } from '@/services/routeService';

interface UseRouteManagementReturn {
  // Data
  routes: BusRoute[];
  statistics: {
    totalRoutes: number;
    activeRoutes: number;
    inactiveRoutes: number;
    averageDistance: number;
    averageDuration: number;
    totalDistance: number;
  } | null;
  
  // Loading states
  loading: boolean;
  statisticsLoading: boolean;
  
  // Error states
  error: string | null;
  statisticsError: string | null;
  
  // Actions
  fetchRoutes: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createRoute: (routeData: CreateRouteRequest) => Promise<{ success: boolean; message?: string }>;
  updateRoute: (id: string, routeData: UpdateRouteRequest) => Promise<{ success: boolean; message?: string }>;
  deleteRoute: (id: string) => Promise<{ success: boolean; message?: string }>;
  toggleRouteStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
}

export function useRouteManagement(): UseRouteManagementReturn {
  // State for routes
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for statistics
  const [statistics, setStatistics] = useState<{
    totalRoutes: number;
    activeRoutes: number;
    inactiveRoutes: number;
    averageDistance: number;
    averageDuration: number;
    totalDistance: number;
  } | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);

  // Fetch routes
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await routeService.getRoutes();
      if (response.success) {
        setRoutes(response.data || []);

        // Check if this is a backend limitation
        if (response.backend_limitation) {
          showToast.warning('Limited Access', response.message || 'Backend API restricts route viewing to administrators only.');
        }
      } else {
        setError(response.message || 'Failed to fetch routes');
        setRoutes([]);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to connect to backend');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    setStatisticsError(null);
    
    try {
      const response = await routeService.getRouteStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        setStatisticsError(response.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setStatisticsError('An unexpected error occurred');
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Create route
  const createRoute = useCallback(async (routeData: CreateRouteRequest) => {
    try {
      const response = await routeService.createRoute(routeData);
      if (response.success) {
        // Refresh routes list
        await fetchRoutes();
        // Refresh statistics
        await fetchStatistics();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, [fetchRoutes, fetchStatistics]);

  // Update route
  const updateRoute = useCallback(async (id: string, routeData: UpdateRouteRequest) => {
    try {
      const response = await routeService.updateRoute(id, routeData);
      if (response.success) {
        // Update local state
        setRoutes(prev => 
          prev.map(route => 
            route._id === id ? { ...route, ...routeData, updated_at: new Date().toISOString() } : route
          )
        );
        // Refresh statistics
        await fetchStatistics();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, [fetchStatistics]);

  // Delete route
  const deleteRoute = useCallback(async (id: string) => {
    try {
      const response = await routeService.deleteRoute(id);
      if (response.success) {
        // Remove from local state
        setRoutes(prev => prev.filter(route => route._id !== id));
        // Refresh statistics
        await fetchStatistics();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, [fetchStatistics]);

  // Toggle route status
  const toggleRouteStatus = useCallback(async (id: string) => {
    try {
      const response = await routeService.toggleRouteStatus(id);
      if (response.success) {
        // Update local state
        setRoutes(prev => 
          prev.map(route => 
            route._id === id ? { ...route, is_active: !route.is_active, updated_at: new Date().toISOString() } : route
          )
        );
        // Refresh statistics
        await fetchStatistics();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, [fetchStatistics]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchRoutes(),
      fetchStatistics(),
    ]);
  }, [fetchRoutes, fetchStatistics]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Data
    routes,
    statistics,
    
    // Loading states
    loading,
    statisticsLoading,
    
    // Error states
    error,
    statisticsError,
    
    // Actions
    fetchRoutes,
    fetchStatistics,
    createRoute,
    updateRoute,
    deleteRoute,
    toggleRouteStatus,
    refreshData,
  };
}
