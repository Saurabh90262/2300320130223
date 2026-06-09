# College Notification System

A full-stack notification platform for colleges. Sends alerts about placement drives, exam results, and campus events to students.

## What's Here

Built incrementally over 7 stages:

1. **API Design** — REST endpoints and request/response contracts
2. **Database** — MongoDB schema with indexes
3. **Query Speed** — strategic indexing for fast reads
4. **Scale** — Redis caching under high load
5. **Bulk Sends** — task queue with retries for mass notifications
6. **Smart Sorting** — priority inbox ranking algorithm
7. **Frontend** — React/Next.js UI with real-time WebSocket updates

## Getting It Running

Prerequisites: Node.js 18+, MongoDB, Redis

**Backend:**

```bash
cd notification_app_be
npm install
cp .env.example .env
npm run dev
```

**Frontend:**

```bash
cd notification_app_fe
npm install
cp .env.example .env.local
npm run dev
```

**Seed demo data (optional):**

```bash
cd notification_app_be
npm run seed
# Login: demo@college.edu / demo1234
```

Open `http://localhost:3000` and sign in at `/login`.

## Project Layout

```
logging_middleware/         # Reusable Log(stack, level, package, message) package
notification_app_be/        # Node.js/Express API
notification_app_fe/          # React/Next.js + TypeScript frontend
notification_system_design.md # Architecture and API design
```

## Evaluation Service Setup

Add your registration credentials to `notification_app_be/.env`:

```
EVALUATION_SERVICE_URL=http://4.224.186.213/evaluation-service
EVALUATION_CLIENT_ID=...
EVALUATION_CLIENT_SECRET=...
EVALUATION_ACCESS_TOKEN=...
```

## Stack

Node.js/Express backend, React/Next.js frontend (TypeScript), MongoDB, Redis, Socket.IO, Material UI.
