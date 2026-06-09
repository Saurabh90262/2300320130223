import { create } from 'zustand';
import { Log } from 'logging-middleware';
import { Notification, User, NotificationPreferences } from '../types';

interface NotificationStore {
  // State
  notifications: Notification[];
  priorityNotifications: Notification[];
  unreadCount: number;
  filter: {
    type?: string;
    read?: boolean;
    category?: string;
  };
  user: User | null;
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  setPriorityNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  setFilter: (filter: NotificationStore['filter']) => void;
  setUser: (user: User | null) => void;
  setPreferences: (preferences: NotificationPreferences | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  filteredNotifications: () => Notification[];
  getNotificationsByType: (type: string) => Notification[];
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // State
  notifications: [],
  priorityNotifications: [],
  unreadCount: 0,
  filter: {},
  user: null,
  preferences: null,
  loading: false,
  error: null,

  // Actions
  setNotifications: (notifications) => set({ notifications }),
  setPriorityNotifications: (priorityNotifications) => set({ priorityNotifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setFilter: (filter) => set({ filter }),
  setUser: (user) => {
    Log(
      'frontend',
      'info',
      'state',
      user ? `User session set: ${user.email}` : 'User session cleared',
    );
    set({ user });
  },
  setPreferences: (preferences) => set({ preferences }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Computed
  filteredNotifications: () => {
    const { notifications, filter } = get();
    return notifications.filter(n => {
      if (filter.type && n.type !== filter.type) return false;
      if (filter.read !== undefined && n.read !== filter.read) return false;
      if (filter.category && n.category !== filter.category) return false;
      return true;
    });
  },

  getNotificationsByType: (type: string) => {
    return get().notifications.filter(n => n.type === type);
  },
}));
