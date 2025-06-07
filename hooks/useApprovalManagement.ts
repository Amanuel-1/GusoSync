import { useState, useEffect, useCallback } from 'react';
import { approvalService, type PendingRegistration } from '@/services/approvalService';

interface UseApprovalManagementReturn {
  // Data
  pendingRegistrations: PendingRegistration[];
  statistics: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    pendingByRole: Record<string, number>;
  } | null;
  
  // Loading states
  loading: boolean;
  statisticsLoading: boolean;
  
  // Error states
  error: string | null;
  statisticsError: string | null;
  
  // Actions
  fetchPendingRegistrations: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  approveRegistration: (registrationId: string, userData: any) => Promise<{ success: boolean; message?: string }>;
  rejectRegistration: (registrationId: string) => Promise<{ success: boolean; message?: string }>;
  updatePendingRegistration: (registrationId: string, updates: Partial<PendingRegistration>) => Promise<{ success: boolean; message?: string }>;
  deletePendingRegistration: (registrationId: string) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
}

export function useApprovalManagement(): UseApprovalManagementReturn {
  // State for pending registrations
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for statistics
  const [statistics, setStatistics] = useState<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    pendingByRole: Record<string, number>;
  } | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);

  // Fetch pending registrations
  const fetchPendingRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await approvalService.getPendingRegistrations();
      if (response.success && response.data) {
        setPendingRegistrations(response.data);
      } else {
        setError(response.message || 'Failed to fetch pending registrations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    setStatisticsError(null);
    
    try {
      const response = await approvalService.getApprovalStatistics();
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

  // Approve registration
  const approveRegistration = useCallback(async (registrationId: string, userData: any) => {
    try {
      const response = await approvalService.approveRegistration(registrationId, userData);
      if (response.success) {
        // Remove from pending list
        setPendingRegistrations(prev => prev.filter(r => r.id !== registrationId));
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

  // Reject registration
  const rejectRegistration = useCallback(async (registrationId: string) => {
    try {
      const response = await approvalService.rejectRegistration(registrationId);
      if (response.success) {
        // Remove from pending list
        setPendingRegistrations(prev => prev.filter(r => r.id !== registrationId));
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

  // Update pending registration
  const updatePendingRegistration = useCallback(async (registrationId: string, updates: Partial<PendingRegistration>) => {
    try {
      const response = await approvalService.updatePendingRegistration(registrationId, updates);
      if (response.success) {
        // Update in local state
        setPendingRegistrations(prev => 
          prev.map(r => r.id === registrationId ? { ...r, ...updates } : r)
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

  // Delete pending registration
  const deletePendingRegistration = useCallback(async (registrationId: string) => {
    try {
      const response = await approvalService.deletePendingRegistration(registrationId);
      if (response.success) {
        // Remove from pending list
        setPendingRegistrations(prev => prev.filter(r => r.id !== registrationId));
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
      fetchPendingRegistrations(),
      fetchStatistics(),
    ]);
  }, [fetchPendingRegistrations, fetchStatistics]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Data
    pendingRegistrations,
    statistics,
    
    // Loading states
    loading,
    statisticsLoading,
    
    // Error states
    error,
    statisticsError,
    
    // Actions
    fetchPendingRegistrations,
    fetchStatistics,
    approveRegistration,
    rejectRegistration,
    updatePendingRegistration,
    deletePendingRegistration,
    refreshData,
  };
}
