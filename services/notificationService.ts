import { AppNotification } from '@/types/notification';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Use frontend API routes instead of calling backend directly
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
    });
  }

  /**
   * Fetch all notifications for the current user
   */
  async fetchNotifications(): Promise<{ notifications: AppNotification[]; error?: string }> {
    try {
      console.log('📡 Fetching notifications from API...');
      const response = await this.makeRequest('/api/notifications');

      console.log('📡 Notification API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('📡 Unauthorized access to notifications');
          return { notifications: [], error: 'Please log in to view notifications' };
        }
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 Received notifications data:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : null
      });

      return { notifications: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('📡 Error fetching notifications:', error);
      return {
        notifications: [],
        error: error instanceof Error ? error.message : 'Failed to fetch notifications'
      };
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to mark notification as read' 
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/api/notifications', {
        method: 'PUT',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: 'Please log in to mark notifications as read' };
        }
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      };
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete notification' 
      };
    }
  }

  /**
   * Get notification settings for the current user
   */
  async getNotificationSettings(): Promise<{ settings?: any; error?: string }> {
    try {
      const response = await this.makeRequest('/api/account/notification-settings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notification settings: ${response.status}`);
      }

      const settings = await response.json();
      return { settings };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch notification settings' 
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: { email_enabled: boolean }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/api/account/notification-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update notification settings: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update notification settings' 
      };
    }
  }
}

export const notificationService = NotificationService.getInstance();
