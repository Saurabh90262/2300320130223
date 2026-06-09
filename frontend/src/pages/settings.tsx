import React, { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Typography, Switch, FormControlLabel, Button, Alert } from '@mui/material';
import { notificationAPI } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { Layout } from '../components/Layout';
import { NotificationPreferences } from '../types';

export default function SettingsPage() {
  const user = useNotificationStore(state => state.user);
  const userId = user?._id || '';
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const data = await notificationAPI.getPreferences(userId);
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    try {
      await notificationAPI.updatePreferences(userId, preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  if (!userId) return <Layout><Box>Please log in first</Box></Layout>;
  if (!preferences) return <Layout><Box><Typography>Loading...</Typography></Box></Layout>;

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>
            ⚙️ Notification Settings
          </Typography>

          {saved && <Alert severity="success">Settings saved successfully!</Alert>}

          {/* Notification Channels */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notification Channels
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.channels.email}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        channels: { ...preferences.channels, email: e.target.checked },
                      })
                    }
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.channels.push}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        channels: { ...preferences.channels, push: e.target.checked },
                      })
                    }
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.channels.inApp}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        channels: { ...preferences.channels, inApp: e.target.checked },
                      })
                    }
                  />
                }
                label="In-App Notifications"
              />
            </CardContent>
          </Card>

          {/* Notification Categories */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notification Categories
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.categories.placement.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        categories: {
                          ...preferences.categories,
                          placement: { ...preferences.categories.placement, enabled: e.target.checked },
                        },
                      })
                    }
                  />
                }
                label="Placement Updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.categories.result.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        categories: {
                          ...preferences.categories,
                          result: { ...preferences.categories.result, enabled: e.target.checked },
                        },
                      })
                    }
                  />
                }
                label="Exam Results"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.categories.event.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        categories: {
                          ...preferences.categories,
                          event: { ...preferences.categories.event, enabled: e.target.checked },
                        },
                      })
                    }
                  />
                }
                label="Campus Events"
              />
            </CardContent>
          </Card>

          {/* Do Not Disturb */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Do Not Disturb
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.doNotDisturb.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        doNotDisturb: { ...preferences.doNotDisturb, enabled: e.target.checked },
                      })
                    }
                  />
                }
                label="Enable Do Not Disturb"
              />
            </CardContent>
          </Card>

          <Button variant="contained" onClick={handleSave} fullWidth>
            Save Settings
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}
