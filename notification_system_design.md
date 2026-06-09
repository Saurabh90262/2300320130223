# Notification System Design - Complete Implementation Guide

## Overview

This comprehensive document outlines all 7 stages of implementing a scalable notification system for the College Notification Platform platform. The system provides real-time notifications to users upon login and supports multiple notification types including medical reminders, appointment updates, and prescription alerts.

---

# Stage 1: REST API Design

This is the REST API design for the notification system.

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

**URL:** `wss://api.example.com/notifications/ws`

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

---

# Stage 2: Database Schema Design

## Database Selection & Rationale

**Recommended: PostgreSQL (Relational Database)**

### Why PostgreSQL?

1. **ACID Compliance**: Guarantees data consistency for critical operations
2. **JSON Support**: Native JSONB type for flexible metadata storage
3. **Advanced Indexing**: Supports partial, expression-based, and GIN indexes
4. **Scalability**: Handles millions of records efficiently with proper indexing
5. **Proven Track Record**: Battle-tested for notification systems at scale
6. **Cost-Effective**: Open-source and cloud-friendly

### Scalability Considerations

- **Data Volume**: With 50,000 students × 5,000,000 notifications = 250 billion potential notification-user pairs
- **Query Patterns**: Heavy read operations (notifications fetched on every page load)
- **Storage**: ~250GB for full dataset at 1KB per notification
- **Challenges**: Efficient pagination, preventing table scans, maintaining query performance

---

## Database Schema

```sql
-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    channels TEXT[] DEFAULT ARRAY['in-app'],
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_category CHECK (category IN ('appointment', 'prescription', 'medical_update', 'billing', 'system'))
);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    category_settings JSONB DEFAULT '{
        "appointment": {"enabled": true, "channels": ["email", "in-app", "sms"]},
        "prescription": {"enabled": true, "channels": ["email", "in-app"]},
        "medical_update": {"enabled": true, "channels": ["in-app"]},
        "billing": {"enabled": false, "channels": []}
    }',
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_category ON notifications(user_id, category);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_deleted_at ON notifications(deleted_at) WHERE deleted_at IS NULL;

-- Composite Index for Common Queries
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_user_category_read ON notifications(user_id, category, is_read);

-- Partial Indexes for Active Notifications
CREATE INDEX idx_active_notifications ON notifications(user_id, created_at DESC)
    WHERE deleted_at IS NULL AND created_at > CURRENT_TIMESTAMP - INTERVAL '90 days';

-- JSONB Index for Metadata Filtering
CREATE INDEX idx_notifications_metadata ON notifications USING GIN (metadata);

-- Preferences Index
CREATE INDEX idx_preferences_user_id ON notification_preferences(user_id);
```

---

## Scalability Strategy for Data Volume Increase

### 1. **Partitioning Strategy**

```sql
-- Partition notifications by date (monthly)
CREATE TABLE notifications_2026_06 PARTITION OF notifications
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE notifications_2026_07 PARTITION OF notifications
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

### 2. **Archival Strategy**

```sql
-- Archive old notifications to separate table
CREATE TABLE notifications_archive (LIKE notifications);

-- Move old data
INSERT INTO notifications_archive
SELECT * FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
DELETE FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
```

### 3. **Caching Strategy**

- Redis for recent notifications (last 30 days)
- Cache invalidation on read/delete
- TTL: 24 hours for list cache

---

## Database Queries

### Query 1: Fetch All Unread Notifications for a Student

```sql
SELECT id, type, title, message, priority, category, metadata, created_at
FROM notifications
WHERE user_id = $1
  AND is_read = false
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### Query 2: Get Notifications by Category

```sql
SELECT id, type, title, message, priority, category, created_at, is_read
FROM notifications
WHERE user_id = $1
  AND category = $2
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

### Query 3: Get Placement Notifications (Last 7 Days)

```sql
SELECT id, type, title, message, priority, metadata, created_at, is_read
FROM notifications
WHERE user_id = $1
  AND type = 'Placement'
  AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

### Query 4: Get Notification Statistics

