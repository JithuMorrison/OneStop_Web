// src/services/authService.jsx
import axios from 'axios';
import { validateEmail, getEmailErrorMessage } from '../utils/emailValidation.jsx';

const API_URL = 'http://localhost:5000/api';

/**
 * Authentication service for user registration, login, and session management
 */

export const authService = {
  /**
   * Register new user with role-based email validation
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.role - User role ('student', 'teacher', or 'admin')
   * @param {string} userData.rollNumber - 13-digit roll number (required for students)
   * @param {string} userData.digitalId - 7-digit digital ID
   * @param {string} userData.department - Department name
   * @param {number} userData.joinYear - Year of joining
   * @param {string} userData.section - Section (optional)
   * @returns {Promise<Object>} - Created user object
   */
  register: async (userData) => {
    const {
      name,
      email,
      password,
      role,
      rollNumber,
      digitalId,
      department,
      joinYear,
      section
    } = userData;

    // Validate required fields
    if (!name || !email || !password || !role || !digitalId || !department || !joinYear) {
      throw new Error('All required fields must be provided');
    }

    // Validate email format based on role
    if (!validateEmail(email, role)) {
      throw new Error(getEmailErrorMessage(role));
    }

    // Validate roll number for students
    if (role === 'student') {
      if (!rollNumber) {
        throw new Error('Roll number is required for students');
      }
      if (rollNumber.length !== 13) {
        throw new Error('Roll number must be exactly 13 digits');
      }
    }

    try {
      // Call backend API to register user
      const response = await axios.post(`${API_URL}/register`, {
        username: email.split('@')[0], // Generate username from email
        name,
        email,
        password,
        role,
        roll_number: role === 'student' ? rollNumber : null,
        digital_id: digitalId,
        department,
        join_year: joinYear,
        section: section || null,
        dept: department, // Legacy field
        year: joinYear.toString(), // Legacy field
      });

      // Store JWT token
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Login user and return session
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Session and user data
   */
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Call backend API to login
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Store JWT token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        token,
        user,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>} - Current user or null if not authenticated
   */
  getCurrentUser: async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        return null;
      }

      // Parse stored user data
      const user = JSON.parse(userStr);

      // Validate token by fetching fresh user data from backend
      try {
        const userId = user._id || user.id;
        const response = await axios.get(`${API_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update stored user data with fresh data
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Validate email format based on role
   * @param {string} email - Email to validate
   * @param {string} role - User role
   * @returns {boolean} - True if valid
   */
  validateEmail: (email, role) => {
    return validateEmail(email, role);
  },
};

export default authService;
