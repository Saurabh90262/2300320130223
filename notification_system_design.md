# Stage 1: Notification System REST API Design

## Overview

This document outlines the complete REST API design for the AffordMed notification system. The system provides real-time notifications to users upon login and supports multiple notification types including medical reminders, appointment updates, and prescription alerts.

---

## Core Actions Supported by Notification Platform

The notification system supports the following core actions:

1. **Create Notification** - Send new notifications to users
2. **Retrieve Notifications** - Fetch user notifications with filtering and pagination
3. **Mark as Read** - Update notification read status
4. **Delete Notification** - Remove notifications
5. **Get Notification Preferences** - Retrieve user notification settings
6. **Update Notification Preferences** - Modify notification delivery preferences
7. **Get Real-time Updates** - WebSocket connection for live notifications

---

## REST API Endpoints

### 1. Create Notification

**Endpoint:** `POST /api/notifications`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "{unique-request-id}"
}
```

**Request Body:**

```json
{
  "userId": "user_123",
  "type": "appointment_reminder",
  "title": "Appointment Reminder",
  "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
  "priority": "high",
  "category": "appointment",
  "metadata": {
    "appointmentId": "apt_456",
    "appointmentTime": "2026-06-10T14:00:00Z",
    "doctorName": "Dr. Smith"
  },
  "scheduledFor": "2026-06-10T10:00:00Z",
  "channels": ["email", "in-app", "sms"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Notification created successfully",
  "data": {
    "id": "notif_789",
    "userId": "user_123",
    "type": "appointment_reminder",
    "title": "Appointment Reminder",
    "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
    "priority": "high",
    "category": "appointment",
    "isRead": false,
    "metadata": {
      "appointmentId": "apt_456",
      "appointmentTime": "2026-06-10T14:00:00Z",
      "doctorName": "Dr. Smith"
    },
    "channels": ["email", "in-app", "sms"],
    "createdAt": "2026-06-09T12:30:00Z",
    "readAt": null,
    "deletedAt": null
  }
}
```

---

### 2. Get All Notifications

**Endpoint:** `GET /api/notifications`

**Headers:**

```json
{
  "Authorization": "Bearer {token}",
  "Accept": "application/json"
}
```

**Query Parameters:**

```
?page=1&limit=20&isRead=false&category=appointment&sortBy=-createdAt
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "notif_789",
        "userId": "user_123",
        "type": "appointment_reminder",
        "title": "Appointment Reminder",
        "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
        "priority": "high",
        "category": "appointment",
        "isRead": false,
        "metadata": {
          "appointmentId": "apt_456",
          "appointmentTime": "2026-06-10T14:00:00Z",
          "doctorName": "Dr. Smith"
        },
        "channels": ["email", "in-app", "sms"],
        "createdAt": "2026-06-09T12:30:00Z",
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. Get Notification by ID

**Endpoint:** `GET /api/notifications/:notificationId`

**Headers:**

```json
{
  "Authorization": "Bearer {token}",
  "Accept": "application/json"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification retrieved successfully",
  "data": {
    "id": "notif_789",
    "userId": "user_123",
    "type": "appointment_reminder",
    "title": "Appointment Reminder",
    "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
    "priority": "high",
    "category": "appointment",
    "isRead": false,
    "metadata": {
      "appointmentId": "apt_456",
      "appointmentTime": "2026-06-10T14:00:00Z",
      "doctorName": "Dr. Smith"
    },
    "channels": ["email", "in-app", "sms"],
    "createdAt": "2026-06-09T12:30:00Z",
    "readAt": null,
    "deletedAt": null
  }
}
```

---

### 4. Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/:notificationId/read`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "{unique-request-id}"
}
```

**Request Body:**

```json
{
  "isRead": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": {
    "id": "notif_789",
    "isRead": true,
    "readAt": "2026-06-09T13:45:00Z"
  }
}
```

---

### 5. Mark Multiple Notifications as Read

**Endpoint:** `PATCH /api/notifications/read/bulk`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "{unique-request-id}"
}
```

