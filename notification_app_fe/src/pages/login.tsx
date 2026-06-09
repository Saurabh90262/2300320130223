import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import { Log } from 'logging-middleware';
import { userAPI } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { Layout } from '../components/Layout';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useNotificationStore((state) => state.setUser);
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data =
        tab === 0
          ? await userAPI.login(email, password)
          : await userAPI.register(email, name, password);

      if (!data?.user || !data?.token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      Log(
        'frontend',
        'info',
        'auth',
        `${tab === 0 ? 'Login' : 'Registration'} successful for ${data.user.email}`,
      );

      router.push('/notifications');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Authentication failed';
      setError(message);
      Log('frontend', 'error', 'auth', `Authentication failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ py: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            College Notification Portal
          </Typography>

          <Card>
            <CardContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {tab === 1 && (
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />
                )}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : tab === 0 ? 'Login' : 'Register'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Layout>
  );
}
