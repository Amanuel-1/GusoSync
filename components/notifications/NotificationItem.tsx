"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X, Eye, Trash2 } from 'lucide-react';
import { AppNotification, getNotificationPriority, getNotificationIcon, getNotificationColors } from '@/types/notification';
import { useNotifications } from './NotificationProvider';

interface NotificationItemProps {
  notification: AppNotification;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead, removeNotification } = useNotifications();
  
  const priority = getNotificationPriority(notification);
  const icon = getNotificationIcon(notification.notification_type);
  const colors = getNotificationColors(notification.notification_type, priority);
  
  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  }, [notification.timestamp]);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type and related entity
    if (notification.related_entity) {
      const { entity_type, request_id, bus_id, route_id } = notification.related_entity;
      
      switch (entity_type) {
        case 'reallocation_request':
          if (request_id) {
            // Navigate to reallocation request details
            console.log('Navigate to reallocation request:', request_id);
          }
          break;
        case 'bus':
          if (bus_id) {
            // Navigate to bus details
            console.log('Navigate to bus:', bus_id);
          }
          break;
        case 'route':
          if (route_id) {
            // Navigate to route details
            console.log('Navigate to route:', route_id);
          }
          break;
        default:
          console.log('No specific navigation for entity type:', entity_type);
      }
    }
    
    onClose?.();
  };

  return (
    <div
      className={`
        relative p-4 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${colors.bg} ${colors.border} ${!notification.is_read ? 'border-l-4' : 'border-l-2'}
        ${!notification.is_read ? 'shadow-sm' : ''}
      `}
      onClick={handleClick}
    >
      {/* Priority indicator for high priority notifications */}
      {priority === 'high' && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 text-lg ${colors.icon}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm leading-tight ${colors.text}`}>
              {notification.title}
            </h4>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Mark as read"
                >
                  <Eye size={12} className="text-gray-500" />
                </button>
              )}
              <button
                onClick={handleRemove}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Remove notification"
              >
                <Trash2 size={12} className="text-gray-500" />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {timeAgo}
            </span>
            
            {/* Related entity info */}
            {notification.related_entity && (
              <div className="flex items-center gap-2">
                {notification.related_entity.priority && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${notification.related_entity.priority === 'HIGH' 
                      ? 'bg-red-100 text-red-700' 
                      : notification.related_entity.priority === 'NORMAL'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    {notification.related_entity.priority}
                  </span>
                )}
                
                {notification.related_entity.entity_type && (
                  <span className="text-xs text-gray-500 capitalize">
                    {notification.related_entity.entity_type.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Unread indicator */}
          {!notification.is_read && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
          )}
        </div>
      </div>
    </div>
  );
}
