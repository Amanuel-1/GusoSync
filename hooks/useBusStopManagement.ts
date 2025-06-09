import { useState, useCallback, useEffect } from 'react';
import { BusStop, BusStopWithIncomingBuses, IncomingBus, CreateBusStopRequest, UpdateBusStopRequest } from '@/types/busStop';
import { busStopService } from '@/services/busStopService';
import { showToast } from '@/components/ui/toast';

interface UseBusStopManagementReturn {
  // Data
  busStops: BusStop[];
  busStopsWithIncoming: BusStopWithIncomingBuses[];
  
  // Loading states
  loading: boolean;
  incomingLoading: boolean;
  
  // Error states
  error: string | null;
  incomingError: string | null;
  
  // Actions
  fetchBusStops: () => Promise<void>;
  fetchBusStopsWithIncoming: () => Promise<void>;
  getBusStop: (id: string) => Promise<BusStop | null>;
  getIncomingBuses: (busStopId: string) => Promise<IncomingBus[]>;
  createBusStop: (busStopData: CreateBusStopRequest) => Promise<{ success: boolean; message?: string }>;
  updateBusStop: (id: string, busStopData: UpdateBusStopRequest) => Promise<{ success: boolean; message?: string }>;
  deleteBusStop: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
}

export function useBusStopManagement(): UseBusStopManagementReturn {
  // State for bus stops
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [busStopsWithIncoming, setBusStopsWithIncoming] = useState<BusStopWithIncomingBuses[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [incomingLoading, setIncomingLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [incomingError, setIncomingError] = useState<string | null>(null);

  // Fetch bus stops
  const fetchBusStops = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await busStopService.getBusStops();
      if (response.success) {
        setBusStops(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch bus stops');
        setBusStops([]);
      }
    } catch (err) {
      console.error('Error fetching bus stops:', err);
      setError('Failed to connect to backend');
      setBusStops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bus stops with incoming buses
  const fetchBusStopsWithIncoming = useCallback(async () => {
    setIncomingLoading(true);
    setIncomingError(null);
    
    try {
      const response = await busStopService.getBusStopsWithIncomingBuses();
      if (response.success) {
        setBusStopsWithIncoming(response.data || []);
      } else {
        setIncomingError(response.message || 'Failed to fetch bus stops with incoming buses');
        setBusStopsWithIncoming([]);
      }
    } catch (err) {
      console.error('Error fetching bus stops with incoming buses:', err);
      setIncomingError('Failed to connect to backend');
      setBusStopsWithIncoming([]);
    } finally {
      setIncomingLoading(false);
    }
  }, []);

  // Get specific bus stop
  const getBusStop = useCallback(async (id: string): Promise<BusStop | null> => {
    try {
      const response = await busStopService.getBusStop(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        showToast.error('Error', response.message || 'Failed to fetch bus stop');
        return null;
      }
    } catch (err) {
      showToast.error('Error', 'An unexpected error occurred');
      return null;
    }
  }, []);

  // Get incoming buses for a specific bus stop
  const getIncomingBuses = useCallback(async (busStopId: string): Promise<IncomingBus[]> => {
    try {
      const response = await busStopService.getIncomingBuses(busStopId);
      if (response.success && response.data) {
        return response.data;
      } else {
        showToast.error('Error', response.message || 'Failed to fetch incoming buses');
        return [];
      }
    } catch (err) {
      showToast.error('Error', 'An unexpected error occurred');
      return [];
    }
  }, []);

  // Create bus stop
  const createBusStop = useCallback(async (busStopData: CreateBusStopRequest) => {
    try {
      const response = await busStopService.createBusStop(busStopData);
      if (response.success) {
        // Refresh bus stops list
        await fetchBusStops();
        await fetchBusStopsWithIncoming();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, [fetchBusStops, fetchBusStopsWithIncoming]);

  // Update bus stop
  const updateBusStop = useCallback(async (id: string, busStopData: UpdateBusStopRequest) => {
    try {
      const response = await busStopService.updateBusStop(id, busStopData);
      if (response.success) {
        // Update local state
        setBusStops(prev => 
          prev.map(busStop => 
            busStop.id === id ? { ...busStop, ...busStopData, updated_at: new Date().toISOString() } : busStop
          )
        );
        setBusStopsWithIncoming(prev => 
          prev.map(busStop => 
            busStop.id === id ? { ...busStop, ...busStopData, updated_at: new Date().toISOString() } : busStop
          )
        );
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, []);

  // Delete bus stop
  const deleteBusStop = useCallback(async (id: string) => {
    try {
      const response = await busStopService.deleteBusStop(id);
      if (response.success) {
        // Remove from local state
        setBusStops(prev => prev.filter(busStop => busStop.id !== id));
        setBusStopsWithIncoming(prev => prev.filter(busStop => busStop.id !== id));
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchBusStops(),
      fetchBusStopsWithIncoming(),
    ]);
  }, [fetchBusStops, fetchBusStopsWithIncoming]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Data
    busStops,
    busStopsWithIncoming,
    
    // Loading states
    loading,
    incomingLoading,
    
    // Error states
    error,
    incomingError,
    
    // Actions
    fetchBusStops,
    fetchBusStopsWithIncoming,
    getBusStop,
    getIncomingBuses,
    createBusStop,
    updateBusStop,
    deleteBusStop,
    refreshData,
  };
}
