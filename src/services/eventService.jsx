// src/services/eventService.jsx
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Event service for managing calendar events and exam schedules
 * Connects to MongoDB backend via Express API
 */

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const eventService = {
  /**
   * Create exam schedule (teachers only)
   * Also creates a corresponding Event document
   * @param {Object} data - Exam schedule data
   * @param {string} data.exam_name - Name of the exam
   * @param {Date|string} data.date - Date of the exam
   * @param {number} data.year - Academic year
   * @param {number} data.semester - Semester number
   * @param {number} data.number_of_exams - Number of exams
   * @returns {Promise<Object>} Created exam schedule and event
   */
  createExamSchedule: async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}/exam-schedules`,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Create exam schedule error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create exam schedule');
    }
  },

  /**
   * Get events with optional date range filtering
   * @param {Date|string} startDate - Optional start date for filtering
   * @param {Date|string} endDate - Optional end date for filtering
   * @returns {Promise<Array>} Array of events
   */
  getEvents: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        `${API_URL}/events`,
        {
          headers: getAuthHeaders(),
          params
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get events error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch events');
    }
  },

  /**
   * Get events for a specific date
   * @param {Date|string} date - The date to get events for
   * @returns {Promise<Array>} Array of events on that date
   */
  getEventsForDate: async (date) => {
    try {
      // Format date as YYYY-MM-DD
      const dateStr = date instanceof Date 
        ? date.toISOString().split('T')[0]
        : date;

      const response = await axios.get(
        `${API_URL}/events/date/${dateStr}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get events for date error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch events for date');
    }
  },

  /**
   * Get upcoming events (next 10 events from today)
   * @returns {Promise<Array>} Array of upcoming events
   */
  getUpcomingEvents: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/events/upcoming`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get upcoming events error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch upcoming events');
    }
  },

  /**
   * Get events created by a specific teacher
   * @param {string} teacherId - Teacher's user ID
   * @returns {Promise<Array>} Array of events created by the teacher
   */
  getTeacherEvents: async (teacherId) => {
    try {
      const response = await axios.get(
        `${API_URL}/events/teacher/${teacherId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get teacher events error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch teacher events');
    }
  },

  /**
   * Get all exam schedules
   * @returns {Promise<Array>} Array of exam schedules
   */
  getExamSchedules: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/exam-schedules`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get exam schedules error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch exam schedules');
    }
  }
};

export default eventService;
