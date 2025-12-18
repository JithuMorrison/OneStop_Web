// src/services/announcementService.jsx
import { supabase } from './supabaseClient.jsx';
import { parseHashtag as parseHashtagUtil } from '../utils/hashtagParser.jsx';

const API_URL = 'http://localhost:5000/api';

/**
 * Announcement service for creating and managing announcements
 */

export const announcementService = {
  /**
   * Create announcement with image upload to Supabase Storage or URL
   * @param {Object} data - Announcement data
   * @param {File} imageFile - Image file to upload (optional)
   * @param {string} imageUrl - Image URL (optional)
   * @returns {Promise<Object>} Created announcement
   */
  createAnnouncement: async (data, imageFile, imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let finalImageUrl = imageUrl || data.image;

      // Upload image to Supabase Storage if file is provided
      if (imageFile && imageFile instanceof File) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `announcements/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('jithu')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('jithu')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      // Create announcement via backend API
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          image: finalImageUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create announcement');
      }

      const result = await response.json();
      return result.announcement;
    } catch (error) {
      console.error('Create announcement error:', error);
      throw error;
    }
  },

  /**
   * Get announcements with optional filters
   * @param {Object} filters - Filter options (category)
   * @returns {Promise<Array>} List of announcements
   */
  getAnnouncements: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      if (filters.category) {
        queryParams.append('category', filters.category);
      }

      const url = `${API_URL}/announcements${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch announcements');
      }

      return await response.json();
    } catch (error) {
      console.error('Get announcements error:', error);
      throw error;
    }
  },

  /**
   * Get followed announcements for student dashboard
   * @returns {Promise<Array>} List of announcements from followed users
   */
  getFollowedAnnouncements: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/announcements/followed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch followed announcements');
      }

      return await response.json();
    } catch (error) {
      console.error('Get followed announcements error:', error);
      throw error;
    }
  },

  /**
   * Get announcements by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of user's announcements
   */
  getUserAnnouncements: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/announcements/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user announcements');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user announcements error:', error);
      throw error;
    }
  },

  /**
   * Register for announcement
   * @param {string} announcementId - Announcement ID
   * @param {Object} registrationData - Registration form data
   * @returns {Promise<Object>} Registration result
   */
  registerForAnnouncement: async (announcementId, registrationData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/announcements/${announcementId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register for announcement');
      }

      return await response.json();
    } catch (error) {
      console.error('Register for announcement error:', error);
      throw error;
    }
  },

  /**
   * Get registrations for announcement (creator only)
   * @param {string} announcementId - Announcement ID
   * @returns {Promise<Array>} List of registrations
   */
  getRegistrations: async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/announcements/${announcementId}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch registrations');
      }

      return await response.json();
    } catch (error) {
      console.error('Get registrations error:', error);
      throw error;
    }
  },

  /**
   * Issue badges to participants
   * @param {string} announcementId - Announcement ID
   * @param {Array<string>} userIds - Array of user IDs
   * @param {string} badge - Badge name
   * @returns {Promise<Object>} Result
   */
  issueBadges: async (announcementId, userIds, badge) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/announcements/${announcementId}/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds, badge })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to issue badges');
      }

      return await response.json();
    } catch (error) {
      console.error('Issue badges error:', error);
      throw error;
    }
  },

  /**
   * Edit announcement
   * @param {string} announcementId - Announcement ID
   * @param {Object} data - Updated announcement data
   * @returns {Promise<Object>} Updated announcement
   */
  editAnnouncement: async (announcementId, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Include all fields that might affect the corresponding event
      const updateData = {
        title: data.title,
        description: data.description,
        category: data.category,
        hashtag: data.hashtag,
        registration_enabled: data.registration_enabled,
        registration_fields: data.registration_fields,
        start_date: data.start_date,
        end_date: data.end_date
      };

      const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit announcement');
      }

      return await response.json();
    } catch (error) {
      console.error('Edit announcement error:', error);
      throw error;
    }
  },

  /**
   * Delete announcement
   * @param {string} announcementId - Announcement ID
   * @returns {Promise<Object>} Delete result
   */
  deleteAnnouncement: async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete announcement');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete announcement error:', error);
      throw error;
    }
  },

  /**
   * Parse hashtag for calendar event extraction
   * @param {string} hashtag - Hashtag in format #type_eventName_DD-MM-YYYY_DD-MM-YYYY
   * @returns {Object} Parsed event data
   */
  parseHashtag: (hashtag) => {
    return parseHashtagUtil(hashtag);
  }
};

export default announcementService;
