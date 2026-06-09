# Stage 7: React/Next.js Frontend Implementation

## Project Setup

```bash
npx create-next-app@latest notifications-app --typescript --tailwind
cd notifications-app

npm install @mui/material @emotion/react @emotion/styled axios
npm install swr zustand
```

---

## Store Setup (Zustand)

```typescript
// store/notificationStore.ts

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'Event' | 'Result' | 'Placement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority?: number;
}

interface NotificationStore {
  notifications: Notification[];
  priorityNotifications: Notification[];
  filter: 'all' | 'unread' | 'Event' | 'Result' | 'Placement';
  
  setNotifications: (notifs: Notification[]) => void;
  setPriorityNotifications: (notifs: Notification[]) => void;
  setFilter: (filter: string) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  priorityNotifications: [],
  filter: 'all',
  
  setNotifications: (notifs) => set({ notifications: notifs }),
  setPriorityNotifications: (notifs) => set({ priorityNotifications: notifs }),
  setFilter: (filter) => set({ filter: filter as any }),
  
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  
  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

---

## API Client

```typescript
// lib/apiClient.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://4.224.186.213/evaluation-service';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notificationAPI = {
  getAll: (page: number = 1, limit: number = 20, type?: string) => {
    let url = `/notifications?page=${page}&limit=${limit}`;
    if (type) url += `&notification_type=${type}`;
    return apiClient.get(url);
  },
  
  getById: (id: string) => apiClient.get(`/notifications/${id}`),
  
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, { isRead: true }),
  
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  
  getTopPriority: (limit: number = 10) => apiClient.get(`/notifications/priority?limit=${limit}`),
};
```

---

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
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
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

---

## Priority Inbox Page

```typescript
// pages/priority-inbox.tsx

import React from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
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
    { refreshInterval: 30000 }
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

---

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

---

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
        <h1>College Notifications</h1>
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
            <li>⚡ Real-time updates with SWR</li>
            <li>🏪 State management with Zustand</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
}
```

---

## Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Access at http://localhost:3000
```

---

## Key Features

✅ **All Notifications Page**
- Display all notifications with type badges
- Filter by notification type (Event, Result, Placement)
- Pagination (20 items per page)
- Mark as read/unread
- Delete notifications

✅ **Priority Inbox Page**
- Display top 10 notifications sorted by priority score
- Visual priority score bar (0-100)
- Rank number display
- Auto-refresh every 30 seconds
- Real-time priority updates

✅ **UI/UX**
- Material UI components
- Responsive design (mobile + desktop)
- Unread notification badge on navigation
- Smooth transitions and loading states
- Clean, intuitive interface

✅ **State Management**
- Zustand for lightweight store
- SWR for data fetching
- Caching and revalidation

✅ **Performance**
- Lazy loading with pagination
- Efficient API calls
- Client-side caching
- Optimized re-renders
