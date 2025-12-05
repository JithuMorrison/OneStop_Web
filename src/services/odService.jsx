// src/services/odService.jsx
import { supabase } from './supabaseClient.jsx';

/**
 * OD (On-Duty) service for managing OD claims
 */

export const odService = {
  // Create OD claim (student)
  createODClaim: async (data) => {
    throw new Error('Not implemented yet');
  },

  // Get student's OD claims
  getStudentODClaims: async (studentId) => {
    throw new Error('Not implemented yet');
  },

  // Get teacher's OD claims
  getTeacherODClaims: async (teacherId, status) => {
    throw new Error('Not implemented yet');
  },

  // Approve/reject OD claim (teacher)
  updateODStatus: async (odId, status) => {
    throw new Error('Not implemented yet');
  }
};

export default odService;
