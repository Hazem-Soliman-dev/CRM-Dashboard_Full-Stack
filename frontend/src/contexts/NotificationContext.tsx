import React, { createContext, useContext } from "react";
import { useNotifications, NotificationDraft } from "../hooks/useNotifications";
import { NotificationItem } from "../services/notificationService";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    notification: NotificationDraft
  ) => Promise<NotificationItem>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationHook = useNotifications();

  return (
    <NotificationContext.Provider value={notificationHook}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