**Request Body:**

```json
{
  "notificationIds": ["notif_789", "notif_790", "notif_791"],
  "isRead": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications marked as read",
  "data": {
    "updatedCount": 3,
    "notificationIds": ["notif_789", "notif_790", "notif_791"]
  }
}
```

---

### 6. Delete Notification

**Endpoint:** `DELETE /api/notifications/:notificationId`

**Headers:**

```json
{
  "Authorization": "Bearer {token}",
  "X-Request-ID": "{unique-request-id}"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification deleted successfully",
  "data": {
    "id": "notif_789",
    "deletedAt": "2026-06-09T14:00:00Z"
  }
}
```

---

### 7. Delete Multiple Notifications

**Endpoint:** `DELETE /api/notifications`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "{unique-request-id}"
}
```

**Request Body:**

```json
{
  "notificationIds": ["notif_789", "notif_790", "notif_791"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications deleted successfully",
  "data": {
    "deletedCount": 3,
    "notificationIds": ["notif_789", "notif_790", "notif_791"]
  }
}
```

---

### 8. Get Notification Preferences

**Endpoint:** `GET /api/notifications/preferences`

**Headers:**

```json
{
  "Authorization": "Bearer {token}",
  "Accept": "application/json"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preferences retrieved successfully",
  "data": {
    "userId": "user_123",
    "emailNotifications": true,
    "smsNotifications": true,
    "inAppNotifications": true,
    "pushNotifications": true,
    "categories": {
      "appointment": {
        "enabled": true,
        "channels": ["email", "in-app", "sms"]
      },
      "prescription": {
        "enabled": true,
        "channels": ["email", "in-app"]
      },
      "medical_update": {
        "enabled": true,
        "channels": ["in-app"]
      },
      "billing": {
        "enabled": false,
        "channels": []
      }
    },
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    },
    "updatedAt": "2026-06-08T10:00:00Z"
  }
}
```

---

### 9. Update Notification Preferences

**Endpoint:** `PATCH /api/notifications/preferences`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "{unique-request-id}"
}
```

**Request Body:**

```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "inAppNotifications": true,
  "pushNotifications": true,
  "categories": {
    "appointment": {
      "enabled": true,
      "channels": ["email", "in-app"]
    },
    "prescription": {
      "enabled": true,
      "channels": ["in-app"]
    },
    "billing": {
      "enabled": false,
      "channels": []
    }
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preferences updated successfully",
  "data": {
    "userId": "user_123",
    "emailNotifications": true,
    "smsNotifications": false,
    "inAppNotifications": true,
    "pushNotifications": true,
    "categories": {
      "appointment": {
        "enabled": true,
        "channels": ["email", "in-app"]
      },
      "prescription": {
        "enabled": true,
        "channels": ["in-app"]
      },
      "medical_update": {
        "enabled": true,
        "channels": ["in-app"]
      },
      "billing": {
        "enabled": false,
        "channels": []
      }
    },
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    },
    "updatedAt": "2026-06-09T14:30:00Z"
  }
}
```

---

### 10. Get Notification Statistics

**Endpoint:** `GET /api/notifications/stats`

**Headers:**

```json
{
  "Authorization": "Bearer {token}",
  "Accept": "application/json"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Statistics retrieved successfully",
  "data": {
    "userId": "user_123",
    "totalNotifications": 150,
    "unreadCount": 12,
    "readCount": 138,
    "byCategory": {
      "appointment": 45,
      "prescription": 52,
      "medical_update": 38,
      "billing": 15
    },
    "byPriority": {
      "high": 23,
      "medium": 87,
      "low": 40
    },
    "byChannel": {
      "email": 95,
      "in-app": 150,
      "sms": 42,
      "push": 58
    }
  }
}
```

---

## JSON Schemas

