"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppNotification, NotificationContextType, NotificationState, NotificationSocketMessage } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { RealTimeSocketService } from '@/utils/socket';
import { showToast } from '@/lib/toast';

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Action types
type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.is_read).length,
        isLoading: false,
        error: null,
      };
    
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.is_read).length,
      };
    
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, is_read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.is_read).length,
      };
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, is_read: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };
    
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.is_read).length,
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    
    default:
      return state;
  }
}

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [isClient, setIsClient] = React.useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    // Only fetch on client side
    if (typeof window === 'undefined') {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await notificationService.fetchNotifications();

      if (result.error) {
        console.warn('Notification fetch error:', result.error);
        // Don't show error for authentication issues - just use empty array
        if (result.error.includes('log in')) {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        } else {
          dispatch({ type: 'SET_ERROR', payload: result.error });
        }
      } else {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: result.notifications });
      }
    } catch (error) {
      console.error('Notification fetch error:', error);
      // Don't show error to user - just use empty array
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Add new notification
  const addNotification = useCallback((notification: AppNotification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Show toast notification for immediate feedback
    const priority = notification.related_entity?.priority || 'NORMAL';
    const isHighPriority = priority === 'HIGH' || 
                          notification.notification_type === 'INCIDENT_REPORTED' ||
                          notification.notification_type === 'SERVICE_ALERT';
    
    if (isHighPriority) {
      showToast.error(notification.title, notification.message);
    } else {
      showToast.info(notification.title, notification.message);
    }

    // Desktop notifications removed - using only in-app notifications
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Optionally revert the optimistic update
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Optionally revert the optimistic update
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback(async (notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
    
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Optionally revert the optimistic update
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Set up WebSocket listener for real-time notifications
  useEffect(() => {
    if (!isClient) return;

    console.log('🔔 Setting up notification WebSocket listeners');
    const socket = RealTimeSocketService.getInstance();

    const handleNotification = (message: NotificationSocketMessage) => {
      console.log('📢 Received notification via WebSocket:', {
        type: message.type,
        notification: {
          id: message.notification?.id,
          title: message.notification?.title,
          type: message.notification?.notification_type,
          timestamp: message.notification?.timestamp
        }
      });

      if (message.notification) {
        addNotification(message.notification);
      } else {
        console.warn('📢 Received notification message without notification data:', message);
      }
    };

    const handleConnect = () => {
      console.log('🔔 Socket connected successfully, subscribing to notifications');

      // Wait a moment for the connection to stabilize, then subscribe
      setTimeout(() => {
        socket.subscribeToNotifications();
        console.log('🔔 Notification subscription request sent');
      }, 1000);
    };

    const handleDisconnect = (data: any) => {
      console.log('🔔 Socket disconnected:', {
        reason: data?.reason,
        code: data?.code,
        wasClean: data?.wasClean
      });
      // Don't show error to user for normal disconnections
    };

    const handleError = (error: any) => {
      console.warn('🔔 Socket error occurred:', {
        message: error?.message,
        type: error?.type,
        timestamp: error?.timestamp
      });
      // Don't show error to user - the system will try to reconnect
    };

    // Register event listeners
    socket.on('notification', handleNotification);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    // Try to connect if not already connected
    if (!socket.isConnected()) {
      console.log('🔔 Socket not connected, attempting to connect...');
      socket.connect().catch(err => {
        console.warn('🔔 Failed to connect socket for notifications:', err);
      });
    } else {
      console.log('🔔 Socket already connected, subscribing to notifications');
      socket.subscribeToNotifications();
    }

    // Initial fetch of notifications
    fetchNotifications();

    return () => {
      console.log('🔔 Cleaning up notification listeners');
      socket.off('notification', handleNotification);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, [isClient, addNotification, fetchNotifications]);

  // Health check effect - periodically verify connection
  useEffect(() => {
    if (!isClient) return;

    const healthCheckInterval = setInterval(() => {
      const socket = RealTimeSocketService.getInstance();

      if (!socket.isConnected() && !socket.isConnecting()) {
        console.log('🔔 Health check: Socket disconnected, attempting to reconnect...');
        socket.connect().catch(err => {
          console.warn('🔔 Health check reconnection failed:', err);
        });
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [isClient]);

  const contextValue: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
