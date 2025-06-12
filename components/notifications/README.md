# Notification System

A comprehensive real-time notification system for GuzoSync that handles various types of notifications through WebSocket connections.

## Features

- **Real-time notifications** via WebSocket connection
- **Multiple notification types** with proper categorization
- **Visual notification center** with filtering and management
- **Toast notifications** for immediate feedback
- **Browser notifications** for important alerts
- **Priority-based styling** and handling
- **Mark as read/unread** functionality
- **Notification persistence** with backend API integration

## Notification Types

The system supports the following notification types:

- `REALLOCATION_REQUEST_SUBMITTED` - New reallocation request submitted
- `REALLOCATION_REQUEST_APPROVED` - Reallocation request approved
- `REALLOCATION_REQUEST_DISCARDED` - Reallocation request rejected
- `ROUTE_REALLOCATION` - Bus route changed
- `INCIDENT_REPORTED` - New incident reported
- `GENERAL` - General notifications
- `PROXIMITY_ALERT` - Bus proximity alerts
- `CHAT_MESSAGE` - Chat message notifications
- `TRIP_UPDATE` - Trip status updates
- `SERVICE_ALERT` - Service alerts

## Components

### NotificationProvider
Context provider that manages notification state and WebSocket integration.

### NotificationCenter
Main notification display component with filtering and management features.

### NotificationItem
Individual notification item component with actions and styling.

### NotificationTestPanel
Development component for testing different notification types.

## Usage

1. **Wrap your app with NotificationProvider:**
```tsx
import { NotificationProvider } from '@/components/notifications';

function App() {
  return (
    <NotificationProvider>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

2. **Use the notification hook:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  // Use notification data
}
```

3. **Display notification center:**
```tsx
import { NotificationCenter } from '@/components/notifications';

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowNotifications(true)}>
        Notifications ({unreadCount})
      </button>
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
}
```

## WebSocket Message Format

The system expects notifications in the following format:

```json
{
  "type": "notification",
  "notification": {
    "id": "67890abcdef",
    "title": "New Reallocation Request",
    "message": "New (high priority) reallocation request submitted...",
    "notification_type": "REALLOCATION_REQUEST_SUBMITTED",
    "related_entity": {
      "entity_type": "reallocation_request",
      "request_id": "req_12345",
      "bus_id": "bus_001",
      "priority": "HIGH"
    },
    "timestamp": "2024-01-15T10:32:00.000Z",
    "is_read": false
  }
}
```

## API Integration

The system integrates with the following backend endpoints:

- `GET /api/notifications` - Fetch all notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/account/notification-settings` - Get notification settings
- `PUT /api/account/notification-settings` - Update notification settings

## Testing

Use the NotificationTestPanel component to test different notification types during development. It's available on the main dashboard with a "Test" button.

## Styling

The system uses Tailwind CSS with color-coded notifications based on type and priority:

- **High priority**: Intensified colors with pulse animation
- **Normal priority**: Standard colors
- **Low priority**: Muted colors

Each notification type has its own color scheme for easy identification.