### Notification Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Notification",
  "type": "object",
  "required": ["userId", "type", "title", "message", "category"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique notification identifier"
    },
    "userId": {
      "type": "string",
      "description": "ID of the user receiving the notification"
    },
    "type": {
      "type": "string",
      "enum": [
        "appointment_reminder",
        "prescription_alert",
        "medical_update",
        "billing_alert",
        "system_alert"
      ],
      "description": "Type of notification"
    },
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100,
      "description": "Notification title"
    },
    "message": {
      "type": "string",
      "minLength": 10,
      "maxLength": 500,
      "description": "Notification message body"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "default": "medium",
      "description": "Priority level of notification"
    },
    "category": {
      "type": "string",
      "enum": [
        "appointment",
        "prescription",
        "medical_update",
        "billing",
        "system"
      ],
      "description": "Category for organization"
    },
    "isRead": {
      "type": "boolean",
      "default": false,
      "description": "Whether notification has been read"
    },
    "metadata": {
      "type": "object",
      "description": "Additional contextual data specific to notification type"
    },
    "channels": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["email", "sms", "in-app", "push"]
      },
      "description": "Delivery channels for this notification"
    },
    "scheduledFor": {
      "type": "string",
      "format": "date-time",
      "description": "When to send the notification"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Notification creation timestamp"
    },
    "readAt": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "When notification was read"
    },
    "deletedAt": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "When notification was deleted (soft delete)"
    }
  }
}
```

### Notification Preferences Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NotificationPreferences",
  "type": "object",
  "required": ["userId"],
  "properties": {
    "userId": {
      "type": "string",
      "description": "User ID associated with preferences"
    },
    "emailNotifications": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable email notifications globally"
    },
    "smsNotifications": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable SMS notifications globally"
    },
    "inAppNotifications": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable in-app notifications"
    },
    "pushNotifications": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable push notifications"
    },
    "categories": {
      "type": "object",
      "properties": {
        "appointment": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "channels": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["email", "sms", "in-app", "push"]
              }
            }
          }
        },
        "prescription": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "channels": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["email", "sms", "in-app", "push"]
              }
            }
          }
        },
        "medical_update": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "channels": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["email", "sms", "in-app", "push"]
              }
            }
          }
        },
        "billing": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "channels": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["email", "sms", "in-app", "push"]
              }
            }
          }
        }
      }
    },
    "quietHours": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "startTime": {
          "type": "string",
          "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
          "description": "Start time in HH:MM format"
        },
        "endTime": {
          "type": "string",
          "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
          "description": "End time in HH:MM format"
        }
      }
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp"
    }
  }
}
```

---

## Real-Time Notifications Mechanism

### WebSocket Implementation

#### Connection Setup

**URL:** `wss://api.affordmed.com/notifications/ws`

**Headers:**

```json
{
  "Authorization": "Bearer {token}",
  "X-User-ID": "user_123"
}
```

#### WebSocket Events

**1. Connection Established**

```json
{
  "event": "connected",
  "data": {
    "connectionId": "conn_abc123",
    "userId": "user_123",
    "timestamp": "2026-06-09T12:30:00Z"
  }
}
```

**2. Receive New Notification**

```json
{
  "event": "notification:new",
  "data": {
    "id": "notif_789",
    "userId": "user_123",
    "type": "appointment_reminder",
    "title": "Appointment Reminder",
    "message": "Your appointment is scheduled for tomorrow at 2:00 PM",
    "priority": "high",
    "category": "appointment",
    "metadata": {
      "appointmentId": "apt_456",
      "appointmentTime": "2026-06-10T14:00:00Z"
    },
    "createdAt": "2026-06-09T12:30:00Z"
  }
}
```

**3. Notification Read Update**

```json
{
  "event": "notification:read",
  "data": {
    "notificationId": "notif_789",
    "readAt": "2026-06-09T13:45:00Z"
  }
}
```

**4. Notification Deleted**

```json
{
  "event": "notification:deleted",
  "data": {
    "notificationId": "notif_789",
    "deletedAt": "2026-06-09T14:00:00Z"
  }
}
```

