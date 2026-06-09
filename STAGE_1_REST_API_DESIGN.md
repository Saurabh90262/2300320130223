# Stage 1: REST API Design for Notification System

## Core Actions Supported

1. **Create Notification** - Send new notifications to users
2. **Retrieve Notifications** - Fetch user notifications with filtering and pagination
3. **Mark as Read** - Update notification read status
4. **Delete Notification** - Remove notifications
5. **Get Notification Preferences** - Retrieve user notification settings
6. **Update Notification Preferences** - Modify notification delivery preferences
7. **Get Real-time Updates** - WebSocket connection for live notifications

## REST API Endpoints

### Create Notification
**POST /api/notifications**

Request:
```json
{
  "userId": "user_123",
  "type": "appointment_reminder",
  "title": "Appointment Reminder",
  "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
  "priority": "high",
  "category": "appointment",
  "channels": ["email", "in-app", "sms"]
}
```

Response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Notification created successfully",
  "data": {
    "id": "notif_789",
    "userId": "user_123",
    "isRead": false,
    "createdAt": "2026-06-09T12:30:00Z"
  }
}
```

### Get All Notifications
**GET /api/notifications?page=1&limit=20&isRead=false&category=appointment**

Response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "notifications": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasNextPage": true
    }
  }
}
```

### Get Notification by ID
**GET /api/notifications/:notificationId**

### Mark as Read
**PATCH /api/notifications/:notificationId/read**

### Delete Notification
**DELETE /api/notifications/:notificationId**

### Get Preferences
**GET /api/notifications/preferences**

### Update Preferences
**PATCH /api/notifications/preferences**

### Statistics
**GET /api/notifications/stats**

## WebSocket Events

```json
{
  "event": "notification:new",
  "data": {
    "id": "notif_789",
    "type": "appointment_reminder",
    "title": "Appointment Reminder",
    "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
    "priority": "high",
    "createdAt": "2026-06-09T12:30:00Z"
  }
}
```
