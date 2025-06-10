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
  approveRegistration: (registrationId: string, userData?: any, reviewNotes?: string) => Promise<{ success: boolean; message?: string }>;
  rejectRegistration: (registrationId: string, reviewNotes?: string) => Promise<{ success: boolean; message?: string }>;
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
  const approveRegistration = useCallback(async (registrationId: string, userData?: any, reviewNotes?: string) => {
    try {
      const response = await approvalService.approveRegistration(registrationId, userData, reviewNotes);
      if (response.success) {
        // Update the registration status in local state instead of removing
        setPendingRegistrations(prev =>
          prev.map(r => r.id === registrationId
            ? { ...r, status: 'APPROVED' as const, reviewed_at: new Date().toISOString(), review_notes: reviewNotes || null }
            : r
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

  // Reject registration
  const rejectRegistration = useCallback(async (registrationId: string, reviewNotes?: string) => {
    try {
      const response = await approvalService.rejectRegistration(registrationId, reviewNotes);
      if (response.success) {
        // Update the registration status in local state instead of removing
        setPendingRegistrations(prev =>
          prev.map(r => r.id === registrationId
            ? { ...r, status: 'REJECTED' as const, reviewed_at: new Date().toISOString(), review_notes: reviewNotes || null }
            : r
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
    refreshData,
  };
}
