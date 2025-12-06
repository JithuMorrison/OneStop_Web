import React, { useState } from 'react';
import { FaPlus, FaTimes, FaCalendarAlt, FaImage } from 'react-icons/fa';
import { validateHashtagFormat } from '../../utils/hashtagParser.jsx';

/**
 * AnnouncementForm component for creating announcements
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onCancel - Callback when form is cancelled
 * @param {Object} initialData - Initial form data for editing
 */
const AnnouncementForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    hashtag: initialData?.hashtag || '',
    registration_enabled: initialData?.registration_enabled || false,
    registration_fields: initialData?.registration_fields || [],
    additional_images: initialData?.additional_images || []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [newAdditionalImage, setNewAdditionalImage] = useState('');
  const [newRegistrationField, setNewRegistrationField] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPG, PNG, GIF)' }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdditionalImage = () => {
    if (newAdditionalImage.trim()) {
      // Basic URL validation
      try {
        new URL(newAdditionalImage);
        setFormData(prev => ({
          ...prev,
          additional_images: [...prev.additional_images, newAdditionalImage.trim()]
        }));
        setNewAdditionalImage('');
      } catch (error) {
        setErrors(prev => ({ ...prev, additional_images: 'Please enter a valid URL' }));
      }
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
  };

  const handleAddRegistrationField = () => {
    if (newRegistrationField.trim()) {
      setFormData(prev => ({
        ...prev,
        registration_fields: [...prev.registration_fields, newRegistrationField.trim()]
      }));
      setNewRegistrationField('');
    }
  };

  const handleRemoveRegistrationField = (index) => {
    setFormData(prev => ({
      ...prev,
      registration_fields: prev.registration_fields.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!imageFile && !imagePreview) {
      newErrors.image = 'Image is required';
    }

    if (!formData.hashtag.trim()) {
      newErrors.hashtag = 'Hashtag is required';
    } else if (!validateHashtagFormat(formData.hashtag)) {
      newErrors.hashtag = 'Hashtag must follow format: #type_eventName_DD-MM-YYYY_DD-MM-YYYY';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData, imageFile);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData ? 'Edit Announcement' : 'Create New Announcement'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter announcement title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter announcement description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Main Image *
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors duration-200">
              <FaImage />
              <span>Choose Image</span>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Image Links (Optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={newAdditionalImage}
              onChange={(e) => setNewAdditionalImage(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddAdditionalImage}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <FaPlus />
            </button>
          </div>
          {errors.additional_images && (
            <p className="mt-1 text-sm text-red-600">{errors.additional_images}</p>
          )}
          {formData.additional_images.length > 0 && (
            <div className="space-y-2 mt-2">
              {formData.additional_images.map((url, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1 text-sm text-gray-700 truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hashtag */}
        <div>
          <label htmlFor="hashtag" className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2" />
            Event Hashtag *
          </label>
          <input
            type="text"
            id="hashtag"
            name="hashtag"
            value={formData.hashtag}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.hashtag ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="#type_eventName_DD-MM-YYYY_DD-MM-YYYY"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: #type_eventName_startDate_endDate (dates in DD-MM-YYYY)
          </p>
          {errors.hashtag && (
            <p className="mt-1 text-sm text-red-600">{errors.hashtag}</p>
          )}
        </div>

        {/* Registration Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="registration_enabled"
            name="registration_enabled"
            checked={formData.registration_enabled}
            onChange={handleInputChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="registration_enabled" className="text-sm font-medium text-gray-700">
            Enable Registration
          </label>
        </div>

        {/* Registration Fields */}
        {formData.registration_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Fields
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRegistrationField}
                onChange={(e) => setNewRegistrationField(e.target.value)}
                placeholder="Enter field name (e.g., Phone Number)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddRegistrationField}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <FaPlus />
              </button>
            </div>
            {formData.registration_fields.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.registration_fields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm text-gray-700">{field}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRegistrationField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Creating...' : (initialData ? 'Update Announcement' : 'Create Announcement')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;
