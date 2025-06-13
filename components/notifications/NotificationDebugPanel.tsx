"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationProvider';
import { RealTimeSocketService } from '@/utils/socket';
import { AppNotification, NotificationType } from '@/types/notification';

export function NotificationDebugPanel() {
  const { addNotification, notifications, unreadCount } = useNotifications();
  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    const socket = RealTimeSocketService.getInstance();

    const handleConnect = () => {
      setSocketStatus('connected');
      setLastError(null);
      addLog('✅ WebSocket connected successfully');
    };

    const handleDisconnect = (data: any) => {
      setSocketStatus('disconnected');
      addLog(`❌ WebSocket disconnected: ${data?.reason || 'Unknown reason'}`);
    };

    const handleError = (error: any) => {
      setLastError(error?.message || 'Unknown error');
      addLog(`🚨 WebSocket error: ${error?.message || 'Unknown error'}`);
    };

    const handleNotification = (message: any) => {
      addLog(`📢 Received notification: ${message?.notification?.title || 'Unknown'}`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);
    socket.on('notification', handleNotification);

    // Check initial connection status
    if (socket.isConnected()) {
      setSocketStatus('connected');
    } else if (socket.isConnecting()) {
      setSocketStatus('connecting');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      socket.off('notification', handleNotification);
    };
  }, []);

  const checkAuthToken = async () => {
    try {
      const response = await fetch('/api/auth/websocket-token', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token ? `${data.token.substring(0, 20)}...` : null);
        addLog('🔑 Auth token retrieved successfully');
      } else {
        setAuthToken(null);
        addLog(`🔑 Failed to get auth token: ${response.status}`);
      }
    } catch (error) {
      setAuthToken(null);
      addLog(`🔑 Auth token error: ${error}`);
    }
  };

  const forceReconnect = () => {
    addLog('🔄 Force reconnecting WebSocket...');
    setSocketStatus('connecting');
    const socket = RealTimeSocketService.getInstance();
    socket.forceReconnect().catch(err => {
      addLog(`🔄 Force reconnect failed: ${err}`);
    });
  };

  const sendWebSocketTest = () => {
    const socket = RealTimeSocketService.getInstance();
    if (socket.isConnected()) {
      const testData = {
        title: 'WebSocket Test Notification',
        message: 'This is a test notification sent via WebSocket',
        notification_type: 'GENERAL',
        target_roles: ['CONTROL_CENTER_ADMIN'],
        related_entity: {
          entity_type: 'test',
          priority: 'NORMAL'
        }
      };
      socket.sendTestNotification(testData);
      addLog('🧪 Sent WebSocket test notification');
    } else {
      addLog('❌ Cannot send WebSocket test - not connected');
    }
  };

  const sendRouteReallocationTest = () => {
    const socket = RealTimeSocketService.getInstance();
    if (socket.isConnected()) {
      // Send notification in the exact format specified
      socket.send('send_notification', {
        title: 'Route Reallocation',
        message: 'Your bus has been reallocated from Route A to Route B',
        notification_type: 'ROUTE_REALLOCATION',
        target_user_ids: ['user_123', 'user_456'],
        target_roles: ['BUS_DRIVER', 'QUEUE_REGULATOR'],
        related_entity: {
          entity_type: 'route_reallocation',
          bus_id: 'bus_123',
          old_route_id: 'route_001',
          new_route_id: 'route_002'
        }
      });
      addLog('🚌 Sent route reallocation test notification');
    } else {
      addLog('❌ Cannot send route reallocation test - not connected');
    }
  };

  const sendTripUpdateTest = () => {
    const socket = RealTimeSocketService.getInstance();
    if (socket.isConnected()) {
      socket.send('send_notification', {
        title: 'Trip Update',
        message: 'Bus 456 is running 10 minutes late due to traffic',
        notification_type: 'TRIP_UPDATE',
        target_roles: ['BUS_DRIVER', 'QUEUE_REGULATOR'],
        related_entity: {
          entity_type: 'trip_update',
          bus_id: 'bus_456',
          delay_minutes: 10,
          reason: 'traffic'
        }
      });
      addLog('🚍 Sent trip update test notification');
    } else {
      addLog('❌ Cannot send trip update test - not connected');
    }
  };

  const sendAlertTest = () => {
    const socket = RealTimeSocketService.getInstance();
    if (socket.isConnected()) {
      socket.send('send_notification', {
        title: 'System Alert',
        message: 'Emergency maintenance scheduled for Route C at 3:00 PM',
        notification_type: 'ALERT',
        target_roles: ['BUS_DRIVER', 'QUEUE_REGULATOR', 'CONTROL_ADMIN'],
        related_entity: {
          entity_type: 'alert',
          route_id: 'route_c',
          priority: 'HIGH'
        }
      });
      addLog('🔔 Sent alert test notification');
    } else {
      addLog('❌ Cannot send alert test - not connected');
    }
  };

  const subscribeToNotifications = () => {
    const socket = RealTimeSocketService.getInstance();
    if (socket.isConnected()) {
      socket.subscribeToNotifications();
      addLog('🔔 Manually triggered notification subscription');
    } else {
      addLog('❌ Cannot subscribe - WebSocket not connected');
    }
  };

  const testNotification = (type: NotificationType) => {
    const testNotifications: Record<NotificationType, Partial<AppNotification>> = {
      'ALERT': {
        title: 'Test Alert',
        message: 'This is a test alert notification',
        notification_type: 'ALERT',
        related_entity: {
          entity_type: 'alert',
          priority: 'HIGH'
        }
      },
      'ROUTE_REALLOCATION': {
        title: 'Test Route Reallocation',
        message: 'Bus 001 has been reallocated from Route A to Route B',
        notification_type: 'ROUTE_REALLOCATION',
        related_entity: {
          entity_type: 'route_reallocation',
          bus_id: 'bus_001',
          route_id: 'route_b',
          priority: 'HIGH'
        }
      },
      'REALLOCATION_REQUEST_SUBMITTED': {
        title: 'Test Reallocation Request',
        message: 'New reallocation request submitted for Bus 002',
        notification_type: 'REALLOCATION_REQUEST_SUBMITTED',
        related_entity: {
          entity_type: 'reallocation_request',
          request_id: 'req_123',
          bus_id: 'bus_002',
          priority: 'NORMAL'
        }
      },
      'INCIDENT_REPORTED': {
        title: 'Test Incident Report',
        message: 'New incident reported on Route C',
        notification_type: 'INCIDENT_REPORTED',
        related_entity: {
          entity_type: 'incident',
          incident_id: 'inc_456',
          priority: 'HIGH'
        }
      },
      'CHAT_MESSAGE': {
        title: 'Test Chat Message',
        message: 'New message in conversation',
        notification_type: 'CHAT_MESSAGE',
        related_entity: {
          entity_type: 'chat',
          chat_id: 'chat_789',
          message_id: 'msg_101',
          priority: 'NORMAL'
        }
      },
      'REALLOCATION_REQUEST_APPROVED': {
        title: 'Test Request Approved',
        message: 'Reallocation request has been approved',
        notification_type: 'REALLOCATION_REQUEST_APPROVED'
      },
      'REALLOCATION_REQUEST_DISCARDED': {
        title: 'Test Request Discarded',
        message: 'Reallocation request has been discarded',
        notification_type: 'REALLOCATION_REQUEST_DISCARDED'
      },
      'GENERAL': {
        title: 'Test General Notification',
        message: 'This is a general notification',
        notification_type: 'GENERAL'
      },
      'PROXIMITY_ALERT': {
        title: 'Test Proximity Alert',
        message: 'Bus approaching your stop',
        notification_type: 'PROXIMITY_ALERT',
        related_entity: {
          entity_type: 'proximity_alert',
          bus_id: 'bus_456',
          stop_id: 'stop_789',
          priority: 'NORMAL'
        }
      },
      'TRIP_UPDATE': {
        title: 'Test Trip Update',
        message: 'Trip status has been updated - Bus 002 is now delayed by 5 minutes',
        notification_type: 'TRIP_UPDATE',
        related_entity: {
          entity_type: 'trip_update',
          trip_id: 'trip_123',
          bus_id: 'bus_002',
          delay_minutes: 5,
          priority: 'NORMAL'
        }
      },
      'SERVICE_ALERT': {
        title: 'Test Service Alert',
        message: 'Service disruption alert',
        notification_type: 'SERVICE_ALERT'
      }
    };

    const notification: AppNotification = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      is_read: false,
      ...testNotifications[type]
    } as AppNotification;

    addNotification(notification);
    addLog(`🧪 Added test notification: ${type}`);
  };

  const getStatusColor = () => {
    switch (socketStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔧 Notification System Debug Panel</h2>
      
      {/* Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">WebSocket Status</h3>
          <p className={`font-mono ${getStatusColor()}`}>
            {socketStatus.toUpperCase()}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <p className="font-mono">
            Total: {notifications.length} | Unread: {unreadCount}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Auth Token</h3>
          <p className="font-mono text-sm">
            {authToken || 'Not available'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-red-700 text-sm">
            <strong>Last Error:</strong> {lastError}
          </p>
        </div>
      )}

      {/* WebSocket Controls */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">WebSocket Controls</h3>
        <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={checkAuthToken}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Check Auth Token
        </button>
        <button
          onClick={forceReconnect}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Force Reconnect
        </button>
        <button
          onClick={sendWebSocketTest}
          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
          disabled={socketStatus !== 'connected'}
        >
          Send WebSocket Test
        </button>
        <button
          onClick={subscribeToNotifications}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          disabled={socketStatus !== 'connected'}
        >
          Subscribe to Notifications
        </button>
        </div>

        <h3 className="font-semibold mb-3">WebSocket Notification Tests</h3>
        <div className="flex flex-wrap gap-2">
        <button
          onClick={sendRouteReallocationTest}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          disabled={socketStatus !== 'connected'}
        >
          Test Route Reallocation
        </button>
        <button
          onClick={sendTripUpdateTest}
          className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
          disabled={socketStatus !== 'connected'}
        >
          Test Trip Update
        </button>
        <button
          onClick={sendAlertTest}
          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
          disabled={socketStatus !== 'connected'}
        >
          Test Alert
        </button>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Test Notifications (Local)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {(['ALERT', 'ROUTE_REALLOCATION', 'TRIP_UPDATE', 'CHAT_MESSAGE', 'INCIDENT_REPORTED', 'PROXIMITY_ALERT'] as NotificationType[]).map(type => (
            <button
              key={type}
              onClick={() => testNotification(type)}
              className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">These create local test notifications without using WebSocket</p>
      </div>

      {/* Connection Logs */}
      <div>
        <h3 className="font-semibold mb-3">Connection Logs</h3>
        <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-40 overflow-y-auto">
          {connectionLogs.length === 0 ? (
            <p>No logs yet...</p>
          ) : (
            connectionLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDebugPanel;
