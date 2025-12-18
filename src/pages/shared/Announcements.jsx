import React, { useState, useEffect } from 'react';
import { FaPlus, FaFilter, FaTimes } from 'react-icons/fa';
import AnnouncementCard from '../../components/shared/AnnouncementCard.jsx';
import AnnouncementForm from '../../components/forms/AnnouncementForm.jsx';
import announcementService from '../../services/announcementService.jsx';
import interactionService from '../../services/interactionService.jsx';

/**
 * Announcements page for viewing and creating announcements
 */
const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [registrationData, setRegistrationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const categories = [
    'All',
    'Events',
    'Hackathons',
    'Workshops',
    'Value-Added Courses',
    'Seminars',
    'Competitions',
    'Cultural',
    'Technical',
    'Sports',
    'Other'
  ];

  useEffect(() => {
    loadCurrentUser();
    loadAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [selectedCategory, announcements]);

  const loadCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    if (!selectedCategory || selectedCategory === 'All') {
      setFilteredAnnouncements(announcements);
    } else {
      setFilteredAnnouncements(
        announcements.filter(ann => ann.category === selectedCategory)
      );
    }
  };

  const handleCreateAnnouncement = async (formData, imageFile, imageUrl) => {
    try {
      await announcementService.createAnnouncement(formData, imageFile, imageUrl);
      setShowCreateForm(false);
      await loadAnnouncements();
      alert('Announcement created successfully!');
    } catch (err) {
      console.error('Error creating announcement:', err);
      throw err;
    }
  };

  const handleLike = async (announcementId) => {
    try {
      const result = await interactionService.likeContent('announcements', announcementId);
      
      // Update the announcement in the local state with real-time like count
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.map(announcement => {
          if (announcement._id === announcementId) {
            const currentUserId = localStorage.getItem('userId');
            return {
              ...announcement,
              likes: result.likes,
              liked_by: result.liked 
                ? [...(announcement.liked_by || []), currentUserId]
                : (announcement.liked_by || []).filter(id => id !== currentUserId)
            };
          }
          return announcement;
        })
      );
    } catch (err) {
      console.error('Error liking announcement:', err);
      alert('Failed to like announcement. Please try again.');
    }
  };

  const handleComment = async (announcementId, commentText) => {
    try {
      const result = await interactionService.addComment('announcements', announcementId, commentText);
      
      // Update the announcement in the local state with the new comment
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.map(announcement => {
          if (announcement._id === announcementId) {
            return {
              ...announcement,
              comments: [...(announcement.comments || []), result.comment]
            };
          }
          return announcement;
        })
      );
    } catch (err) {
      console.error('Error commenting on announcement:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleShare = async (announcementId, type) => {
    // Share functionality is handled within AnnouncementCard component
    console.log('Share announcement:', announcementId, type);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (formData, imageFile, imageUrl) => {
    try {
      await announcementService.editAnnouncement(editingAnnouncement._id, formData);
      setShowEditForm(false);
      setEditingAnnouncement(null);
      await loadAnnouncements();
      alert('Announcement updated successfully!');
    } catch (err) {
      console.error('Error updating announcement:', err);
      throw err;
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingAnnouncement(null);
  };

  const handleDelete = async (announcementId) => {
    try {
      await announcementService.deleteAnnouncement(announcementId);
      await loadAnnouncements();
      alert('Announcement deleted successfully!');
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const handleRegister = (announcementId) => {
    const announcement = announcements.find(a => a._id === announcementId);
    if (announcement) {
      // Check role restriction
      const userRole = currentUser?.role || 'student';
      const roleRestriction = announcement.registration_role_restriction || 'all';
      
      if (roleRestriction !== 'all') {
        if (roleRestriction === 'students' && userRole !== 'student') {
          alert('Only students can register for this event.');
          return;
        }
        if (roleRestriction === 'teachers' && userRole !== 'teacher') {
          alert('Only teachers can register for this event.');
          return;
        }
      }
      
      setSelectedAnnouncement(announcement);
      // Initialize with empty data - user info will be auto-populated by backend
      setRegistrationData({});
      setShowRegistrationModal(true);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await announcementService.registerForAnnouncement(
        selectedAnnouncement._id,
        registrationData
      );
      
      setShowRegistrationModal(false);
      setSelectedAnnouncement(null);
      setRegistrationData({});
      alert('Registration successful!');
      await loadAnnouncements();
    } catch (err) {
      console.error('Error registering:', err);
      alert(err.message || 'Registration failed');
    }
  };

  const handleRegistrationFieldChange = (fieldName, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {showCreateForm ? <FaTimes /> : <FaPlus />}
              {showCreateForm ? 'Cancel' : 'Create Announcement'}
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  (category === 'All' && !selectedCategory) || selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8">
            <AnnouncementForm
              onSubmit={handleCreateAnnouncement}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Edit Form */}
        {showEditForm && editingAnnouncement && (
          <div className="mb-8">
            <AnnouncementForm
              initialData={editingAnnouncement}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
          </div>
        )}

        {/* Announcements Grid */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedCategory 
                ? `No announcements found in "${selectedCategory}" category`
                : 'No announcements yet. Be the first to create one!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map(announcement => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                onLike={handleLike}
                onComment={handleComment}
                onRegister={handleRegister}
                onShare={handleShare}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && selectedAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Register for Event
                  </h2>
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <p className="text-gray-700 mb-6">
                  {selectedAnnouncement.title}
                </p>

                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  {/* Auto-populated User Info (Read-only display) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-blue-900 mb-2">Your Information (Auto-filled)</p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{currentUser?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-900">{currentUser?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Role:</span>
                        <span className="ml-2 text-gray-900 capitalize">{currentUser?.role || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Registration Fields */}
                  {selectedAnnouncement.registration_fields && selectedAnnouncement.registration_fields.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-gray-700">Additional Information Required:</p>
                      {selectedAnnouncement.registration_fields.map((field, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field} *
                          </label>
                          <input
                            type="text"
                            value={registrationData[field] || ''}
                            onChange={(e) => handleRegistrationFieldChange(field, e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No additional information required.</p>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Submit Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegistrationModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
