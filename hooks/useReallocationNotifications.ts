'use client';

import { useEffect, useCallback } from 'react';
import { RealTimeSocketService } from '@/utils/socket';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { AppNotification } from '@/types/notification';

export function useReallocationNotifications() {
  const { addNotification } = useNotifications();

  const handleReallocationNotification = useCallback((data: any) => {
    console.log('🔄 Received reallocation notification:', data);
    
    if (data.notification) {
      const notification: AppNotification = {
        id: data.notification.id || `realloc_${Date.now()}`,
        title: data.notification.title,
        message: data.notification.message,
        notification_type: data.notification.notification_type,
        related_entity: data.notification.related_entity,
        timestamp: data.notification.timestamp || new Date().toISOString(),
        is_read: false
      };

      addNotification(notification);

      // Show browser notification for high priority reallocation events
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: `reallocation_${notification.id}`,
          });

          // Auto-close after 5 seconds
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }
      }
    }
  }, [addNotification]);

  useEffect(() => {
    const socket = RealTimeSocketService.getInstance();

    // Listen for reallocation-specific notifications
    socket.on('notification', (data: any) => {
      if (data.notification && [
        'REALLOCATION_REQUEST_SUBMITTED',
        'REALLOCATION_REQUEST_APPROVED',
        'REALLOCATION_REQUEST_DISCARDED',
        'ROUTE_REALLOCATION'
      ].includes(data.notification.notification_type)) {
        handleReallocationNotification(data);
      }
    });

    return () => {
      // Clean up listeners
      socket.off('notification', handleReallocationNotification);
    };
  }, [handleReallocationNotification]);

  // Function to manually send a reallocation request notification (for testing)
  const sendTestReallocationRequest = useCallback(() => {
    const socket = RealTimeSocketService.getInstance();
    socket.sendReallocationRequestNotification({
      request_id: `test_${Date.now()}`,
      bus_id: 'BUS_001',
      current_route_id: 'ROUTE_A',
      requesting_regulator_id: 'REG_001',
      reason: 'High passenger demand',
      priority: 'HIGH'
    });
  }, []);

  // Function to manually send a reallocation approval notification (for testing)
  const sendTestReallocationApproval = useCallback(() => {
    const socket = RealTimeSocketService.getInstance();
    socket.sendReallocationApprovalNotification({
      request_id: `test_${Date.now()}`,
      bus_id: 'BUS_001',
      old_route_id: 'ROUTE_A',
      new_route_id: 'ROUTE_B',
      approved_by: 'ADMIN_001'
    });
  }, []);

  // Function to manually send a reallocation discard notification (for testing)
  const sendTestReallocationDiscard = useCallback(() => {
    const socket = RealTimeSocketService.getInstance();
    socket.sendReallocationDiscardNotification({
      request_id: `test_${Date.now()}`,
      bus_id: 'BUS_001',
      reason: 'No available buses on target route',
      discarded_by: 'ADMIN_001'
    });
  }, []);

  // Function to manually send a route reallocation notification (for testing)
  const sendTestRouteReallocation = useCallback(() => {
    const socket = RealTimeSocketService.getInstance();
    socket.sendRouteReallocationNotification({
      bus_id: 'BUS_001',
      old_route_id: 'ROUTE_A',
      new_route_id: 'ROUTE_B',
      reallocated_by: 'ADMIN_001'
    });
  }, []);

  return {
    sendTestReallocationRequest,
    sendTestReallocationApproval,
    sendTestReallocationDiscard,
    sendTestRouteReallocation
  };
}
