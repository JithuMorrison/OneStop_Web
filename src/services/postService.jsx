// src/services/postService.jsx
import { supabase } from './supabaseClient.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Post service for creating and managing posts
 * Uses MongoDB backend for data storage and Supabase Storage for images
 */

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Public URL of uploaded image
 */
const uploadImageToSupabase = async (file) => {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw new Error('Failed to upload image');
  }
};

export const postService = {
  /**
   * Create a new post
   * @param {Object} data - Post data
   * @param {string} data.title - Post title
   * @param {string} data.description - Post description
   * @param {File} data.imageFile - Optional image file
   * @param {string} data.visibility - Visibility setting ('students', 'teachers', 'everyone')
   * @param {string[]} data.hashtags - Optional array of hashtags
   * @returns {Promise<Object>} - Created post
   */
  createPost: async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload image to Supabase Storage if provided
      let imageUrl = null;
      if (data.imageFile) {
        imageUrl = await uploadImageToSupabase(data.imageFile);
      }

      // Create post in MongoDB via backend API
      const response = await axios.post(
        `${API_URL}/posts`,
        {
          title: data.title,
          description: data.description,
          image: imageUrl,
          visibility: data.visibility,
          hashtags: data.hashtags || []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get posts with role-based filtering
   * @param {Object} filters - Optional filters
   * @param {string[]} filters.hashtags - Filter by hashtags
   * @returns {Promise<Array>} - Array of posts
   */
  getPosts: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.hashtags && filters.hashtags.length > 0) {
        filters.hashtags.forEach(tag => params.append('hashtags', tag));
      }

      const response = await axios.get(
        `${API_URL}/posts?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get posts by specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of posts
   */
  getUserPosts: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/posts/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get posts from followed users
   * @returns {Promise<Array>} - Array of posts
   */
  getFollowedPosts: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/posts/followed`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching followed posts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Share post with contacts
   * @param {string} postId - Post ID
   * @param {string[]} contactIds - Array of contact user IDs
   * @returns {Promise<Object>} - Share result
   */
  sharePost: async (postId, contactIds) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/posts/${postId}/share`,
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
      console.error('Error sharing post:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Post object
   */
  getPostById: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_URL}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error.response?.data || error;
    }
  }
};

export default postService;
