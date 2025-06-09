"use client"

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { showToast } from '@/lib/toast';

// Updated interface to match backend API response
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

interface UseBusManagementReturn {
  // Data
  busses: BusData[];
  statistics: {
    totalBusses: number;
    operationalBusses: number;
    maintenanceBusses: number;
    idleBusses: number;
    breakdownBusses: number;
  } | null;
  userRole: string | null;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBusses: (params?: { search?: string; filter_by?: string; status?: string; pn?: string; ps?: string }) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createBus: (busData: CreateBusRequest) => Promise<{ success: boolean; message?: string }>;
  updateBus: (id: string, busData: UpdateBusRequest) => Promise<{ success: boolean; message?: string }>;
  deleteBus: (id: string) => Promise<{ success: boolean; message?: string }>;
  toggleBusStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
  getBus: (id: string) => Promise<BusData | null>;
  refreshData: () => Promise<void>;
}

export function useBusManagementAPI(): UseBusManagementReturn {
  const [busses, setBusses] = useState<BusData[]>([]);
  const [statistics, setStatistics] = useState<{
    totalBusses: number;
    operationalBusses: number;
    maintenanceBusses: number;
    idleBusses: number;
    breakdownBusses: number;
  } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all busses
  const fetchBusses = useCallback(async (params?: { search?: string; filter_by?: string; status?: string; pn?: string; ps?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.filter_by) queryParams.append('filter_by', params.filter_by);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.pn) queryParams.append('pn', params.pn);
      if (params?.ps) queryParams.append('ps', params.ps);

      const url = `/dashboard/api/busses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setBusses(data.data || []);
        setUserRole(data.user_role || null);
      } else {
        setError(data.error || 'Failed to fetch busses');
        showToast.error(data.error || 'Failed to fetch busses');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while fetching busses';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics from busses data
  const fetchStatistics = useCallback(async () => {
    if (busses.length > 0) {
      const stats = {
        totalBusses: busses.length,
        operationalBusses: busses.filter(bus => bus.bus_status === 'OPERATIONAL').length,
        maintenanceBusses: busses.filter(bus => bus.bus_status === 'MAINTENANCE').length,
        idleBusses: busses.filter(bus => bus.bus_status === 'IDLE').length,
        breakdownBusses: busses.filter(bus => bus.bus_status === 'BREAKDOWN').length,
      };
      setStatistics(stats);
    }
  }, [busses]);

  // Create a new bus (Admin only)
  const createBus = useCallback(async (busData: CreateBusRequest) => {
    try {
      const response = await fetch('/dashboard/api/busses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Bus created successfully');
        await fetchBusses(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to create bus');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating bus';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusses]);

  // Update a bus (Admin only)
  const updateBus = useCallback(async (id: string, busData: UpdateBusRequest) => {
    try {
      const response = await fetch(`/dashboard/api/busses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(busData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Bus updated successfully');
        await fetchBusses(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to update bus');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating bus';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusses]);

  // Delete a bus (Admin only)
  const deleteBus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/dashboard/api/busses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Bus deleted successfully');
        await fetchBusses(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to delete bus');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while deleting bus';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusses]);

  // Toggle bus status (Admin only)
  const toggleBusStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/dashboard/api/busses/${id}/toggle-status`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message || 'Bus status updated successfully');
        await fetchBusses(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(data.error || 'Failed to update bus status');
        return { success: false, message: data.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating bus status';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchBusses]);

  // Get bus by ID
  const getBus = useCallback(async (id: string): Promise<BusData | null> => {
    try {
      const response = await fetch(`/dashboard/api/busses/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        showToast.error(data.error || 'Failed to fetch bus');
        return null;
      }
    } catch (err) {
      showToast.error('An unexpected error occurred while fetching bus');
      return null;
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchBusses();
  }, [fetchBusses]);

  // Calculate statistics when busses change
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Initial fetch
  useEffect(() => {
    fetchBusses();
  }, [fetchBusses]);

  return {
    busses,
    statistics,
    userRole,
    loading,
    error,
    fetchBusses,
    fetchStatistics,
    createBus,
    updateBus,
    deleteBus,
    toggleBusStatus,
    getBus,
    refreshData,
  };
}
