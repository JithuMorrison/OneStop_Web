import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  pollNotifications,
} from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(userId);
      setNotifications(data);
      
      // Calculate unread count
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [userId]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      throw err;
    }
  }, [userId]);

  // Handle new notifications from polling
  const handleNewNotifications = useCallback((newNotifications) => {
    setNotifications(prev => {
      // Merge new notifications with existing ones, avoiding duplicates
      const existingIds = new Set(prev.map(n => n._id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n._id));
      
      if (uniqueNew.length > 0) {
        // Update unread count
        const newUnread = uniqueNew.filter(n => !n.read).length;
        setUnreadCount(prevCount => prevCount + newUnread);
        
        return [...uniqueNew, ...prev];
      }
      
      return prev;
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!userId) return;

    // Poll every 30 seconds
    const cleanup = pollNotifications(userId, handleNewNotifications, 30000);

    return cleanup;
  }, [userId, handleNewNotifications]);

  // Refresh notifications periodically
  useEffect(() => {
    if (!userId) return;

    // Refresh unread count every minute
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [userId, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  userId: PropTypes.string,
};

export default NotificationContext;
