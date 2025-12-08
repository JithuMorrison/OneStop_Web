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
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    registration_enabled: initialData?.registration_enabled || false,
    registration_fields: initialData?.registration_fields || [],
    registration_role_restriction: initialData?.registration_role_restriction || 'all',
    additional_images: initialData?.additional_images || []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialData?.image || '');
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [imageInputType, setImageInputType] = useState('upload'); // 'upload' or 'url'
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
      setImageUrl(''); // Clear URL if file is selected
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null); // Clear file if URL is entered
    setImagePreview(url);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  // Auto-generate hashtag when title, category, or dates change
  const generateHashtag = () => {
    if (formData.title && formData.category && formData.start_date && formData.end_date) {
      const eventName = formData.title.replace(/\s+/g, '').substring(0, 20);
      const type = formData.category.replace(/\s+/g, '');
      
      // Format dates as DD-MM-YYYY
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
      
      const startDate = formatDate(formData.start_date);
      const endDate = formatDate(formData.end_date);
      
      return `#${type}_${eventName}_${startDate}_${endDate}`;
    }
    return '';
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

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (!imageFile && !imageUrl && !imagePreview) {
      newErrors.image = 'Image is required (upload or provide URL)';
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
      // Generate hashtag automatically
      const hashtag = generateHashtag();
      const submissionData = {
        ...formData,
        hashtag
      };
      
      // Pass both form data and image (file or URL)
      await onSubmit(submissionData, imageFile, imageUrl);
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

        {/* Event Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Start Date *
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.start_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              End Date *
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.end_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>
        </div>

        {/* Auto-generated Hashtag Preview */}
        {formData.title && formData.category && formData.start_date && formData.end_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Auto-generated Hashtag:</span>
              <span className="ml-2 text-blue-600 font-mono">{generateHashtag()}</span>
            </p>
          </div>
        )}

        {/* Image Upload or URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Image *
          </label>
          
          {/* Toggle between upload and URL */}
          <div className="flex gap-4 mb-3">
            <button
              type="button"
              onClick={() => setImageInputType('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                imageInputType === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setImageInputType('url')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                imageInputType === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Image URL
            </button>
          </div>

          {imageInputType === 'upload' ? (
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
          ) : (
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
          
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

        {/* Registration Settings */}
        {formData.registration_enabled && (
          <>
            {/* Role Restriction */}
            <div>
              <label htmlFor="registration_role_restriction" className="block text-sm font-medium text-gray-700 mb-2">
                Who Can Register?
              </label>
              <select
                id="registration_role_restriction"
                name="registration_role_restriction"
                value={formData.registration_role_restriction}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All (Students & Teachers)</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Restrict registration to specific user roles
              </p>
            </div>

            {/* Registration Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Registration Fields
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Name, Email, and Role are automatically captured. Add any additional fields below.
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRegistrationField}
                  onChange={(e) => setNewRegistrationField(e.target.value)}
                  placeholder="Enter field name (e.g., Phone Number, Department)"
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
          </>
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