```sql
SELECT
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_count,
    COUNT(*) FILTER (WHERE is_read = true) as read_count,
    COUNT(DISTINCT category) as category_count
FROM notifications
WHERE user_id = $1 AND deleted_at IS NULL;
```

---

# Stage 3: Query Optimization & Indexing

## Problem Analysis

**Original Slow Query:**

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Issues Identified:

1. **SELECT \***: Fetches unnecessary columns (excessive I/O)
2. **No indexes**: Causes full table scan on 5 million rows
3. **ASC ordering**: Less efficient than DESC for cache
4. **Missing user_id index**: Critical for multi-user systems

---

## Optimized Query

```sql
SELECT id, type, title, message, priority, category, created_at, is_read
FROM notifications
WHERE user_id = $1
  AND is_read = false
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Performance Improvements:

- ✅ **Specific columns only**: Reduces data transfer by ~60%
- ✅ **Composite index** on (user_id, is_read, created_at): Enables index-only scan
- ✅ **Soft delete filter**: Only queries active notifications
- ✅ **DESC ordering**: Utilizes B-tree index traversal efficiently

### Expected Performance:

- **Before**: 2-5 seconds (full table scan)
- **After**: 50-100ms (index scan)

---

## Indexing Strategy

### Index 1: Primary Lookup Index

```sql
CREATE INDEX idx_notifications_user_read_recent
    ON notifications(user_id, is_read, created_at DESC)
    WHERE deleted_at IS NULL;
```

**Use Case**: Fetch unread notifications
**Cost**: ~50GB for 250B notifications

### Index 2: Category Filtering

```sql
CREATE INDEX idx_notifications_category
    ON notifications(user_id, category, created_at DESC)
    WHERE deleted_at IS NULL;
```

**Use Case**: Filter by notification category

### Index 3: Temporal Queries

```sql
CREATE INDEX idx_notifications_recent
    ON notifications(created_at DESC)
    WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
      AND deleted_at IS NULL;
```

**Use Case**: Recent notifications only

### Index 4: Search Optimization

```sql
CREATE INDEX idx_notifications_text_search
    ON notifications USING GIN (to_tsvector('english', message));
```

**Use Case**: Full-text search on messages

---

## Why Index on Every Column is NOT Advisable

```sql
-- ANTI-PATTERN: Index explosion
CREATE INDEX idx_col1 ON notifications(column1);
CREATE INDEX idx_col2 ON notifications(column2);
CREATE INDEX idx_col3 ON notifications(column3);
-- ... Results in 250GB+ of index storage
```

**Problems:**

- Slows down INSERT/UPDATE/DELETE operations
- Increases storage costs dramatically
- Query planner confusion (wrong index selection)
- Maintenance overhead
- Diminishing returns on performance

**Solution**: Use composite indexes targeting actual query patterns

---

## Query for Last 7 Days Placement Notifications

```sql
SELECT id, type, title, message, priority, metadata, created_at, is_read
FROM notifications
WHERE user_id = $1
  AND type = 'Placement'
  AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 100;
```

**Index Support:**

```sql
CREATE INDEX idx_placement_notifications_7d
    ON notifications(user_id, type, created_at DESC)
    WHERE deleted_at IS NULL
      AND created_at > CURRENT_DATE - INTERVAL '7 days'
      AND type = 'Placement';
```

---

# Stage 4: Performance Optimization for Database Overwhelm

## Problem Statement

Database is getting overwhelmed when fetching notifications on each page load for 50,000 students, with 5,000,000 total notifications in the system.

## Solutions

### Solution 1: Redis Caching Layer

```
Architecture: Application → Redis Cache → PostgreSQL
Hit Ratio Target: 90%
```

**Implementation:**

```python
# Pseudocode
def get_user_notifications(user_id, page=1, limit=20):
    cache_key = f"notifications:{user_id}:page:{page}"

    # Try cache first
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)

    # Cache miss - query DB
    notifications = db.query(f"""
        SELECT id, type, title, message, priority, category, created_at, is_read
        FROM notifications
        WHERE user_id = {user_id} AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT {limit} OFFSET {(page-1)*limit}
    """)

    # Store in cache (24 hour TTL)
    redis.setex(cache_key, 86400, json.dumps(notifications))
    return notifications
