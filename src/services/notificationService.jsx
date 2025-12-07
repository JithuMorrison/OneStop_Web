import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Create a new notification
 * Called from various actions: likes, comments, announcements, OD status changes, messages, query responses
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.user_id - User ID to receive notification
 * @param {string} notificationData.type - Notification type (like/comment/announcement/od_status/event_reminder/message/query_response)
 * @param {string} notificationData.content - Notification content/message
 * @param {string} [notificationData.related_id] - Related content ID (optional)
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/notifications`,
      notificationData,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotifications = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications/${userId}`,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success message
 */
export const markAllAsRead = async (userId) => {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/user/${userId}/read-all`,
      {},
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread notification count
 */
export const getUnreadCount = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications/${userId}/unread-count`,
      createAuthHeaders()
    );
    return response.data.count;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

/**
 * Poll for new notifications
 * Implements polling for real-time notification updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle new notifications
 * @param {number} interval - Polling interval in milliseconds (default: 30000 = 30 seconds)
 * @returns {Function} Cleanup function to stop polling
 */
export const pollNotifications = (userId, callback, interval = 30000) => {
  let lastNotificationId = null;

  const poll = async () => {
    try {
      const notifications = await getNotifications(userId);
      
      // Check if there are new notifications
      if (notifications.length > 0) {
        const latestNotificationId = notifications[0]._id;
        
        // If this is the first poll or there are new notifications
        if (lastNotificationId === null) {
          lastNotificationId = latestNotificationId;
          callback(notifications);
        } else if (latestNotificationId !== lastNotificationId) {
          // Find new notifications
          const newNotifications = [];
          for (const notif of notifications) {
            if (notif._id === lastNotificationId) break;
            newNotifications.push(notif);
          }
          
          if (newNotifications.length > 0) {
            lastNotificationId = latestNotificationId;
            callback(newNotifications);
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  // Initial poll
  poll();

  // Set up interval
  const intervalId = setInterval(poll, interval);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

export default {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  pollNotifications,
};
