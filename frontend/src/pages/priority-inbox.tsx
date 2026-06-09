import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Grid, Card, CardContent, Typography } from '@mui/material';
import useSWR from 'swr';
import { notificationAPI } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationCard } from '../components/NotificationCard';
import { Layout } from '../components/Layout';
import { Notification } from '../types';
import { useNotificationSocket } from '../hooks/useWebSocket';

export default function PriorityInboxPage() {
  const user = useNotificationStore(state => state.user);
  const userId = user?._id || '';
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data, isLoading } = useSWR(
    userId ? `/priority/${userId}` : null,
    async () => {
      if (!userId) return null;
      return notificationAPI.getTopPriority(userId, 10);
    },
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Real-time updates via WebSocket
  useNotificationSocket(userId, (newNotification) => {
    console.log('New notification received:', newNotification);
    // Refresh priority inbox
    if (data) {
      mutate(`/priority/${userId}`);
    }
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);

  if (!userId) return <Layout><Box>Please log in first</Box></Layout>;
  if (isLoading) return <Layout><Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box></Layout>;

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            ⭐ Priority Inbox
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your top 10 most important notifications ranked by algorithm
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {notifications.length > 0 && (
            <Grid item xs={12} sm={4}>
              <Card sx={{ backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Average Priority Score
                  </Typography>
                  <Typography variant="h4">
                    {(notifications.reduce((sum, n) => sum + (n.priorityScore || 0), 0) / notifications.length).toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4 }}>
          {notifications.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
                  No priority notifications yet 🎉
                </Typography>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n, idx) => (
              <Box key={n._id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 2, minWidth: 40 }}>
                    #{idx + 1}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <NotificationCard
                      notification={n}
                      onMarkAsRead={async (id) => {
                        await notificationAPI.markAsRead(id);
                        setNotifications(notifications.filter(x => x._id !== id));
                      }}
                      onDelete={async (id) => {
                        await notificationAPI.delete(id);
                        setNotifications(notifications.filter(x => x._id !== id));
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Container>
    </Layout>
  );
}
