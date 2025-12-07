// src/services/userService.jsx
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * User service for profile management and social features
 */

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const userService = {
  // Get user by ID using existing endpoint GET /api/user/:id
  getUserById: async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/user/${userId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user profile using new endpoint PUT /api/user/:id
  updateProfile: async (userId, updates) => {
    try {
      const response = await axios.put(
        `${API_URL}/user/${userId}`,
        updates,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Follow user using existing endpoint POST /api/follow/:userId
  followUser: async (followedId) => {
    try {
      const response = await axios.post(
        `${API_URL}/follow/${followedId}`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  // Unfollow user using existing endpoint POST /api/unfollow/:userId
  unfollowUser: async (followedId) => {
    try {
      const response = await axios.post(
        `${API_URL}/unfollow/${followedId}`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  // Update daily streak
  updateStreak: async (userId) => {
    try {
      const response = await axios.post(
        `${API_URL}/user/streak`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  },

  // Award badge/achievement
  awardBadge: async (userId, badge) => {
    try {
      // This would need a backend endpoint to be implemented
      // For now, we'll update the profile with the badge
      const user = await userService.getUserById(userId);
      const badges = user.badges || [];
      if (!badges.includes(badge)) {
        badges.push(badge);
        return await userService.updateProfile(userId, { badges });
      }
      return user;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  },

  // Search users by email using existing endpoint GET /api/search
  searchUserByEmail: async (email) => {
    try {
      const response = await axios.get(
        `${API_URL}/search?query=${encodeURIComponent(email)}`,
        getAuthHeaders()
      );
      // Return the first user that matches the email exactly
      const users = response.data;
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Error searching user:', error);
      throw error;
    }
  }
};

export default userService;
