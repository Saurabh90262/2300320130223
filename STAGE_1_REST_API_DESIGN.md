# Stage 1: REST API Design

This is the foundation of our notification system. We needed to design a clean API that could handle all the core operations users need - sending notifications, checking them, updating preferences, and getting real-time updates.

## What We're Building

The API handles these main operations:

- Sending notifications to users
- Retrieving notifications with filters and pagination
- Marking notifications as read
- Deleting old notifications
- Managing user notification preferences
- Real-time updates via WebSocket

## The Endpoints

**POST /api/notifications** - Create a new notification

Send a notification to a user. You pass the user ID, notification type (placement, result, or event), title, message, and any extra metadata.

**GET /api/notifications/:userId** - Get all notifications

Fetch all notifications for a user. Supports pagination and filtering by type and read status.

**GET /api/notifications/:userId/priority/top** - Get top 10 notifications

Returns the user's most important notifications ranked by our priority algorithm.

**PATCH /api/notifications/:id/read** - Mark as read

Toggle a notification's read status.

**DELETE /api/notifications/:id** - Delete a notification

Remove a notification permanently.

**GET/PATCH /api/notifications/:userId/preferences** - Manage preferences

Let users control what kinds of notifications they get and how often.

**POST /api/notifications/bulk/send** - Send to multiple users

Batch operation for sending the same notification to many users at once.

## Real-time Updates

We use WebSocket for live notifications. When something happens, the server immediately sends it to the connected client instead of making them poll the API constantly.

When a new notification arrives, the client receives:

```json
{
  "event": "notification:new",
  "type": "placement",
  "title": "Interview Scheduled",
  "message": "You have an interview tomorrow at 10 AM"
}
```
