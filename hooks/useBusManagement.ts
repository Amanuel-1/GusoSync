"use client"

import { useState, useEffect } from 'react';
import { busService, type BusData, type CreateBusRequest, type UpdateBusRequest } from '@/services/busService';
import { showToast } from '@/lib/toast';

export function useBusManagement() {
  const [busses, setBusses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all busses
  const fetchBusses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await busService.getBusses();
      
      if (result.success && result.data) {
        setBusses(result.data);
      } else {
        setError(result.message || 'Failed to fetch busses');
        showToast.error(result.message || 'Failed to fetch busses');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while fetching busses';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new bus (Not supported)
  const createBus = async (busData: CreateBusRequest) => {
    showToast.error('Bus creation is not supported. Buses are managed by the system administrator.');
    return { success: false, message: 'Bus creation is not supported' };
  };

  // Update a bus
  const updateBus = async (id: string, busData: UpdateBusRequest) => {
    try {
      const result = await busService.updateBus(id, busData);
      
      if (result.success) {
        showToast.success(result.message || 'Bus updated successfully');
        await fetchBusses(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(result.message || 'Failed to update bus');
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating bus';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Delete a bus (Not supported)
  const deleteBus = async (id: string) => {
    showToast.error('Bus deletion is not supported. Buses are managed by the system administrator.');
    return { success: false, message: 'Bus deletion is not supported' };
  };

  // Toggle bus status
  const toggleBusStatus = async (id: string) => {
    try {
      const result = await busService.toggleBusStatus(id);
      
      if (result.success) {
        showToast.success(result.message || 'Bus status updated successfully');
        await fetchBusses(); // Refresh the list
        return { success: true };
      } else {
        showToast.error(result.message || 'Failed to update bus status');
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating bus status';
      showToast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Get bus by ID
  const getBus = async (id: string): Promise<BusData | null> => {
    try {
      const result = await busService.getBus(id);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        showToast.error(result.message || 'Failed to fetch bus');
        return null;
      }
    } catch (err) {
      showToast.error('An unexpected error occurred while fetching bus');
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBusses();
  }, []);

  return {
    busses,
    loading,
    error,
    fetchBusses,
    createBus,
    updateBus,
    deleteBus,
    toggleBusStatus,
    getBus,
  };
}
