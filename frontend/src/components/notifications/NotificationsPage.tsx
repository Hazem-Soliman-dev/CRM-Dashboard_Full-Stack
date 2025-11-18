import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { formatDateTime } from '../../utils/format';
import { Bell, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review recent activity across leads, deals, operations, and support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount} unread
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>
        </div>
      </div>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stream</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200 dark:divide-gray-800 p-0">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full px-6 py-4 text-left transition-colors ${
                  notification.isRead
                    ? 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
                    : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-full bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  {notification.isRead && (
                    <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-16 text-gray-500 dark:text-gray-400">
              <Bell className="h-10 w-10" />
              <p>No notifications yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

