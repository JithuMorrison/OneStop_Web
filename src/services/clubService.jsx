// src/services/clubService.jsx
import axios from 'axios';
import { supabase } from './supabaseClient.jsx';

const API_URL = 'http://localhost:5000/api';

/**
 * Club service for club management
 */

export const clubService = {
  /**
   * Upload club logo to Supabase Storage
   * @param {File} file - Logo file to upload
   * @returns {Promise<string>} - Public URL of uploaded logo
   */
  uploadLogo: async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `clubs/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('jithu')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jithu')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw error;
    }
  },

  /**
   * Create new club (admin only)
   * @param {Object} clubData - Club data
   * @param {string} clubData.name - Club name
   * @param {File} clubData.logoFile - Logo file to upload
   * @param {string} clubData.description - Club description
   * @param {string[]} clubData.subdomains - Optional subdomains
   * @param {Array<{email: string, type: 'teacher'|'student'}>} clubData.moderators - Moderators
   * @returns {Promise<Object>} - Created club
   */
  createClub: async (clubData) => {
    try {
      const { name, logoFile, description, subdomains, moderators } = clubData;

      // Validate required fields
      if (!name || !logoFile || !description || !moderators) {
        throw new Error('Name, logo, description, and moderators are required');
      }

      // Upload logo to Supabase Storage
      const logoUrl = await clubService.uploadLogo(logoFile);

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call backend API
      const response = await axios.post(
        `${API_URL}/clubs`,
        {
          name,
          logo: logoUrl,
          description,
          subdomains: subdomains || [],
          moderators
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.club;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create club';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update club (moderators only)
   * @param {string} clubId - Club ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated club
   */
  updateClub: async (clubId, updates) => {
    try {
      if (!clubId) {
        throw new Error('Club ID is required');
      }

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call backend API
      const response = await axios.put(
        `${API_URL}/clubs/${clubId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.club;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update club';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all clubs
   * @returns {Promise<Array>} - Array of clubs
   */
  getAllClubs: async () => {
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call backend API
      const response = await axios.get(`${API_URL}/clubs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch clubs';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get single club by ID
   * @param {string} clubId - Club ID
   * @returns {Promise<Object>} - Club data
   */
  getClubById: async (clubId) => {
    try {
      if (!clubId) {
        throw new Error('Club ID is required');
      }

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call backend API
      const response = await axios.get(`${API_URL}/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch club';
      throw new Error(errorMessage);
    }
  },

  /**
   * Check if user can edit club
   * @param {string} userId - User ID (not used, token is used instead)
   * @param {string} clubId - Club ID
   * @returns {Promise<boolean>} - True if user can edit
   */
  canEditClub: async (userId, clubId) => {
    try {
      if (!clubId) {
        throw new Error('Club ID is required');
      }

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      // Call backend API
      const response = await axios.get(`${API_URL}/clubs/${clubId}/can-edit`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.canEdit;
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  }
};

export default clubService;
