export interface Notification {
  _id: string;
  userId: string;
  type: 'placement' | 'result' | 'event';
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  category: 'urgent' | 'important' | 'normal';
  actionUrl?: string;
  metadata?: Record<string, any>;
  priorityScore?: number;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'coordinator';
  unreadCount: number;
  preferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  _id: string;
  userId: string;
  categories: {
    placement: { enabled: boolean; frequency: 'instant' | 'daily' | 'weekly' };
    result: { enabled: boolean; frequency: 'instant' | 'daily' | 'weekly' };
    event: { enabled: boolean; frequency: 'instant' | 'daily' | 'weekly' };
  };
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
