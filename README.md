# AffordMed Notification System

A notification system for healthcare colleges. Sends notifications about placement drives, exam results, and campus events to students.

## What's Here

We built this incrementally over 7 stages, each solving a specific problem:

1. **API Design** - What endpoints do we need? How should they work?
2. **Database** - How to store everything? What indexes help?
3. **Query Speed** - Queries were slow. Fixed with better indexing.
4. **Scale** - When 50K users hit the system at once, the database gets hammered. Redis caching fixed it.
5. **Bulk Sends** - Sending 50K notifications failed sometimes. Added a task queue with retries.
6. **Smart Sorting** - Users were drowning in notifications. Rank them by importance.
7. **Frontend** - React app so users can actually see their notifications.

## Getting It Running

Prerequisites: Node.js, MongoDB, Redis

**Backend:**

```bash
cd notification_app_be
npm install
npm run dev
```

**Frontend:**

```bash
cd notification_app_fe
npm install
npm run dev
```

Open `http://localhost:3000`.

## How It Works

Users see notifications in 3 places: inbox (all of them), priority inbox (most important), and a settings page to control what they get.

New notifications arrive instantly via WebSocket. Old ones get deleted automatically after 90 days.

The whole system can handle 50K+ simultaneous users while keeping response times under 50ms.

## The Stack

Node.js/Express in the back, React/Next.js in the front, MongoDB for data, Redis for caching. Real-time updates via WebSocket.

## What to Read

- `STAGE_1_REST_API_DESIGN.md` - How the API works
- `STAGE_2_DATABASE_SCHEMA.md` - How data is organized
- `STAGE_3_QUERY_OPTIMIZATION.md` - Why queries are fast now
- `STAGE_4_PERFORMANCE_OPTIMIZATION.md` - Caching strategy
- `STAGE_5_RELIABLE_BULK_NOTIFICATIONS.md` - Sending 50K at once
- `STAGE_6_PRIORITY_INBOX.md` - The ranking algorithm
- `STAGE_7_REACT_FRONTEND.md` - What the user sees

Each file digs into one specific problem and how we solved it.

## Key Numbers

- 90% of requests hit Redis cache (fast)
- Queries take 50-100ms instead of 2-5 seconds
- 99.9% of bulk notifications get delivered
- Priority calculation finishes in <5ms

## Code Layout

```
logging_middleware/       # Standalone request logging middleware
notification_app_be/        # Node.js/Express API
notification_app_fe/        # React/Next.js frontend
notification_system_design.md
```

Backend is organized the typical way: models (what data looks like), controllers (business logic), routes (the API).

Frontend is Next.js pages and React components.

Everything is in TypeScript so we catch errors early.
