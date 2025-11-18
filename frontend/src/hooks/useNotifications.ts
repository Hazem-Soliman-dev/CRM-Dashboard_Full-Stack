import { useState, useCallback, useEffect } from 'react';
import notificationService, {
  NotificationItem
} from '../services/notificationService';

export type NotificationDraft = {
  type: NotificationItem['type'];
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  userId?: number;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback(
    async (notification: NotificationDraft) => {
      try {
        const created = await notificationService.createNotification(notification);
        setNotifications((prev) => [created, ...prev]);
        return created;
      } catch (error) {
        console.error('Failed to persist notification, falling back to local state', error);
        const fallback: NotificationItem = {
          id: Date.now(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entityType: notification.entityType,
          entityId: notification.entityId,
          isRead: false,
          createdAt: new Date().toISOString(),
          readAt: null
        };
        setNotifications((prev) => [fallback, ...prev].slice(0, 50));
        return fallback;
      }
    },
    []
  );

  const markAsRead = useCallback(async (id: number) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? updated : notification))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    } finally {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await Promise.all(
        notifications.map((notification) =>
          notificationService.deleteNotification(notification.id)
        )
      );
    } catch (error) {
      console.error('Failed to delete notifications', error);
    } finally {
      setNotifications([]);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};