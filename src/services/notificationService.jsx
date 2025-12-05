// src/services/notificationService.jsx
import { supabase } from './supabaseClient.jsx';

/**
 * Notification service for managing user notifications
 */

export const notificationService = {
  // Create notification
  createNotification: async (data) => {
    throw new Error('Not implemented yet');
  },

  // Get user notifications
  getNotifications: async (userId) => {
    throw new Error('Not implemented yet');
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    throw new Error('Not implemented yet');
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (userId, callback) => {
    throw new Error('Not implemented yet');
  }
};

export default notificationService;
