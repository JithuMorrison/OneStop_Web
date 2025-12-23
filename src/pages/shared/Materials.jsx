// src/pages/shared/Materials.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MaterialCard from '../../components/shared/MaterialCard.jsx';
import MaterialForm from '../../components/forms/MaterialForm.jsx';
import materialService from '../../services/materialService.jsx';
import userService from '../../services/userService.jsx';
import interactionService from '../../services/interactionService.jsx';
import { FaPlus, FaTimes } from 'react-icons/fa';

/**
 * Materials page - Display and manage educational materials
 * Implements material upload, sharing functionality
 */
const Materials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMaterialId, setShareMaterialId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Fetch materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Check for edit parameter in URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && materials.length > 0) {
      const materialToEdit = materials.find(m => m._id === editId);
      if (materialToEdit) {
        setEditingMaterial(materialToEdit);
        setShowEditForm(true);
        // Clear the URL parameter
        setSearchParams({});
      }
    }
  }, [materials, searchParams, setSearchParams]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedMaterials = await materialService.getMaterials();
      
      // Ensure we always set an array
      if (Array.isArray(fetchedMaterials)) {
        setMaterials(fetchedMaterials);
      } else {
        console.warn('Materials response is not an array:', fetchedMaterials);
        setMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.error || 'Failed to load materials');
      setMaterials([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (materialData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await materialService.uploadMaterial(materialData);
      
      // Refresh materials list
      await fetchMaterials();
      
      // Close form
      setShowUploadForm(false);
      
      // Show success message
      alert('Material uploaded successfully!');
    } catch (err) {
      console.error('Error uploading material:', err);
      setError(err.error || 'Failed to upload material');
      alert('Failed to upload material. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (materialId) => {
    try {
      const result = await interactionService.likeContent('materials', materialId);
      
      // Update the material in the local state with real-time like count
      setMaterials(prevMaterials => 
        prevMaterials.map(material => {
          if (material._id === materialId) {
            const currentUserId = localStorage.getItem('userId');
            return {
              ...material,
              likes: result.likes,
              liked_by: result.liked 
                ? [...(material.liked_by || []), currentUserId]
                : (material.liked_by || []).filter(id => id !== currentUserId)
            };
          }
          return material;
        })
      );
    } catch (err) {
      console.error('Error liking material:', err);
      alert('Failed to like material. Please try again.');
    }
  };

  const handleComment = async (materialId, commentText) => {
    try {
      const result = await interactionService.addComment('materials', materialId, commentText);
      
      // Update the material in the local state with the new comment
      setMaterials(prevMaterials => 
        prevMaterials.map(material => {
          if (material._id === materialId) {
            return {
              ...material,
              comments: [...(material.comments || []), result.comment]
            };
          }
          return material;
        })
      );
    } catch (err) {
      console.error('Error commenting on material:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleShareClick = async (materialId) => {
    try {
      setShareMaterialId(materialId);
      
      // Fetch user's contacts
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.contacts && currentUser.contacts.length > 0) {
        // Fetch contact details
        const contactDetails = await Promise.all(
          currentUser.contacts.map(contactId => 
            userService.getUserById(contactId).catch(() => null)
          )
        );
        setContacts(contactDetails.filter(c => c !== null));
      } else {
        setContacts([]);
      }
      
      setShowShareModal(true);
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error loading contacts:', err);
      alert('Failed to load contacts');
    }
  };

  const handleShareSubmit = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    try {
      await materialService.shareMaterial(shareMaterialId, selectedContacts);
      alert(`Material shared with ${selectedContacts.length} contact(s)!`);
      setShowShareModal(false);
      setShareMaterialId(null);
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error sharing material:', err);
      alert('Failed to share material. Please try again.');
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (materialData) => {
    try {
      await materialService.editMaterial(editingMaterial._id, {
        title: materialData.title,
        description: materialData.description,
        external_link: materialData.external_link
      });
      setShowEditForm(false);
      setEditingMaterial(null);
      await fetchMaterials();
      alert('Material updated successfully!');
    } catch (err) {
      console.error('Error updating material:', err);
      throw err;
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingMaterial(null);
  };

  const handleDelete = async (materialId) => {
    try {
      await materialService.deleteMaterial(materialId);
      await fetchMaterials();
      alert('Material deleted successfully!');
    } catch (err) {
      console.error('Error deleting material:', err);
      alert(err.error || 'Failed to delete material');
    }
  };

  if (loading && materials.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
            <p className="text-gray-600 mt-1">Share and discover educational resources</p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            {showUploadForm ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaPlus /> Upload Material
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Upload Material Form */}
        {showUploadForm && (
          <div className="mb-6">
            <MaterialForm
              onSubmit={handleUploadMaterial}
              onCancel={() => setShowUploadForm(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Edit Material Form */}
        {showEditForm && editingMaterial && (
          <div className="mb-6">
            <MaterialForm
              initialData={editingMaterial}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Materials List */}
        {materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              No materials yet. Be the first to upload one!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map(material => (
              <MaterialCard
                key={material._id}
                material={material}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShareClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">Share Material</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                {/* Search Contacts */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {/* Contacts List */}
                <div className="max-h-96 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No contacts found. Start chatting with users to add them to your contacts.
                    </p>
                  ) : filteredContacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No contacts match your search.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredContacts.map(contact => (
                        <label
                          key={contact._id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact._id)}
                            onChange={() => toggleContactSelection(contact._id)}
                            className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-4 border-t">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareSubmit}
                  disabled={selectedContacts.length === 0}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Share ({selectedContacts.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;
