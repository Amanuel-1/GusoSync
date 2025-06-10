import { useState, useCallback, useEffect } from 'react';
import { BusStop, CreateBusStopRequest, UpdateBusStopRequest } from '@/types/busStop';
import { showToast } from '@/lib/toast';

interface UseBusStopManagementReturn {
  // Data
  busStops: BusStop[];
  userRole: string | null;

  // Loading states
  loading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchBusStops: () => Promise<void>;
  getBusStop: (id: string) => Promise<BusStop | null>;
  createBusStop: (busStopData: CreateBusStopRequest) => Promise<{ success: boolean; message?: string }>;
  updateBusStop: (id: string, busStopData: UpdateBusStopRequest) => Promise<{ success: boolean; message?: string }>;
  deleteBusStop: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
}

export function useBusStopManagement(): UseBusStopManagementReturn {
  // State for bus stops
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Fetch bus stops
  const fetchBusStops = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bus-stops', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setBusStops(data.data || []);
        setUserRole(data.user_role || null);
      } else {
        setError(data.error || 'Failed to fetch bus stops');
        showToast.error(data.error || 'Failed to fetch bus stops');
        setBusStops([]);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while fetching bus stops';
      setError(errorMessage);
      showToast.error(errorMessage);
      setBusStops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get specific bus stop
  const getBusStop = useCallback(async (id: string): Promise<BusStop | null> => {
    try {
      const response = await fetch(`/api/bus-stops/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        showToast.error(data.error || 'Failed to fetch bus stop');
        return null;
      }
    } catch (err) {
      showToast.error('An unexpected error occurred while fetching bus stop');
      return null;
    }
  }, []);

  // Create bus stop (Admin only)
  const createBusStop = useCallback(async (busStopData: CreateBusStopRequest) => {
    try {
      const response = await fetch('/api/bus-stops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busStopData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Bus stop created successfully');
        await fetchBusStops(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to create bus stop');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating bus stop';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusStops]);

  // Update bus stop (Admin only)
  const updateBusStop = useCallback(async (id: string, busStopData: UpdateBusStopRequest) => {
    try {
      const response = await fetch(`/api/bus-stops/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busStopData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Bus stop updated successfully');
        await fetchBusStops(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to update bus stop');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating bus stop';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusStops]);

  // Delete bus stop (Admin only)
  const deleteBusStop = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/bus-stops/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Bus stop deleted successfully');
        await fetchBusStops(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to delete bus stop');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while deleting bus stop';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusStops]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchBusStops();
  }, [fetchBusStops]);

  // Initial data fetch
  useEffect(() => {
    fetchBusStops();
  }, [fetchBusStops]);

  return {
    // Data
    busStops,
    userRole,

    // Loading states
    loading,

    // Error states
    error,

    // Actions
    fetchBusStops,
    getBusStop,
    createBusStop,
    updateBusStop,
    deleteBusStop,
    refreshData,
  };
}
