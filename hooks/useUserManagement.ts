import { useState, useEffect, useCallback } from 'react';
import { userService, type User, type CreateUserRequest, type UpdateUserRequest } from '@/services/userService';

interface UseUserManagementReturn {
  // Data
  users: User[];
  drivers: User[];
  queueRegulators: User[];
  controlStaff: User[];
  
  // Loading states
  loading: boolean;
  driversLoading: boolean;
  queueRegulatorsLoading: boolean;
  controlStaffLoading: boolean;
  
  // Error states
  error: string | null;
  driversError: string | null;
  queueRegulatorsError: string | null;
  controlStaffError: string | null;
  
  // Actions
  fetchUsers: (params?: { role?: string; search?: string; is_active?: boolean }) => Promise<void>;
  fetchDrivers: (params?: { search?: string; is_active?: boolean }) => Promise<void>;
  fetchQueueRegulators: (params?: { search?: string; is_active?: boolean }) => Promise<void>;
  fetchControlStaff: (params?: { search?: string; is_active?: boolean }) => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<{ success: boolean; data?: User; message?: string }>;
  updateUser: (id: string, userData: UpdateUserRequest) => Promise<{ success: boolean; data?: User; message?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (id: string) => Promise<{ success: boolean; newPassword?: string; message?: string }>;
  toggleStatus: (id: string) => Promise<{ success: boolean; data?: User; message?: string }>;
  refreshData: () => Promise<void>;
}

export function useUserManagement(): UseUserManagementReturn {
  // State for all users
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for drivers
  const [drivers, setDrivers] = useState<User[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driversError, setDriversError] = useState<string | null>(null);

  // State for queue regulators
  const [queueRegulators, setQueueRegulators] = useState<User[]>([]);
  const [queueRegulatorsLoading, setQueueRegulatorsLoading] = useState(false);
  const [queueRegulatorsError, setQueueRegulatorsError] = useState<string | null>(null);

  // State for control staff
  const [controlStaff, setControlStaff] = useState<User[]>([]);
  const [controlStaffLoading, setControlStaffLoading] = useState(false);
  const [controlStaffError, setControlStaffError] = useState<string | null>(null);

  // Fetch users with optional role filter
  const fetchUsers = useCallback(async (params?: { role?: string; search?: string; is_active?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers(params);
      if (response.success && response.data) {
        setUsers(response.data.users || response.data);
      } else {
        setError(response.message || 'Failed to fetch users');
        console.log('Failed to fetch users, using empty array');
        setUsers([]);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch drivers
  const fetchDrivers = useCallback(async (params?: { search?: string; is_active?: boolean }) => {
    setDriversLoading(true);
    setDriversError(null);

    try {
      const response = await userService.getUsers({ role: 'BUS_DRIVER', ...params });
      if (response.success && response.data) {
        setDrivers(response.data.users || response.data);
      } else {
        setDriversError(response.message || 'Failed to fetch drivers');
        console.log('Failed to fetch drivers, using empty array');
        setDrivers([]);
      }
    } catch (err) {
      setDriversError('An unexpected error occurred');
    } finally {
      setDriversLoading(false);
    }
  }, []);

  // Fetch queue regulators
  const fetchQueueRegulators = useCallback(async () => {
    setQueueRegulatorsLoading(true);
    setQueueRegulatorsError(null);
    
    try {
      const response = await userService.getQueueRegulators();
      if (response.success && response.data) {
        setQueueRegulators(response.data);
      } else {
        setQueueRegulatorsError(response.message || 'Failed to fetch queue regulators');
        console.log('Failed to fetch queue regulators, using empty array');
        setQueueRegulators([]);
      }
    } catch (err) {
      setQueueRegulatorsError('An unexpected error occurred');
    } finally {
      setQueueRegulatorsLoading(false);
    }
  }, []);

  // Fetch control staff
  const fetchControlStaff = useCallback(async () => {
    setControlStaffLoading(true);
    setControlStaffError(null);
    
    try {
      const response = await userService.getControlStaff();
      if (response.success && response.data) {
        setControlStaff(response.data);
      } else {
        setControlStaffError(response.message || 'Failed to fetch control staff');
        console.log('Failed to fetch control staff, using empty array');
        setControlStaff([]);
      }
    } catch (err) {
      setControlStaffError('An unexpected error occurred');
    } finally {
      setControlStaffLoading(false);
    }
  }, []);

  // Create user
  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      const response = await userService.createUser(userData);
      if (response.success) {
        // Refresh the appropriate data based on role
        if (userData.role === 'BUS_DRIVER') {
          await fetchDrivers();
        } else if (userData.role === 'QUEUE_REGULATOR') {
          await fetchQueueRegulators();
        } else if (userData.role === 'CONTROL_STAFF') {
          await fetchControlStaff();
        }
        await fetchUsers(); // Also refresh all users
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, [fetchUsers, fetchDrivers, fetchQueueRegulators, fetchControlStaff]);

  // Update user
  const updateUser = useCallback(async (id: string, userData: UpdateUserRequest) => {
    try {
      const response = await userService.updateUser(id, userData);
      if (response.success) {
        // Refresh all data to ensure consistency
        await refreshData();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: string) => {
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        // Refresh all data
        await refreshData();
      }
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (id: string) => {
    try {
      const response = await userService.resetUserPassword(id);
      return response;
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }, []);

  // Toggle status
  const toggleStatus = useCallback(async (id: string) => {
    try {
      const response = await userService.toggleUserStatus(id);
      if (response.success) {
        // Refresh all data
        await refreshData();
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
      fetchUsers(),
      fetchDrivers(),
      fetchQueueRegulators(),
      fetchControlStaff(),
    ]);
  }, [fetchUsers, fetchDrivers, fetchQueueRegulators, fetchControlStaff]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Data
    users,
    drivers,
    queueRegulators,
    controlStaff,
    
    // Loading states
    loading,
    driversLoading,
    queueRegulatorsLoading,
    controlStaffLoading,
    
    // Error states
    error,
    driversError,
    queueRegulatorsError,
    controlStaffError,
    
    // Actions
    fetchUsers,
    fetchDrivers,
    fetchQueueRegulators,
    fetchControlStaff,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    toggleStatus,
    refreshData,
  };
}
