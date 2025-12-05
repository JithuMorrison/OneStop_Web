// src/services/materialService.jsx
import { supabase } from './supabaseClient.jsx';

/**
 * Material service for uploading and managing educational materials
 */

export const materialService = {
  // Upload material
  uploadMaterial: async (data) => {
    throw new Error('Not implemented yet');
  },

  // Get all materials
  getMaterials: async () => {
    throw new Error('Not implemented yet');
  },

  // Share material
  shareMaterial: async (materialId, contactIds) => {
    throw new Error('Not implemented yet');
  }
};

export default materialService;
