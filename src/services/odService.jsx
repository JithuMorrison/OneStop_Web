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
      'Content-Type': 'application/json'
    }
  };
};

/**
 * Create OD claim (students only)
 * Sets status to "pending" and adds to student's ods array
 * @param {Object} odData - OD claim data
 * @param {string} odData.event_id - Event ID (optional)
 * @param {string} odData.event_name - Event name
 * @param {string} odData.teacher_id - Teacher ID
 * @param {string} odData.description - Description
 * @returns {Promise<Object>} Created OD claim
 */
export const createODClaim = async (odData) => {
  try {
    const response = await axios.post(
      `${API_URL}/od-claims`,
      odData,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating OD claim:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get student's OD claims
 * @param {string} studentId - Student user ID
 * @returns {Promise<Array>} Array of OD claims
 */
export const getStudentODClaims = async (studentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/od-claims/student/${studentId}`,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching student OD claims:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get teacher's OD claims with optional status filter
 * @param {string} teacherId - Teacher user ID
 * @param {string} status - Optional status filter ('pending', 'accepted', 'rejected')
 * @returns {Promise<Array>} Array of OD claims
 */
export const getTeacherODClaims = async (teacherId, status = null) => {
  try {
    const url = status
      ? `${API_URL}/od-claims/teacher/${teacherId}?status=${status}`
      : `${API_URL}/od-claims/teacher/${teacherId}`;

    const response = await axios.get(url, createAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher OD claims:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update OD claim status (teachers only)
 * Creates notification for student
 * @param {string} odClaimId - OD claim ID
 * @param {string} status - New status ('accepted' or 'rejected')
 * @returns {Promise<Object>} Updated OD claim
 */
export const updateODStatus = async (odClaimId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/od-claims/${odClaimId}/status`,
      { status },
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating OD claim status:', error);
    throw error.response?.data || error;
  }
};

export default {
  createODClaim,
  getStudentODClaims,
  getTeacherODClaims,
  updateODStatus
};
