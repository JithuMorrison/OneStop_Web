// src/services/materialService.jsx
import { supabase } from './supabaseClient.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Material service for uploading and managing educational materials
 * Uses MongoDB backend for data storage and Supabase Storage for files
 */

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @returns {Promise<string>} - Public URL of uploaded file
 */
const uploadFileToSupabase = async (file) => {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { data, error } = await supabase.storage
      .from('jithu')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('jithu')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw new Error('Failed to upload file');
  }
};

export const materialService = {
  /**
   * Upload material
   * @param {Object} data - Material data
   * @param {string} data.title - Material title
   * @param {string} data.description - Material description
   * @param {File} data.file - Optional file to upload
   * @param {string} data.external_link - Optional external link
   * @returns {Promise<Object>} - Created material
   */
  uploadMaterial: async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload file to Supabase Storage if provided
      let fileUrl = null;
      if (data.file) {
        fileUrl = await uploadFileToSupabase(data.file);
      }

      // Create material in MongoDB via backend API
      const response = await axios.post(
        `${API_URL}/materials`,
        {
          title: data.title,
          description: data.description,
          file_url: fileUrl,
          external_link: data.external_link || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.material;
    } catch (error) {
      console.error('Error uploading material:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all materials
   * @returns {Promise<Array>} - Array of materials
   */
  getMaterials: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/materials`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get materials by specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of materials
   */
  getUserMaterials: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/materials/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching user materials:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Share material with contacts
   * @param {string} materialId - Material ID
   * @param {string[]} contactIds - Array of contact user IDs
   * @returns {Promise<Object>} - Share result
   */
  shareMaterial: async (materialId, contactIds) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/materials/${materialId}/share`,
        { contactIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sharing material:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single material by ID
   * @param {string} materialId - Material ID
   * @returns {Promise<Object>} - Material object
   */
  getMaterialById: async (materialId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/materials/${materialId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Edit material
   * @param {string} materialId - Material ID
   * @param {Object} data - Updated material data
   * @returns {Promise<Object>} - Updated material
   */
  editMaterial: async (materialId, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/materials/${materialId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error editing material:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete material
   * @param {string} materialId - Material ID
   * @returns {Promise<Object>} - Delete result
   */
  deleteMaterial: async (materialId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(
        `${API_URL}/materials/${materialId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error.response?.data || error;
    }
  }
};

export default materialService;
