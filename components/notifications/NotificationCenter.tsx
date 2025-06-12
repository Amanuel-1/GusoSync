"use client";

import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter, RefreshCw } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from './NotificationProvider';
import { NotificationType } from '@/types/notification';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    markAllAsRead, 
    clearAll, 
    fetchNotifications 
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    return notification.notification_type === filter;
  });

  // Group notifications by type for filter options
  const notificationTypes = Array.from(
    new Set(notifications.map(n => n.notification_type))
  );

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAll();
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-25" 
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-[#103a5e] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={12} />
              Mark all read
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="flex items-center gap-1 text-xs bg-red-500 bg-opacity-80 hover:bg-opacity-100 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={12} />
              Clear all
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
            >
              <option value="all">All ({notifications.length})</option>
              <option value="unread">Unread ({unreadCount})</option>
              {notificationTypes.map(type => {
                const count = notifications.filter(n => n.notification_type === type).length;
                return (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-xs text-red-700 underline mt-1"
              >
                Try again
              </button>
            </div>
          )}

          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#103a5e] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No notifications yet' 
                  : filter === 'unread'
                  ? 'No unread notifications'
                  : `No ${filter.replace(/_/g, ' ').toLowerCase()} notifications`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="group">
                  <NotificationItem 
                    notification={notification} 
                    onClose={onClose}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </>
  );
}
