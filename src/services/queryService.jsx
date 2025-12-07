import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Submit query (students and teachers)
export const submitQuery = async (queryData) => {
  try {
    const response = await axios.post(
      `${API_URL}/queries`,
      queryData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Submit query error:', error);
    throw error.response?.data || error;
  }
};

// Get user's queries
export const getUserQueries = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/queries/user/${userId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Fetch user queries error:', error);
    throw error.response?.data || error;
  }
};

// Get all queries (admin only)
export const getAllQueries = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await axios.get(
      `${API_URL}/queries`,
      { 
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  } catch (error) {
    console.error('Fetch all queries error:', error);
    throw error.response?.data || error;
  }
};

// Respond to query (admin only)
export const respondToQuery = async (queryId, response) => {
  try {
    const result = await axios.put(
      `${API_URL}/queries/${queryId}/respond`,
      { response },
      { headers: getAuthHeaders() }
    );
    return result.data;
  } catch (error) {
    console.error('Respond to query error:', error);
    throw error.response?.data || error;
  }
};

export default {
  submitQuery,
  getUserQueries,
  getAllQueries,
  respondToQuery
};
