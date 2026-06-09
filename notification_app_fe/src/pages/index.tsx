import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import { Layout } from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
            🏥 Welcome to AffordMed Notifications
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
            Stay updated with your placement status, exam results, and campus events
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
            {[
              {
                title: '📢 Placement Updates',
                description: 'Get instant notifications about placement drives, interviews, and results',
                color: '#4CAF50',
              },
              {
                title: '📊 Exam Results',
                description: 'Receive alerts as soon as your exam results are published',
                color: '#2196F3',
              },
              {
                title: '🎉 Campus Events',
                description: 'Never miss important college events and announcements',
                color: '#FF9800',
              },
            ].map((feature, idx) => (
              <Card key={idx} sx={{ backgroundColor: feature.color, color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">{feature.description}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/notifications">
              <Button variant="contained" size="large" sx={{ backgroundColor: '#4CAF50' }}>
                📬 View All Notifications
              </Button>
            </Link>
            <Link href="/priority-inbox">
              <Button variant="outlined" size="large">
                ⭐ Priority Inbox
              </Button>
            </Link>
          </Box>

          <Card sx={{ mt: 6, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Key Features
              </Typography>
              <ul>
                <li>✅ Real-time notifications via WebSocket</li>
                <li>✅ Smart priority ranking algorithm</li>
                <li>✅ Bulk notification delivery (99.9% guarantee)</li>
                <li>✅ Advanced caching for <50ms response time</li>
                <li>✅ Customizable notification preferences</li>
                <li>✅ Read/unread tracking with visual indicators</li>
              </ul>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Layout>
  );
}
