// src/pages/shared/Clubs.jsx
import React, { useState, useEffect } from 'react';
import ClubCard from '../../components/shared/ClubCard.jsx';
import clubService from '../../services/clubService.jsx';
import { FaPlus, FaTimes } from 'react-icons/fa';

/**
 * Clubs page - Display all clubs with creation and editing capabilities
 */
const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editPermissions, setEditPermissions] = useState({});

  // Get current user
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === 'admin';

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    logoFile: null,
    description: '',
    subdomains: '',
    moderators: [{ email: '', type: 'teacher' }],
    members: [],
    works_done: ''
  });

  // Load clubs on mount
  useEffect(() => {
    loadClubs();
  }, []);

  // Check edit permissions for each club
  useEffect(() => {
    if (clubs.length > 0 && currentUser) {
      checkEditPermissions();
    }
  }, [clubs, currentUser]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clubService.getAllClubs();
      setClubs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEditPermissions = async () => {
    const permissions = {};
    for (const club of clubs) {
      try {
        const canEdit = await clubService.canEditClub(currentUser.id, club._id);
        permissions[club._id] = canEdit;
      } catch (err) {
        permissions[club._id] = false;
      }
    }
    setEditPermissions(permissions);
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);

      // Validate moderators
      const moderators = formData.moderators.filter(m => m.email.trim());
      if (moderators.length === 0) {
        throw new Error('At least one moderator is required');
      }

      const teacherMods = moderators.filter(m => m.type === 'teacher');
      if (teacherMods.length !== 1) {
        throw new Error('Exactly one teacher moderator is required');
      }

      const studentMods = moderators.filter(m => m.type === 'student');
      if (studentMods.length > 3) {
        throw new Error('Maximum 3 student moderators allowed');
      }

      // Parse subdomains
      const subdomains = formData.subdomains
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      // Create club
      await clubService.createClub({
        name: formData.name,
        logoFile: formData.logoFile,
        description: formData.description,
        subdomains,
        moderators
      });

      // Reset form and reload clubs
      setFormData({
        name: '',
        logoFile: null,
        description: '',
        subdomains: '',
        moderators: [{ email: '', type: 'teacher' }],
        members: [],
        works_done: ''
      });
      setShowCreateForm(false);
      await loadClubs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClub = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);

      // Parse works_done
      const works_done = formData.works_done
        .split('\n')
        .map(w => w.trim())
        .filter(w => w);

      // Parse subdomains
      const subdomains = formData.subdomains
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      // Update club
      await clubService.updateClub(selectedClub._id, {
        name: formData.name,
        description: formData.description,
        subdomains,
        members: formData.members,
        works_done
      });

      // Reset form and reload clubs
      setShowEditForm(false);
      setSelectedClub(null);
      await loadClubs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (club) => {
    setSelectedClub(club);
    setFormData({
      name: club.name,
      logoFile: null,
      description: club.description,
      subdomains: (club.subdomains || []).join(', '),
      moderators: club.moderators || [],
      members: club.members || [],
      works_done: (club.works_done || []).join('\n')
    });
    setShowEditForm(true);
  };

  const handleClubClick = (club) => {
    setSelectedClub(club);
  };

  const addModeratorField = () => {
    setFormData({
      ...formData,
      moderators: [...formData.moderators, { email: '', type: 'student' }]
    });
  };

  const removeModeratorField = (index) => {
    const newModerators = formData.moderators.filter((_, i) => i !== index);
    setFormData({ ...formData, moderators: newModerators });
  };

  const updateModeratorField = (index, field, value) => {
    const newModerators = [...formData.moderators];
    newModerators[index][field] = value;
    setFormData({ ...formData, moderators: newModerators });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading clubs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Clubs</h1>
        {isAdmin && !showCreateForm && !showEditForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all touch-manipulation"
            aria-label="Create new club"
          >
            <FaPlus aria-hidden="true" /> <span>Create Club</span>
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Club Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Create New Club</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleCreateClub} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Logo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, logoFile: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Max 5MB, images only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomains (comma-separated)
              </label>
              <input
                type="text"
                value={formData.subdomains}
                onChange={(e) => setFormData({ ...formData, subdomains: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Web Development, AI, Robotics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moderators * (1 teacher, max 3 students)
              </label>
              {formData.moderators.map((moderator, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={moderator.email}
                    onChange={(e) => updateModeratorField(index, 'email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                    required
                  />
                  <select
                    value={moderator.type}
                    onChange={(e) => updateModeratorField(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                  {formData.moderators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModeratorField(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addModeratorField}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Moderator
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Club
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Club Form */}
      {showEditForm && selectedClub && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Edit Club</h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                setSelectedClub(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleEditClub} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomains (comma-separated)
              </label>
              <input
                type="text"
                value={formData.subdomains}
                onChange={(e) => setFormData({ ...formData, subdomains: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Works Done (one per line)
              </label>
              <textarea
                value={formData.works_done}
                onChange={(e) => setFormData({ ...formData, works_done: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                placeholder="Enter each work on a new line"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedClub(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Club Detail View */}
      {selectedClub && !showEditForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Club Details</h2>
            <button
              onClick={() => setSelectedClub(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <ClubCard
            club={selectedClub}
            canEdit={editPermissions[selectedClub._id]}
            onEdit={handleEditClick}
          />
        </div>
      )}

      {/* Clubs Grid */}
      {!showCreateForm && !showEditForm && (
        <>
          {clubs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-base sm:text-lg">No clubs found</p>
              {isAdmin && (
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Create the first club to get started</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {clubs.map((club) => (
                <div 
                  key={club._id} 
                  onClick={() => handleClubClick(club)} 
                  className="cursor-pointer touch-manipulation"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleClubClick(club);
                    }
                  }}
                  aria-label={`View details for ${club.name}`}
                >
                  <ClubCard
                    club={club}
                    canEdit={editPermissions[club._id]}
                    onEdit={handleEditClick}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Clubs;