```

**Benefits:**

- Reduces DB queries by 85-90%
- Response time: 5-10ms (vs 200-500ms from DB)
- Handles traffic spikes

### Solution 2: Database Read Replicas

```
Architecture:
  Write: Primary PostgreSQL (writes only)
  Read: 3-5 Replica PostgreSQL (notifications queries)
  Router: HAProxy (load balancer)
```

**Load Distribution:**

- Primary: INSERT/UPDATE/DELETE only
- Replicas: SELECT queries distributed round-robin
- Replication lag: <100ms

### Solution 3: Materialized Views for Common Queries

```sql
-- Create materialized view for daily notification stats
CREATE MATERIALIZED VIEW notifications_daily_stats AS
SELECT
    user_id,
    DATE(created_at) as date,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_read = false) as unread,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority
FROM notifications
WHERE deleted_at IS NULL
GROUP BY user_id, DATE(created_at);

-- Index the materialized view
CREATE INDEX idx_stats_user_date ON notifications_daily_stats(user_id, date DESC);

-- Refresh schedule (hourly)
REFRESH MATERIALIZED VIEW CONCURRENTLY notifications_daily_stats;
```

### Solution 4: Pagination + Lazy Loading

```python
# Backend: Return only 20 items per page
def get_notifications(user_id, page=1, limit=20):
    offset = (page - 1) * limit
    return db.query(f"""
        SELECT * FROM notifications
        WHERE user_id = {user_id} AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT {limit} OFFSET {offset}
    """)

# Frontend: Load more on scroll
// React Component
const [notifications, setNotifications] = useState([]);
const [page, setPage] = useState(1);

const loadMore = async () => {
    const data = await fetch(`/api/notifications?page=${page + 1}&limit=20`);
    setNotifications([...notifications, ...data]);
    setPage(page + 1);
};
```

### Solution 5: Connection Pooling

```
PgBouncer Configuration:
  Pool Mode: transaction
  Max Connections: 100
  Min Pool Size: 10
  Reserve Pool: 5

Benefits:
  - Prevents connection exhaustion
  - Reduces query queue time
  - Distributes load across pool
```

### Recommended Hybrid Approach:

1. **Tier 1**: Redis cache (first 30 days of notifications)
2. **Tier 2**: Read replicas for cache misses
3. **Tier 3**: Materialized views for statistics
4. **Tier 4**: Aggressive pagination + lazy loading

**Expected Result:**

- DB load reduced by 95%
- Response time: <50ms
- 50,000 concurrent users supported

---

# Stage 5: Reliable Bulk Notification Implementation

## Problem

The original notify_all function failed midway (200 out of 50,000 students failed), causing unreliable notifications and poor UX.

## Solution: Message Queue + Retry Logic

```python
# services/notification_service.py

from celery import Celery
from celery.utils.log import get_task_logger
import json
import smtplib
from datetime import datetime, timedelta

app = Celery('notifications')
logger = get_task_logger(__name__)