**5. Batch Update**

```json
{
  "event": "notification:batch_update",
  "data": {
    "updatedCount": 5,
    "notificationIds": [
      "notif_789",
      "notif_790",
      "notif_791",
      "notif_792",
      "notif_793"
    ],
    "action": "read",
    "timestamp": "2026-06-09T14:15:00Z"
  }
}
```

**6. Connection Closed**

```json
{
  "event": "disconnected",
  "data": {
    "connectionId": "conn_abc123",
    "reason": "user_logout",
    "timestamp": "2026-06-09T15:00:00Z"
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "message",
      "value": "short",
      "message": "message must be at least 10 characters"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required",
  "error": "missing_auth_token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied",
  "error": "insufficient_permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Notification not found",
  "error": "resource_not_found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "error": "server_error",
  "requestId": "req_xyz789"
}
```

---

## Notification Types & Examples

### 1. Appointment Reminder

```json
{
  "type": "appointment_reminder",
  "category": "appointment",
  "title": "Appointment Reminder",
  "message": "Your appointment with Dr. Smith is scheduled for tomorrow at 2:00 PM",
  "priority": "high",
  "metadata": {
    "appointmentId": "apt_456",
    "doctorName": "Dr. Smith",
    "appointmentTime": "2026-06-10T14:00:00Z",
    "location": "Main Hospital, Room 205"
  }
}
```

### 2. Prescription Alert

```json
{
  "type": "prescription_alert",
  "category": "prescription",
  "title": "Prescription Refill Required",
  "message": "Your prescription for Metformin is running low. Refill it now.",
  "priority": "medium",
  "metadata": {
    "prescriptionId": "presc_123",
    "medicationName": "Metformin",
    "daysRemaining": 3,
    "refillUrl": "/prescriptions/presc_123/refill"
  }
}
```

### 3. Medical Update

```json
{
  "type": "medical_update",
  "category": "medical_update",
  "title": "Lab Results Available",
  "message": "Your recent lab results are now available for review",
  "priority": "medium",
  "metadata": {
    "labResultId": "lab_789",
    "testDate": "2026-06-08T10:30:00Z",
    "testName": "Complete Blood Count",
    "resultUrl": "/lab-results/lab_789"
  }
}
```

### 4. Billing Alert

```json
{
  "type": "billing_alert",
  "category": "billing",
  "title": "Payment Due",
  "message": "Your medical bill of $250 is due by June 15, 2026",
  "priority": "high",
  "metadata": {
    "invoiceId": "inv_456",
    "amount": 250,
    "currency": "USD",
    "dueDate": "2026-06-15",
    "paymentUrl": "/billing/inv_456/pay"
  }
}
```

---

## API Design Principles

1. **RESTful Conventions**: Follow REST principles with appropriate HTTP methods and status codes
2. **Consistent Naming**: Use snake_case for JSON fields and kebab-case for URL paths
3. **Pagination**: Implement cursor and offset-based pagination for list endpoints
4. **Versioning**: API versioned via URL path (`/api/v1/notifications`)
5. **Error Handling**: Structured error responses with error codes and field-level details
6. **Security**: JWT authentication, rate limiting, and CORS policies
7. **Logging**: Request ID tracking for debugging and monitoring
8. **Scalability**: Support for batch operations and efficient filtering

---

## Implementation Roadmap

### Phase 1: Core Endpoints

- POST /api/notifications
- GET /api/notifications
- GET /api/notifications/:notificationId
- PATCH /api/notifications/:notificationId/read
- DELETE /api/notifications/:notificationId

### Phase 2: Preferences & Settings

- GET /api/notifications/preferences
- PATCH /api/notifications/preferences

### Phase 3: Real-Time & Advanced

- WebSocket real-time notifications
- Batch operations endpoints
- Analytics and statistics endpoints

### Phase 4: Optimization

- Caching layer (Redis)
- Message queue integration (RabbitMQ/Kafka)
- Notification scheduling service
- Multi-channel delivery system
