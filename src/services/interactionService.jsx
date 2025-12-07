// src/services/interactionService.jsx
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Like or unlike content (announcements, posts, materials)
 * @param {string} contentType - Type of content ('announcements', 'posts', 'materials')
 * @param {string} contentId - ID of the content to like
 * @returns {Promise<Object>} Response with like status
 */
export const likeContent = async (contentType, contentId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_URL}/${contentType}/${contentId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Like content error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Add comment to content (announcements, posts, materials)
 * @param {string} contentType - Type of content ('announcements', 'posts', 'materials')
 * @param {string} contentId - ID of the content to comment on
 * @param {string} commentText - Comment text
 * @returns {Promise<Object>} Response with comment data
 */
export const addComment = async (contentType, contentId, commentText) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    if (!commentText || !commentText.trim()) {
      throw new Error('Comment text is required');
    }

    const response = await axios.post(
      `${API_URL}/${contentType}/${contentId}/comment`,
      {
        content: commentText.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error.response?.data || error;
  }
};

const interactionService = {
  likeContent,
  addComment
};

export default interactionService;
