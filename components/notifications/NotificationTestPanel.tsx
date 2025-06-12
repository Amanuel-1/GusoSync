"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationProvider';
import { AppNotification, NotificationType } from '@/types/notification';
import { RealTimeSocketService } from '@/utils/socket';
import { useReallocationNotifications } from '@/hooks/useReallocationNotifications';

export function NotificationTestPanel() {
  const { addNotification } = useNotifications();
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketConnecting, setSocketConnecting] = useState(false);
  const {
    sendTestReallocationRequest,
    sendTestReallocationApproval,
    sendTestReallocationDiscard,
    sendTestRouteReallocation
  } = useReallocationNotifications();

  useEffect(() => {
    const socket = RealTimeSocketService.getInstance();

    const updateConnectionStatus = () => {
      setSocketConnected(socket.isConnected());
      setSocketConnecting(socket.isConnecting());
    };

    // Initial status
    updateConnectionStatus();

    // Listen for connection changes
    const handleConnect = () => {
      console.log('🔔 Test panel: Socket connected');
      updateConnectionStatus();
    };

    const handleDisconnect = () => {
      console.log('🔔 Test panel: Socket disconnected');
      updateConnectionStatus();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Update status every second
    const interval = setInterval(updateConnectionStatus, 1000);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      clearInterval(interval);
    };
  }, []);

  const handleForceReconnect = () => {
    const socket = RealTimeSocketService.getInstance();
    socket.forceReconnect();
  };

  const createTestNotification = (type: NotificationType, priority: "LOW" | "NORMAL" | "HIGH" = "NORMAL") => {
    const testNotifications: Record<NotificationType, Omit<AppNotification, 'id' | 'timestamp' | 'is_read'>> = {
      REALLOCATION_REQUEST_SUBMITTED: {
        title: "New Reallocation Request",
        message: "New (high priority) reallocation request submitted by John Doe for bus AA-123 on route Central ↔️ Airport. Reason: overcrowding. Details: Bus is overcrowded during peak hours...",
        notification_type: "REALLOCATION_REQUEST_SUBMITTED",
        related_entity: {
          entity_type: "reallocation_request",
          request_id: "req_12345",
          bus_id: "bus_001",
          current_route_id: "route_001",
          requesting_regulator_id: "user_456",
          reason: "OVERCROWDING",
          priority: priority
        }
      },
      REALLOCATION_REQUEST_APPROVED: {
        title: "Reallocation Request Approved",
        message: "Your reallocation request for bus AA-123 has been approved and will be implemented shortly.",
        notification_type: "REALLOCATION_REQUEST_APPROVED",
        related_entity: {
          entity_type: "reallocation_request",
          request_id: "req_12345",
          priority: priority
        }
      },
      REALLOCATION_REQUEST_DISCARDED: {
        title: "Reallocation Request Rejected",
        message: "Your reallocation request for bus AA-123 has been rejected. Reason: Insufficient resources.",
        notification_type: "REALLOCATION_REQUEST_DISCARDED",
        related_entity: {
          entity_type: "reallocation_request",
          request_id: "req_12345",
          priority: priority
        }
      },
      ROUTE_REALLOCATION: {
        title: "Bus Route Changed",
        message: "Bus AA-123 has been reallocated from Central ↔️ Airport to Downtown ↔️ University route.",
        notification_type: "ROUTE_REALLOCATION",
        related_entity: {
          entity_type: "route",
          bus_id: "bus_001",
          route_id: "route_002",
          priority: priority
        }
      },
      INCIDENT_REPORTED: {
        title: "Incident Reported",
        message: "Traffic accident reported on Central Avenue. Bus delays expected for route Central ↔️ Airport.",
        notification_type: "INCIDENT_REPORTED",
        related_entity: {
          entity_type: "incident",
          incident_id: "inc_789",
          priority: "HIGH"
        }
      },
      PROXIMITY_ALERT: {
        title: "Bus Approaching",
        message: "Bus AA-123 is approaching Central Station. Estimated arrival: 3 minutes.",
        notification_type: "PROXIMITY_ALERT",
        related_entity: {
          entity_type: "bus",
          bus_id: "bus_001",
          priority: priority
        }
      },
      CHAT_MESSAGE: {
        title: "New Message",
        message: "You have a new message from Driver John Doe: 'Running 5 minutes late due to traffic'",
        notification_type: "CHAT_MESSAGE",
        related_entity: {
          entity_type: "chat",
          chat_id: "chat_456",
          message_id: "msg_789",
          priority: priority
        }
      },
      TRIP_UPDATE: {
        title: "Trip Status Update",
        message: "Trip #TR-456 status changed to 'In Progress'. Bus AA-123 has started the route.",
        notification_type: "TRIP_UPDATE",
        related_entity: {
          entity_type: "trip",
          trip_id: "trip_456",
          bus_id: "bus_001",
          priority: priority
        }
      },
      SERVICE_ALERT: {
        title: "Service Alert",
        message: "Emergency maintenance required on Downtown route. Service temporarily suspended.",
        notification_type: "SERVICE_ALERT",
        related_entity: {
          entity_type: "route",
          route_id: "route_003",
          priority: "HIGH"
        }
      },
      GENERAL: {
        title: "System Notification",
        message: "System maintenance scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes.",
        notification_type: "GENERAL",
        related_entity: {
          entity_type: "system",
          priority: priority
        }
      }
    };

    const notification: AppNotification = {
      ...testNotifications[type],
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      is_read: false
    };

    addNotification(notification);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-[#103a5e]">Notification Test Panel</h3>

      {/* Connection Status */}
      <div className="mb-4 p-3 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              socketConnected ? 'bg-green-500' :
              socketConnecting ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              WebSocket: {
                socketConnected ? 'Connected' :
                socketConnecting ? 'Connecting...' : 'Disconnected'
              }
            </span>
          </div>
          <button
            onClick={handleForceReconnect}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Reconnect
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Click the buttons below to test different notification types:
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => createTestNotification('REALLOCATION_REQUEST_SUBMITTED', 'HIGH')}
          className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Reallocation Request
        </button>
        
        <button
          onClick={() => createTestNotification('REALLOCATION_REQUEST_APPROVED')}
          className="px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
        >
          Request Approved
        </button>
        
        <button
          onClick={() => createTestNotification('INCIDENT_REPORTED', 'HIGH')}
          className="px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          Incident Report
        </button>
        
        <button
          onClick={() => createTestNotification('PROXIMITY_ALERT')}
          className="px-3 py-2 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
        >
          Proximity Alert
        </button>
        
        <button
          onClick={() => createTestNotification('CHAT_MESSAGE', 'LOW')}
          className="px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
        >
          Chat Message
        </button>
        
        <button
          onClick={() => createTestNotification('SERVICE_ALERT', 'HIGH')}
          className="px-3 py-2 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
        >
          Service Alert
        </button>
        
        <button
          onClick={() => createTestNotification('TRIP_UPDATE')}
          className="px-3 py-2 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors"
        >
          Trip Update
        </button>
        
        <button
          onClick={() => createTestNotification('GENERAL')}
          className="px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
        >
          General Notice
        </button>
      </div>
      
      {/* WebSocket Reallocation Tests */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-md font-medium text-[#103a5e] mb-3">WebSocket Reallocation Tests</h4>
        <p className="text-sm text-gray-600 mb-3">
          Test real-time reallocation notifications via WebSocket:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={sendTestReallocationRequest}
            className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Request Submitted
          </button>

          <button
            onClick={sendTestReallocationApproval}
            className="px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
          >
            ✅ Request Approved
          </button>

          <button
            onClick={sendTestReallocationDiscard}
            className="px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            ❌ Request Discarded
          </button>

          <button
            onClick={sendTestRouteReallocation}
            className="px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
          >
            🚌 Route Reallocated
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <strong>Note:</strong> The top section creates local test notifications. The WebSocket section
        sends actual notifications through the real-time system that would be received by all connected clients.
      </div>
    </div>
  );
}
