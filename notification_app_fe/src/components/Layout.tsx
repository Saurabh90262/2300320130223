import React, { ReactNode } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Log } from 'logging-middleware';
import { useNotificationStore } from '../store/notificationStore';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const user = useNotificationStore((state) => state.user);
  const setUser = useNotificationStore((state) => state.setUser);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'All Notifications', href: '/notifications' },
    { label: 'Priority Inbox', href: '/priority-inbox' },
    { label: 'Settings', href: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    Log('frontend', 'info', 'auth', 'User logged out');
    router.push('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            College Notifications
          </Typography>
          <Link href="/notifications">
            <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Link>
          <Typography variant="body2" sx={{ ml: 2, mr: 2 }}>
            {user?.name || 'Guest'}
          </Typography>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button color="inherit">Login</Button>
            </Link>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.href}>
                <Link href={item.href}>
                  <ListItem button onClick={() => setSidebarOpen(false)}>
                    <ListItemText primary={item.label} />
                  </ListItem>
                </Link>
                {idx < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, mt: 8, p: 2 }}>{children}</Box>
    </Box>
  );
};
