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

// Create portal (admin only)
export const createPortal = async (portalData) => {
  try {
    const response = await axios.post(
      `${API_URL}/portals`,
      portalData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Create portal error:', error);
    throw error.response?.data || error;
  }
};

// Get all portals
export const getPortals = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/portals`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Fetch portals error:', error);
    throw error.response?.data || error;
  }
};

// Create tool (admin only)
export const createTool = async (toolData) => {
  try {
    const response = await axios.post(
      `${API_URL}/tools`,
      toolData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Create tool error:', error);
    throw error.response?.data || error;
  }
};

// Get all tools
export const getTools = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/tools`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Fetch tools error:', error);
    throw error.response?.data || error;
  }
};

export default {
  createPortal,
  getPortals,
  createTool,
  getTools
};
