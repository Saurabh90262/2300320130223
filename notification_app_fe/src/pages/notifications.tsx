import React, { useState, useEffect } from 'react';
import { Log } from 'logging-middleware';
import { Container, Box, Pagination, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import useSWR, { mutate } from 'swr';
import { notificationAPI } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationCard } from '../components/NotificationCard';
import { Layout } from '../components/Layout';
import { Notification } from '../types';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const user = useNotificationStore(state => state.user);
  const userId = user?._id || '';

  useEffect(() => {
    if (userId) {
      Log('frontend', 'info', 'page', `Notifications page loaded for user ${userId}`);
    }
  }, [userId]);

  const { data, isLoading, error } = useSWR(
    userId ? [`/notifications/${userId}`, page, typeFilter, readFilter] : null,
    async () => {
      if (!userId) return null;
      return notificationAPI.getAll(
        userId,
        page,
        20
      );
    },
    { revalidateOnFocus: false, dedupingInterval: 0 }
  );

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationAPI.markAsRead(notificationId);
    mutate(`/notifications/${userId}`);
  };

  const handleDelete = async (notificationId: string) => {
    await notificationAPI.delete(notificationId);
    mutate(`/notifications/${userId}`);
  };

  if (!userId) return <Layout><Box>Please log in first</Box></Layout>;
  if (isLoading) return <Layout><Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box></Layout>;
  if (error) return <Layout><Box>Error loading notifications</Box></Layout>;

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="placement">Placement</MenuItem>
              <MenuItem value="result">Result</MenuItem>
              <MenuItem value="event">Event</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={readFilter} label="Status" onChange={(e) => setReadFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="false">Unread</MenuItem>
              <MenuItem value="true">Read</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          {notifications.map((n: Notification) => (
            <NotificationCard
              key={n._id}
              notification={n}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      </Container>
    </Layout>
  );
}
