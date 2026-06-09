import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { Log } from 'logging-middleware';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const typeColors = {
    placement: '#4CAF50',
    result: '#2196F3',
    event: '#FF9800',
  };

  const categoryColors = {
    urgent: '#F44336',
    important: '#FF9800',
    normal: '#9C27B0',
  };

  useEffect(() => {
    Log(
      'frontend',
      'debug',
      'component',
      `Rendered notification card id=${notification._id} type=${notification.type}`,
    );
  }, [notification._id, notification.type]);

  return (
    <Card sx={{ mb: 2, opacity: notification.read ? 0.6 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {notification.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {notification.message}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={notification.type}
                size="small"
                sx={{ backgroundColor: typeColors[notification.type], color: 'white' }}
              />
              <Chip
                label={notification.category}
                size="small"
                sx={{ backgroundColor: categoryColors[notification.category], color: 'white' }}
              />
              <Chip
                label={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                size="small"
              />
            </Box>
          </Box>
          {notification.priorityScore && (
            <Box sx={{ ml: 2, minWidth: 100 }}>
              <Typography variant="caption">Priority</Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((notification.priorityScore / 100) * 100, 100)}
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {notification.priorityScore.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
        {!notification.read && (
          <Box sx={{ mt: 2 }}>
            <button onClick={() => onMarkAsRead(notification._id)}>Mark as Read</button>
            <button onClick={() => onDelete(notification._id)} style={{ marginLeft: 10 }}>Delete</button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
