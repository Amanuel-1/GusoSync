"use client";

import { useNotifications as useNotificationContext } from '@/components/notifications/NotificationProvider';

// Re-export the hook from the provider for easier imports
export const useNotifications = useNotificationContext;
