import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'deal' | 'system';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Order GRV-98421 Delivered Successfully',
    message: 'Your Hyderabadi Dum Biryani was delivered to your door. Enjoy your meal!',
    timestamp: '2 hours ago',
    read: false,
    type: 'order',
  },
  {
    id: 'notif-2',
    title: 'Fresh Fruits & Veggies Restocked',
    message: 'Royal Gala Apples and Farm Spinach are fresh from local partner hubs today.',
    timestamp: '5 hours ago',
    read: false,
    type: 'deal',
  },
  {
    id: 'notif-3',
    title: 'UNI Ambient Glow Theme Active',
    message: 'Experience the enhanced chromatic perimeter glow across Food, Grocery, and Medicine marketplaces.',
    timestamp: 'Yesterday',
    read: true,
    type: 'system',
  },
  {
    id: 'notif-4',
    title: '15-Min Express Pharmacy Enabled',
    message: 'Emergency OTC tablets and health supplies now dispatched with zero surge fees.',
    timestamp: '2 days ago',
    read: true,
    type: 'system',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('gravvy_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('gravvy_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
