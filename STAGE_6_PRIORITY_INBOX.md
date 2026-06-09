# Stage 6: Priority Inbox Implementation

## Priority Algorithm

Priority Score = (Type Weight × 0.5) + (Recency Score × 0.3) + (Engagement × 0.2)

```
Type Weights:
  - Placement: 100 (highest)
  - Result: 80
  - Event: 60 (lowest)

Recency Score = 100 / (1 + days_old)
Engagement = is_read ? 0 : 100 (unread = more important)
```

---

## TypeScript Implementation

```typescript
// services/priorityInbox.ts

interface Notification {
  id: string;
  userId: string;
  type: 'Placement' | 'Result' | 'Event';
  message: string;
  isRead: boolean;
  createdAt: Date;
  priority: number;
}

class PriorityInbox {
  private typeWeights = {
    'Placement': 100,
    'Result': 80,
    'Event': 60
  };

  private calculatePriorityScore(notification: Notification): number {
    const typeScore = this.typeWeights[notification.type];
    const daysOld = Math.floor(
      (Date.now() - notification.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyScore = 100 / (1 + daysOld);
    const engagementScore = notification.isRead ? 0 : 100;

    return (typeScore * 0.5) + (recencyScore * 0.3) + (engagementScore * 0.2);
  }

  async getTopPriorityNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
    const notifications = await this.fetchUserNotifications(userId);

    const scored = notifications.map(notif => ({
      ...notif,
      priority: this.calculatePriorityScore(notif)
    }));

    const sorted = scored.sort((a, b) => b.priority - a.priority);
    return sorted.slice(0, limit);
  }

  private async fetchUserNotifications(userId: string): Promise<Notification[]> {
    const query = `
      SELECT id, userId, type, message, isRead, createdAt
      FROM notifications
      WHERE userId = $1 AND deletedAt IS NULL
      ORDER BY createdAt DESC
    `;
    
    return await db.query(query, [userId]);
  }
}
```

---

## Python Implementation

```python
# services/priority_inbox.py

from datetime import datetime
from dataclasses import dataclass

@dataclass
class Notification:
    id: str
    user_id: str
    type: str
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
        """Calculate priority score (0-100 scale)"""
        type_score = self.TYPE_WEIGHTS.get(notification.type, 0)
        days_old = (datetime.now() - notification.created_at).days
        recency_score = 100 / (1 + days_old)
        engagement_score = 100 if not notification.is_read else 0
        
        priority = (type_score * 0.5) + (recency_score * 0.3) + (engagement_score * 0.2)
        return round(priority, 2)
    
    def get_top_priority_notifications(self, user_id: str, limit: int = 10) -> list:
        """Get top N priority notifications for user"""
        notifications = self.fetch_user_notifications(user_id)
        
        scored = [
            {
                'notification': notif,
                'score': self.calculate_priority_score(notif)
            }
            for notif in notifications
        ]
        
        sorted_notifs = sorted(scored, key=lambda x: x['score'], reverse=True)
        
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
```

---

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
    Type      string    `json:"type"`
    Message   string    `json:"message"`
    IsRead    bool      `json:"isRead"`
    CreatedAt time.Time `json:"createdAt"`
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

func (pi *PriorityInbox) CalculatePriorityScore(notif Notification) float64 {
    typeScore := pi.typeWeights[notif.Type]
    daysOld := int(time.Since(notif.CreatedAt).Hours() / 24)
    recencyScore := 100.0 / (1.0 + float64(daysOld))
    
    engagementScore := 0.0
    if !notif.IsRead {
        engagementScore = 100
    }

    priorityScore := (typeScore * 0.5) + (recencyScore * 0.3) + (engagementScore * 0.2)
    return math.Round(priorityScore*100) / 100
}

func (pi *PriorityInbox) GetTopPriorityNotifications(userID string, limit int) ([]map[string]interface{}, error) {
    notifications, err := fetchUserNotifications(userID)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch notifications: %w", err)
    }

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

    sort.Slice(scored, func(i, j int) bool {
        return scored[i].score > scored[j].score
    })

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

## Priority Scoring Examples

### Example 1: Placement Notification (1 day old, unread)
- Type Score: 100 × 0.5 = 50
- Recency: 100/(1+1) × 0.3 = 15
- Engagement: 100 × 0.2 = 20
- **Total: 85** ⭐ TOP PRIORITY

### Example 2: Result Notification (3 days old, read)
- Type Score: 80 × 0.5 = 40
- Recency: 100/(1+3) × 0.3 = 6
- Engagement: 0 × 0.2 = 0
- **Total: 46** 

### Example 3: Event Notification (7 days old, unread)
- Type Score: 60 × 0.5 = 30
- Recency: 100/(1+7) × 0.3 = 3.75
- Engagement: 100 × 0.2 = 20
- **Total: 53.75**

---

## Testing

```python
# Test cases
priority_inbox = PriorityInbox()

# Mock notifications
notifications = [
    Notification("1", "user1", "Event", "Farewell Event", True, datetime.now() - timedelta(days=1)),
    Notification("2", "user1", "Result", "Mid-sem Results", False, datetime.now() - timedelta(days=2)),
    Notification("3", "user1", "Placement", "CSX hiring", False, datetime.now()),
]

# Should return in order: Placement > Result > Event
top_10 = priority_inbox.get_top_priority_notifications("user1", 10)
assert top_10[0]['id'] == "3"  # Placement
assert top_10[1]['id'] == "2"  # Result
assert top_10[2]['id'] == "1"  # Event
```

## Summary

- Placement notifications prioritized highest (weight: 100)
- Recent unread notifications ranked higher
- Efficient algorithm: O(n log n) sorting
- Maintains top 10 continuously updated
- Language-agnostic implementation (TS, Python, Go)
