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

- **Data Volume**: With 50,000 students × 5,000,000 notifications = 250 billion potential
- **Query Patterns**: Heavy read operations (notifications fetched on every page load)
- **Storage**: ~250GB for full dataset at 1KB per notification
- **Challenges**: Efficient pagination, preventing table scans, maintaining query performance

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

-- Strategic Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_category ON notifications(user_id, category);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_active_notifications ON notifications(user_id, created_at DESC)
    WHERE deleted_at IS NULL AND created_at > CURRENT_TIMESTAMP - INTERVAL '90 days';
CREATE INDEX idx_notifications_metadata ON notifications USING GIN (metadata);
CREATE INDEX idx_preferences_user_id ON notification_preferences(user_id);
```

## Core Database Queries

### Get Unread Notifications

```sql
SELECT id, type, title, message, priority, category, metadata, created_at
FROM notifications
WHERE user_id = $1
  AND is_read = false
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### Get by Category

```sql
SELECT id, type, title, message, priority, category, created_at, is_read
FROM notifications
WHERE user_id = $1
  AND category = $2
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

### Get Last 7 Days

```sql
SELECT id, type, title, message, priority, created_at
FROM notifications
WHERE user_id = $1
  AND type = 'Placement'
  AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND deleted_at IS NULL;
```

### Statistics

```sql
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_read = false) as unread,
    COUNT(DISTINCT category) as categories
FROM notifications
WHERE user_id = $1 AND deleted_at IS NULL;
```

## Scalability Strategy

### Partitioning

```sql
CREATE TABLE notifications_2026_06 PARTITION OF notifications
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

### Archival

```sql
INSERT INTO notifications_archive
SELECT * FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
DELETE FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
```

### Caching with Redis

- Cache recent notifications (last 30 days)
- 24-hour TTL
- Invalidate on read/delete operations