class NotificationService:
    """Reliable notification delivery with retry logic"""

    @staticmethod
    @app.task(bind=True, max_retries=3)
    def send_email(self, student_id: str, message: str, retry_count: int = 0):
        """
        Send email with exponential backoff retry

        Args:
            student_id: Target student ID
            message: Email message body
            retry_count: Number of retry attempts
        """
        try:
            # Log the attempt
            logger.info(f"Sending email to student {student_id}, attempt {retry_count + 1}")

            # Get student email from DB
            student = db.query(f"SELECT email FROM users WHERE id = '{student_id}'")
            if not student:
                logger.error(f"Student {student_id} not found")
                return False

            # Send email
            send_email_via_provider(student.email, message)

            # Log success
            logger.info(f"Email sent successfully to {student_id}")
            save_notification_log(student_id, "email", "success", datetime.now())

            return True

        except Exception as exc:
            logger.error(f"Failed to send email to {student_id}: {str(exc)}")

            # Exponential backoff: 5s, 25s, 125s
            countdown = 5 ** (retry_count + 1)

            if retry_count < 3:
                logger.warning(f"Retrying in {countdown}s...")
                raise self.retry(exc=exc, countdown=countdown)
            else:
                logger.error(f"Email delivery failed after 3 retries for {student_id}")
                save_notification_log(student_id, "email", "failed", datetime.now())
                return False

    @staticmethod
    @app.task(bind=True, max_retries=3)
    def save_to_db(self, student_id: str, message: str, retry_count: int = 0):
        """Save notification to database with retry"""
        try:
            logger.info(f"Saving notification for student {student_id}")

            notification = {
                'user_id': student_id,
                'type': 'placement_notification',
                'title': 'Placement Alert',
                'message': message,
                'priority': 'high',
                'category': 'placement',
                'created_at': datetime.now(),
                'is_read': False
            }

            db.insert('notifications', notification)
            logger.info(f"Notification saved for {student_id}")

            return True

        except Exception as exc:
            logger.error(f"Failed to save notification for {student_id}: {str(exc)}")

            if retry_count < 3:
                countdown = 5 ** (retry_count + 1)
                raise self.retry(exc=exc, countdown=countdown)
            else:
                logger.error(f"DB save failed after 3 retries for {student_id}")
                return False

    @staticmethod
    @app.task(bind=True, max_retries=2)
    def push_to_app(self, student_id: str, message: str, retry_count: int = 0):
        """Push in-app notification with retry"""
        try:
            logger.info(f"Pushing notification to app for {student_id}")

            websocket_service.send_to_user(student_id, {
                'event': 'notification:new',
                'data': {
                    'message': message,
                    'timestamp': datetime.now().isoformat()
                }
            })

            logger.info(f"Push sent to {student_id}")
            return True

        except Exception as exc:
            logger.error(f"Failed to push to {student_id}: {str(exc)}")

            if retry_count < 2:
                countdown = 5 ** (retry_count + 1)
                raise self.retry(exc=exc, countdown=countdown)
            else:
                logger.error(f"Push failed after retries for {student_id}")
                return False

    @staticmethod
    @app.task(time_limit=3600)  # 1 hour timeout
    def notify_all(student_ids: list, message: str):
        """
        Notify multiple students reliably

        Args:
            student_ids: List of student IDs
            message: Message to send

        Returns:
            dict: Notification results
        """
        logger.info(f"Starting bulk notification for {len(student_ids)} students")

        results = {
            'total': len(student_ids),
            'successful': 0,
            'failed': 0,
            'failed_students': [],
            'timestamp': datetime.now().isoformat()
        }

        # Create celery chord for parallel execution
        from celery import chord

        callback = log_notification_results.s()

        header = [
            chord([
                send_email.s(sid, message),
                save_to_db.s(sid, message),
                push_to_app.s(sid, message)
            ])(callback)
            for sid in student_ids
        ]

        # Execute in batches to avoid queue overflow
        batch_size = 100
        for i in range(0, len(student_ids), batch_size):
            batch = student_ids[i:i+batch_size]

            for student_id in batch:
                try:
                    # Chain: save to DB first, then send email + push
                    send_email.delay(student_id, message)
                    save_to_db.delay(student_id, message)
                    push_to_app.delay(student_id, message)
                    results['successful'] += 1

                except Exception as exc:
                    logger.error(f"Failed to queue task for {student_id}: {str(exc)}")
                    results['failed'] += 1
                    results['failed_students'].append(student_id)

        logger.info(f"Bulk notification complete: {results['successful']} successful, {results['failed']} failed")
        return results

@app.task
def log_notification_results(results):
    """Log notification results for audit trail"""
    logger.info(f"Notification results: {results}")
    db.insert('notification_audit', results)
```

## Revised Pseudocode for notify_all:

```
function notify_all(student_ids, message):
    results = {
        successful: 0,
        failed: 0,
        failed_students: []
    }

    // Process in batches of 100
    for batch in chunks(student_ids, 100):
        for student_id in batch:
            try:
                // Queue tasks (non-blocking)
                queue_email_task(student_id, message)
                queue_db_save_task(student_id, message)
                queue_push_task(student_id, message)
                results.successful++
            catch error:
                results.failed++
                results.failed_students.append(student_id)
                log_error(student_id, error)

    // Retry failed notifications after 5 minutes
    schedule_retry_task(results.failed_students, message, delay=300)

    return results
