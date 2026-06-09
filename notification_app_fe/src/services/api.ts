import axios from 'axios';
import { Notification, User, NotificationPreferences, ApiResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationAPI = {
  // Get all notifications
  getAll: async (userId: string, page = 1, limit = 20) => {
    const res = await api.get<ApiResponse<any>>(`/notifications/${userId}`, {
      params: { page, limit },
    });
    return res.data.data;
  },

  // Get notification by ID
  getById: async (userId: string, notificationId: string) => {
    const res = await api.get<ApiResponse<Notification>>(
      `/notifications/${userId}/detail/${notificationId}`
    );
    return res.data.data;
  },

  // Get top priority notifications
  getTopPriority: async (userId: string, limit = 10) => {
    const res = await api.get<ApiResponse<Notification[]>>(
      `/notifications/${userId}/priority/top`,
      { params: { limit } }
    );
    return res.data.data;
  },

  // Get unread count
  getUnreadCount: async (userId: string) => {
    const res = await api.get<ApiResponse<{ unreadCount: number }>>(
      `/notifications/${userId}/unread/count`
    );
    return res.data.data?.unreadCount || 0;
  },

  // Create notification
  create: async (notification: Partial<Notification>) => {
    const res = await api.post<ApiResponse<Notification>>(
      '/notifications',
      notification
    );
    return res.data.data;
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const res = await api.patch<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    return res.data.data;
  },

  // Delete notification
  delete: async (notificationId: string) => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get preferences
  getPreferences: async (userId: string) => {
    const res = await api.get<ApiResponse<NotificationPreferences>>(
      `/notifications/${userId}/preferences`
    );
    return res.data.data;
  },

  // Update preferences
  updatePreferences: async (userId: string, preferences: Partial<NotificationPreferences>) => {
    const res = await api.patch<ApiResponse<NotificationPreferences>>(
      `/notifications/${userId}/preferences`,
      preferences
    );
    return res.data.data;
  },

  // Bulk send notifications
  bulkSend: async (payload: { userIds: string[]; type: string; title: string; message: string }) => {
    const res = await api.post('/notifications/bulk/send', payload);
    return res.data.data;
  },
};

export const userAPI = {
  // Register
  register: async (email: string, name: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/users/register',
      { email, name, password }
    );
    return res.data.data;
  },

  // Login
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/users/login',
      { email, password }
    );
    return res.data.data;
  },

  // Get profile
  getProfile: async (userId: string) => {
    const res = await api.get<ApiResponse<User>>(`/users/${userId}/profile`);
    return res.data.data;
  },

  // Update profile
  updateProfile: async (userId: string, data: Partial<User>) => {
    const res = await api.patch<ApiResponse<User>>(
      `/users/${userId}/profile`,
      data
    );
    return res.data.data;
  },
};

export default api;
