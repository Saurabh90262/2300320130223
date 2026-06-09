import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Log } from 'logging-middleware';
import { useNotificationStore } from '../store/notificationStore';
import { User } from '../types';

const theme = createTheme({
  palette: {
    primary: { main: '#2196F3' },
    secondary: { main: '#4CAF50' },
  },
});

function SessionBootstrap() {
  const setUser = useNotificationStore((state) => state.setUser);

  useEffect(() => {
    Log('frontend', 'info', 'config', 'Application initialized');

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setUser(user);
        Log('frontend', 'debug', 'state', `Session restored for user ${user.email}`);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Log('frontend', 'warn', 'state', 'Invalid stored session cleared');
      }
    }
  }, [setUser]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionBootstrap />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