```

## Improvements:

1. **Asynchronous Processing**: Tasks queued immediately, don't block
2. **Automatic Retries**: Failed notifications retry with exponential backoff
3. **Batching**: Prevents queue overflow
4. **Audit Trail**: All attempts logged for debugging
5. **Fast Response**: API responds in <1 second
6. **Reliability**: 99.9% delivery rate with retry logic

---

# Stage 6: Priority Inbox Implementation

## Priority Algorithm

Priority is determined by: **weight(type) × recency(days) × engagement(reads)**

```
Priority Score = (Type Weight × 0.5) + (Recency Score × 0.3) + (Engagement × 0.2)

Type Weights:
  - Placement: 100 (highest)
  - Result: 80
  - Event: 60 (lowest)

Recency Score = 100 / (1 + days_old)
Engagement = is_read ? 0 : 1 (unread = more important)
```

## TypeScript Implementation

```typescript
// services/priorityInbox.ts

interface Notification {
  id: string;
  userId: string;
  type: "Placement" | "Result" | "Event";
  message: string;
  isRead: boolean;
  createdAt: Date;
  priority: number;
}

interface PriorityScore {
  notificationId: string;
  score: number;
  rank: number;
}

class PriorityInbox {
  private typeWeights = {
    Placement: 100,
    Result: 80,
    Event: 60,
  };

