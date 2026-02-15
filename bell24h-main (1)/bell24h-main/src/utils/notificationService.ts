/**
 * Notification service utilities
 */

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  RFQ_RESPONSE = 'rfq-response',
  BID_STATUS = 'bid-status',
  PAYMENT = 'payment',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  data?: any;
}

/**
 * Send a notification
 */
export const sendNotification = (options: NotificationOptions): void => {
  const notification: Notification = {
    id: `notification_${Date.now()}_${Math.random()}`,
    type: options.type || NotificationType.INFO,
    title: options.title || 'Notification',
    message: options.message,
    timestamp: new Date(),
    read: false,
    data: options.data,
  };

  // Store in localStorage for persistence
  storeNotification(notification);

  // Dispatch custom event for real-time updates
  const event = new CustomEvent('notification', { detail: notification });
  window.dispatchEvent(event);

  // Show browser notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
    });
  }
};

/**
 * Store notification in localStorage
 */
export const storeNotification = (notification: Notification): void => {
  try {
    const existing = localStorage.getItem('notifications');
    const notifications: Notification[] = existing ? JSON.parse(existing) : [];

    // Add new notification
    notifications.unshift(notification);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to store notification:', error);
  }
};

/**
 * Get all stored notifications
 */
export const getNotifications = (): Notification[] => {
  try {
    const existing = localStorage.getItem('notifications');
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notificationId: string): void => {
  try {
    const notifications = getNotifications();
    const updated = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = (notificationId: string): void => {
  try {
    const notifications = getNotifications();
    const filtered = notifications.filter(notification => notification.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = (): void => {
  try {
    localStorage.removeItem('notifications');
  } catch (error) {
    console.error('Failed to clear notifications:', error);
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = (): number => {
  const notifications = getNotifications();
  return notifications.filter(notification => !notification.read).length;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Notification service class
 */
export class NotificationService {
  private listeners: Map<string, (notification: Notification) => void> = new Map();

  constructor() {
    // Listen for custom notification events
    window.addEventListener('notification', (event: any) => {
      const notification = event.detail as Notification;
      this.listeners.forEach(listener => listener(notification));
    });
  }

  subscribe(id: string, callback: (notification: Notification) => void): () => void {
    this.listeners.set(id, callback);

    return () => {
      this.listeners.delete(id);
    };
  }

  send(options: NotificationOptions): void {
    sendNotification(options);
  }

  getNotifications(): Notification[] {
    return getNotifications();
  }

  markAsRead(notificationId: string): void {
    markNotificationAsRead(notificationId);
  }

  delete(notificationId: string): void {
    deleteNotification(notificationId);
  }

  clearAll(): void {
    clearAllNotifications();
  }

  getUnreadCount(): number {
    return getUnreadCount();
  }

  async requestPermission(): Promise<boolean> {
    return requestNotificationPermission();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;
