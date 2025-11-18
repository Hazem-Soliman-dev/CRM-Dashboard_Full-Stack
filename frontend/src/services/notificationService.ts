import api from './api';

export interface NotificationItem {
  id: number;
  type: 'lead' | 'customer' | 'booking' | 'payment' | 'support' | 'system' | 'task' | 'attendance';
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  async createNotification(payload: {
    type: NotificationItem['type'];
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    userId?: number;
  }): Promise<NotificationItem> {
    const response = await api.post('/notifications', payload);
    return response.data.data;
  },

  async markAsRead(id: number): Promise<NotificationItem> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },

  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }
};

export default notificationService;