  /**
   * Calculate priority score for a notification
   * @param notification Notification object
   * @returns Priority score (0-100)
   */
  private calculatePriorityScore(notification: Notification): number {
    // Type weight (0-100)
    const typeScore = this.typeWeights[notification.type];

    // Recency score: newer = higher priority
    const daysOld = Math.floor(
      (Date.now() - notification.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const recencyScore = 100 / (1 + daysOld);

    // Engagement: unread notifications get boost
    const engagementScore = notification.isRead ? 0 : 100;

    // Combined score with weights
    const priorityScore =
      typeScore * 0.5 + recencyScore * 0.3 + engagementScore * 0.2;

    return Math.round(priorityScore * 100) / 100;
  }

  /**
   * Get top N priority notifications
   * @param userId User ID
   * @param limit Number of notifications to return (default: 10)
   * @returns Array of top priority notifications sorted by score
   */
  async getTopPriorityNotifications(
    userId: string,
    limit: number = 10,
  ): Promise<Notification[]> {
    try {
      // Fetch all active notifications for user
      const notifications = await this.fetchUserNotifications(userId);

      // Calculate priority score for each
      const scoredNotifications = notifications.map((notif) => ({
        ...notif,
        priority: this.calculatePriorityScore(notif),
      }));

      // Sort by priority score (descending)
      const sorted = scoredNotifications.sort(
        (a, b) => b.priority - a.priority,
      );

      // Return top N
      return sorted.slice(0, limit);
    } catch (error) {
      console.error("Error fetching priority notifications:", error);
      throw error;
    }
  }

  /**
   * Get real-time priority notifications with streaming
   * Maintains top 10 continuously updated list
   */
  async *streamPriorityNotifications(userId: string, limit: number = 10) {
    let previousTop: string[] = [];

    while (true) {
      const topNotifications = await this.getTopPriorityNotifications(
        userId,
        limit,
      );
      const currentTop = topNotifications.map((n) => n.id);

      // Only emit if top N has changed
      if (JSON.stringify(currentTop) !== JSON.stringify(previousTop)) {
        yield topNotifications;
        previousTop = currentTop;
      }

      // Check for updates every 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  private async fetchUserNotifications(
    userId: string,
  ): Promise<Notification[]> {
    // Query from database/cache
    const query = `
      SELECT id, userId, type, message, isRead, createdAt
      FROM notifications
      WHERE userId = $1 AND deletedAt IS NULL
      ORDER BY createdAt DESC
    `;

    return await db.query(query, [userId]);
  }
}

export default new PriorityInbox();
```

## Python Implementation

```python
# services/priority_inbox.py

from datetime import datetime, timedelta
from typing import List, Dict
import heapq
from dataclasses import dataclass

@dataclass
class Notification:
    id: str
    user_id: str
    type: str  # 'Placement', 'Result', 'Event'
    message: str
    is_read: bool
    created_at: datetime

class PriorityInbox:
    TYPE_WEIGHTS = {
        'Placement': 100,
        'Result': 80,
        'Event': 60
    }

    def calculate_priority_score(self, notification: Notification) -> float:
        """
        Calculate priority score for a notification
        Priority = (Type Weight * 0.5) + (Recency * 0.3) + (Engagement * 0.2)
        """
        # Type weight (0-100)
        type_score = self.TYPE_WEIGHTS.get(notification.type, 0)

        # Recency score: newer = higher priority
        days_old = (datetime.now() - notification.created_at).days
        recency_score = 100 / (1 + days_old)

        # Engagement: unread notifications get boost
        engagement_score = 100 if not notification.is_read else 0

        # Combined score with weights
        priority_score = (
            (type_score * 0.5) +
            (recency_score * 0.3) +
            (engagement_score * 0.2)
        )

        return round(priority_score, 2)

    def get_top_priority_notifications(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get top N priority notifications for a user"""
        try:
            # Fetch active notifications
            notifications = self.fetch_user_notifications(user_id)

            # Calculate priority scores
            scored = [
                {
                    'notification': notif,
                    'score': self.calculate_priority_score(notif)
                }
                for notif in notifications
            ]

            # Sort by score (highest first)
            sorted_notifs = sorted(scored, key=lambda x: x['score'], reverse=True)

            # Return top N with scores
            return [
                {
                    'id': item['notification'].id,
                    'type': item['notification'].type,
                    'message': item['notification'].message,
                    'isRead': item['notification'].is_read,
                    'createdAt': item['notification'].created_at.isoformat(),
                    'priorityScore': item['score'],
                    'rank': idx + 1
                }
                for idx, item in enumerate(sorted_notifs[:limit])
            ]
        except Exception as e:
            print(f"Error fetching priority notifications: {e}")
            raise

    def fetch_user_notifications(self, user_id: str) -> List[Notification]:
        """Fetch notifications from database"""
        query = """
            SELECT id, user_id, type, message, is_read, created_at
            FROM notifications
            WHERE user_id = %s AND deleted_at IS NULL
            ORDER BY created_at DESC
        """
        results = db.query(query, (user_id,))

        return [
            Notification(
                id=row['id'],
                user_id=row['user_id'],
                type=row['type'],
                message=row['message'],
                is_read=row['is_read'],
                created_at=row['created_at']
            )
            for row in results
        ]

# Usage
priority_inbox = PriorityInbox()
top_notifications = priority_inbox.get_top_priority_notifications('user_123', limit=10)
```

## Go Implementation

```go
// services/priority_inbox.go

package services

import (
    "fmt"
    "math"
    "sort"
    "time"
)

type Notification struct {
    ID        string    `json:"id"`
    UserID    string    `json:"userId"`
    Type      string    `json:"type"` // "Placement", "Result", "Event"
    Message   string    `json:"message"`
    IsRead    bool      `json:"isRead"`
    CreatedAt time.Time `json:"createdAt"`
}

type PriorityScore struct {
    NotificationID string  `json:"notificationId"`
    Score          float64 `json:"score"`
    Rank           int     `json:"rank"`
}

type PriorityInbox struct {
    typeWeights map[string]float64
}

func NewPriorityInbox() *PriorityInbox {
    return &PriorityInbox{
        typeWeights: map[string]float64{
            "Placement": 100,
            "Result":    80,
            "Event":     60,
        },
    }
}

// CalculatePriorityScore calculates priority score for a notification
func (pi *PriorityInbox) CalculatePriorityScore(notif Notification) float64 {
    // Type weight (0-100)
    typeScore := pi.typeWeights[notif.Type]

    // Recency score: newer = higher priority
    daysOld := int(time.Since(notif.CreatedAt).Hours() / 24)
    recencyScore := 100.0 / (1.0 + float64(daysOld))

    // Engagement: unread notifications get boost
    engagementScore := 0.0
    if !notif.IsRead {
        engagementScore = 100
    }

    // Combined score with weights
    priorityScore := (typeScore * 0.5) + (recencyScore * 0.3) + (engagementScore * 0.2)

    return math.Round(priorityScore*100) / 100
}

// GetTopPriorityNotifications returns top N priority notifications
func (pi *PriorityInbox) GetTopPriorityNotifications(userID string, limit int) ([]map[string]interface{}, error) {
    // Fetch notifications from database
    notifications, err := fetchUserNotifications(userID)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch notifications: %w", err)
    }

    // Calculate scores and sort
    type scoredNotif struct {
        notification Notification
        score        float64
    }

    scored := make([]scoredNotif, len(notifications))
    for i, notif := range notifications {
        scored[i] = scoredNotif{
            notification: notif,
            score:        pi.CalculatePriorityScore(notif),
        }
    }

    // Sort by score descending
    sort.Slice(scored, func(i, j int) bool {
        return scored[i].score > scored[j].score
    })

    // Build response
    result := make([]map[string]interface{}, 0)
    for i, item := range scored {
        if i >= limit {
            break
        }
        result = append(result, map[string]interface{}{
            "id":            item.notification.ID,
            "type":          item.notification.Type,
            "message":       item.notification.Message,
            "isRead":        item.notification.IsRead,
            "createdAt":     item.notification.CreatedAt,
            "priorityScore": item.score,
            "rank":          i + 1,
        })
    }

    return result, nil
}
```

---

# Stage 7: React/Next.js Frontend Implementation

## Project Setup

```bash
# Create Next.js app
npx create-next-app@latest notifications-app --typescript --tailwind
cd notifications-app

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled axios
npm install swr  # For data fetching
npm install zustand  # For state management
```

## Store Setup (Zustand)

```typescript
// store/notificationStore.ts

import { create } from "zustand";

interface Notification {
  id: string;
  type: "Event" | "Result" | "Placement";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority?: number;
}

interface NotificationStore {
  notifications: Notification[];
  priorityNotifications: Notification[];
  filter: "all" | "unread" | "Event" | "Result" | "Placement";

  setNotifications: (notifs: Notification[]) => void;
  setPriorityNotifications: (notifs: Notification[]) => void;
  setFilter: (filter: string) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  priorityNotifications: [],
  filter: "all",

  setNotifications: (notifs) => set({ notifications: notifs }),
  setPriorityNotifications: (notifs) => set({ priorityNotifications: notifs }),
  setFilter: (filter) => set({ filter: filter as any }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

## API Client

```typescript
// lib/apiClient.ts

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://4.224.186.213/evaluation-service";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const notificationAPI = {
  getAll: (page: number = 1, limit: number = 20, type?: string) => {
    let url = `/notifications?page=${page}&limit=${limit}`;
    if (type) url += `&notification_type=${type}`;
    return apiClient.get(url);
  },

  getById: (id: string) => apiClient.get(`/notifications/${id}`),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`, { isRead: true }),

  delete: (id: string) => apiClient.delete(`/notifications/${id}`),

  getTopPriority: (limit: number = 10) =>
    apiClient.get(`/notifications/priority?limit=${limit}`),
};
```

## All Notifications Page

```typescript
// pages/notifications.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  Chip,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useSWR from 'swr';
import { notificationAPI } from '../lib/apiClient';
import { useNotificationStore } from '../store/notificationStore';

interface Notification {
  id: string;
  type: 'Event' | 'Result' | 'Placement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const { notifications, setNotifications } = useNotificationStore();

  // Fetch notifications
  const { data, isLoading, error } = useSWR(
    [`/notifications`, page, filter],
    () => notificationAPI.getAll(page, 20, filter !== 'all' ? filter : undefined),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data?.data?.data?.notifications) {
      setNotifications(data.data.data.notifications);
    }
  }, [data, setNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      // Update local state
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const typeFilters = ['all', 'Event', 'Result', 'Placement'];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1>Notifications ({unreadCount} unread)</h1>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={filter} onChange={(e, v) => { setFilter(v); setPage(1); }}>
          <Tab label="All" value="all" />
          <Tab label="Unread" value="unread" />
          <Tab label="Events" value="Event" />
          <Tab label="Results" value="Result" />
          <Tab label="Placements" value="Placement" />
        </Tabs>
      </Box>

      {/* Notifications List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load notifications</Alert>
      ) : (
        <>
          <Paper elevation={1}>
            <List>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  No notifications
                </Box>
              ) : (
                notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : '#f5f5f5',
                      borderBottom: '1px solid #e0e0e0',
                      '&:hover': { backgroundColor: '#fafafa' },
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!notification.isRead && (
                          <Button
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                            startIcon={<CheckCircleIcon />}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          size="small"
                          onClick={() => handleDelete(notification.id)}
                          startIcon={<DeleteIcon />}
                          color="error"
                        >
                          Delete
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{notification.title}</span>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={
                              notification.type === 'Placement'
                                ? 'error'
                                : notification.type === 'Result'
                                ? 'warning'
                                : 'default'
                            }
                          />
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#1976d2',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <p>{notification.message}</p>
                          <span style={{ fontSize: '0.85em', color: '#666' }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>Page {page}</span>
            <Button onClick={() => setPage(page + 1)}>Next</Button>
          </Box>
        </>
      )}
    </Container>
  );
}
```

## Priority Inbox Page

```typescript
// pages/priority-inbox.tsx

import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Button,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import useSWR from 'swr';
import { notificationAPI } from '../lib/apiClient';

interface PriorityNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priorityScore: number;
  rank: number;
}

export default function PriorityInbox() {
  const { data, isLoading, error } = useSWR(
    '/priority-notifications',
    () => notificationAPI.getTopPriority(10),
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  const notifications: PriorityNotification[] = data?.data?.data || [];

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <h1>Priority Inbox</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Top 10 most important notifications
      </p>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Box sx={{ color: 'error.main' }}>Failed to load priority notifications</Box>
      ) : (
        <Paper elevation={2}>
          <List>
            {notifications.map((notif) => (
              <ListItem
                key={notif.id}
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  '&:hover': { backgroundColor: '#f9f9f9' },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {notif.rank}
                    </Box>
                    <span style={{ fontWeight: 500, flex: 1 }}>
                      {notif.message.substring(0, 60)}...
                    </span>
                    <Chip label={notif.type} size="small" />
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={notif.isRead}
                    >
                      {notif.isRead ? 'Read' : 'Mark Read'}
                    </Button>
                  </Box>

                  {/* Priority Score Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={notif.priorityScore}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <span style={{ fontSize: '0.85em', color: '#666', minWidth: 50 }}>
                      {notif.priorityScore.toFixed(1)}%
                    </span>
                  </Box>

                  <span style={{ fontSize: '0.8em', color: '#999', marginTop: 8, display: 'block' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}
```

## Navigation Layout

```typescript
// components/Layout.tsx

import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Button, Container, Badge, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotificationStore } from '../store/notificationStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Link href="/">
              <Button color="inherit">Home</Button>
            </Link>
            <Link href="/notifications">
              <Button color="inherit">
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
                Notifications
              </Button>
            </Link>
            <Link href="/priority-inbox">
              <Button color="inherit">Priority Inbox</Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {children}
      </Container>
    </div>
  );
}
```

## Home Page

```typescript
// pages/index.tsx

import React from 'react';
import { Container, Paper, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <h1>College Notification Platform Notifications</h1>
        <p style={{ fontSize: '1.2em', color: '#666', marginBottom: 32 }}>
          Stay updated with your medical appointments, prescriptions, and important alerts
        </p>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/notifications">
            <Button variant="contained" size="large">
              View All Notifications
            </Button>
          </Link>
          <Link href="/priority-inbox">
            <Button variant="outlined" size="large">
              Priority Inbox (Top 10)
            </Button>
          </Link>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'left' }}>
          <h3>Features:</h3>
          <ul>
            <li>📬 All notifications with filtering by type</li>
            <li>⭐ Priority inbox with smart ranking</li>
            <li>✅ Mark as read/unread</li>
            <li>🗑️ Delete notifications</li>
            <li>📱 Fully responsive design</li>
            <li>🎨 Material UI components</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
}
```

---
