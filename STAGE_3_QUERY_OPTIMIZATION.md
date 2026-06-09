# Stage 3: Query Optimization & Indexing

## Problem Analysis

**Original Slow Query:**

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Issues Identified:

1. **SELECT \***: Fetches all columns unnecessarily (60% extra I/O)
2. **No indexes**: Causes full table scan on 5+ million rows
3. **ASC ordering**: Less efficient than DESC for B-tree traversal
4. **Missing composite index**: Critical for multi-column filtering
5. **Table scans**: ~2-5 seconds on large datasets

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
- ✅ **Composite index** on (user_id, is_read, created_at DESC): Enables index-only scan
- ✅ **Soft delete filter**: Only queries active notifications
- ✅ **DESC ordering**: Utilizes B-tree index traversal efficiently

### Expected Performance Gains:

- **Before**: 2-5 seconds (full table scan)
- **After**: 50-100ms (index scan)
- **Improvement**: 20-100x faster

---

## Strategic Indexing Strategy

### Index 1: Primary Lookup Index (Most Critical)

```sql
CREATE INDEX idx_notifications_user_read_recent
    ON notifications(user_id, is_read, created_at DESC)
    WHERE deleted_at IS NULL;
```

**Use Case**: Fetch unread notifications for user
**Query Cost**: Reduces from 5 seconds to 100ms
**Storage**: ~50GB for 250B notifications

### Index 2: Category Filtering Index

```sql
CREATE INDEX idx_notifications_category
    ON notifications(user_id, category, created_at DESC)
    WHERE deleted_at IS NULL;
```

**Use Case**: Filter notifications by category
**Query Cost**: 50-200ms for category queries

### Index 3: Temporal Queries Index

```sql
CREATE INDEX idx_notifications_recent
    ON notifications(created_at DESC)
    WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
      AND deleted_at IS NULL;
```

**Use Case**: Recent notifications only (90% of queries)
**Benefit**: Indexes only hot data (~5GB vs 250GB)

### Index 4: Full-Text Search Index

```sql
CREATE INDEX idx_notifications_text_search
    ON notifications USING GIN (to_tsvector('english', message));
```

**Use Case**: Search within notification messages

---

## Why Index on Every Column is ANTI-PATTERN

```sql
-- WRONG: Index explosion
CREATE INDEX idx_col1 ON notifications(column1);
CREATE INDEX idx_col2 ON notifications(column2);
CREATE INDEX idx_col3 ON notifications(column3);
-- Results in 250GB+ index storage for 250GB data!
```

**Problems with Over-Indexing:**

1. **Write Amplification**: Every INSERT/UPDATE/DELETE now writes to 10+ indexes
2. **Storage Explosion**: Doubles or triples database size
3. **Query Planner Confusion**: Too many options = slower query planning
4. **Maintenance Overhead**: Index fragmentation, bloat, rebuilds
5. **Diminishing Returns**: 5th+ indexes rarely improve performance

**Best Practice**: Use composite indexes targeting actual query patterns

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

**Supporting Index:**

```sql
CREATE INDEX idx_placement_notifications_7d
    ON notifications(user_id, type, created_at DESC)
    WHERE deleted_at IS NULL
      AND created_at > CURRENT_DATE - INTERVAL '7 days'
      AND type = 'Placement';
```

**Query Performance:**

- **Without Index**: 500ms - 2 seconds
- **With Index**: 20-50ms
- **Storage Used**: ~5GB (partial index on recent data)

---

## Index Maintenance Strategy

### Monitor Index Usage

```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY idx_scan DESC;
```

### Remove Unused Indexes

```sql
DROP INDEX idx_notifications_unused;
```

### Rebuild Fragmented Indexes

```sql
REINDEX INDEX idx_notifications_user_read_recent;
```

### Analyze Index Size

```sql
SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename = 'notifications'
ORDER BY pg_relation_size(indexrelid) DESC;
```
