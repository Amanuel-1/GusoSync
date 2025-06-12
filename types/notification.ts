export type NotificationType = 
  | "REALLOCATION_REQUEST_SUBMITTED"
  | "REALLOCATION_REQUEST_APPROVED" 
  | "REALLOCATION_REQUEST_DISCARDED"
  | "ROUTE_REALLOCATION"
  | "INCIDENT_REPORTED"
  | "GENERAL"
  | "PROXIMITY_ALERT"
  | "CHAT_MESSAGE"
  | "TRIP_UPDATE"
  | "SERVICE_ALERT";

export interface RelatedEntity {
  entity_type: string;
  request_id?: string;
  bus_id?: string;
  current_route_id?: string;
  requesting_regulator_id?: string;
  reason?: string;
  priority?: "LOW" | "NORMAL" | "HIGH";
  route_id?: string;
  trip_id?: string;
  incident_id?: string;
  chat_id?: string;
  message_id?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_entity?: RelatedEntity;
  timestamp: string;
  is_read: boolean;
}

export interface NotificationSocketMessage {
  type: "notification";
  notification: AppNotification;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationContextType extends NotificationState {
  addNotification: (notification: AppNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

// Notification priority levels for UI styling
export const getNotificationPriority = (notification: AppNotification): "low" | "normal" | "high" => {
  if (notification.related_entity?.priority === "HIGH") return "high";
  if (notification.notification_type === "INCIDENT_REPORTED") return "high";
  if (notification.notification_type === "SERVICE_ALERT") return "high";
  if (notification.notification_type === "PROXIMITY_ALERT") return "normal";
  if (notification.notification_type === "CHAT_MESSAGE") return "low";
  return "normal";
};

// Get icon for notification type
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case "REALLOCATION_REQUEST_SUBMITTED":
    case "REALLOCATION_REQUEST_APPROVED":
    case "REALLOCATION_REQUEST_DISCARDED":
      return "🚌";
    case "ROUTE_REALLOCATION":
      return "🗺️";
    case "INCIDENT_REPORTED":
      return "⚠️";
    case "PROXIMITY_ALERT":
      return "📍";
    case "CHAT_MESSAGE":
      return "💬";
    case "TRIP_UPDATE":
      return "🚍";
    case "SERVICE_ALERT":
      return "🚨";
    case "GENERAL":
    default:
      return "ℹ️";
  }
};

// Get color scheme for notification type
export const getNotificationColors = (type: NotificationType, priority: "low" | "normal" | "high") => {
  const baseColors = {
    REALLOCATION_REQUEST_SUBMITTED: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "text-blue-600" },
    REALLOCATION_REQUEST_APPROVED: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "text-green-600" },
    REALLOCATION_REQUEST_DISCARDED: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" },
    ROUTE_REALLOCATION: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", icon: "text-purple-600" },
    INCIDENT_REPORTED: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" },
    PROXIMITY_ALERT: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: "text-yellow-600" },
    CHAT_MESSAGE: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", icon: "text-gray-600" },
    TRIP_UPDATE: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", icon: "text-indigo-600" },
    SERVICE_ALERT: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" },
    GENERAL: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", icon: "text-gray-600" },
  };

  const colors = baseColors[type] || baseColors.GENERAL;
  
  // Intensify colors for high priority notifications
  if (priority === "high") {
    return {
      ...colors,
      bg: colors.bg.replace("-50", "-100"),
      border: colors.border.replace("-200", "-300"),
    };
  }
  
  return colors;
};
