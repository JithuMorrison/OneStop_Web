// src/components/forms/MaterialForm.jsx
import React, { useState } from 'react';
import { FaFileUpload, FaTimes, FaLink } from 'react-icons/fa';

/**
 * MaterialForm component for uploading and editing materials
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {boolean} props.isSubmitting - Whether form is currently submitting
 * @param {Object} props.initialData - Initial form data for editing
 */
const MaterialForm = ({ onSubmit, onCancel, isSubmitting = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    external_link: initialData?.external_link || '',
    uploadType: initialData?.file_url ? 'file' : (initialData?.external_link ? 'link' : 'file')
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUploadTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      uploadType: type,
      external_link: '' // Clear link when switching to file
    }));
    setFile(null); // Clear file when switching to link
    setErrors({});
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB max for materials)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }

      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Reset file input
    const fileInput = document.getElementById('material-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.uploadType === 'file') {
      if (!file) {
        newErrors.file = 'Please select a file to upload';
      }
    } else {
      if (!formData.external_link.trim()) {
        newErrors.external_link = 'External link is required';
      } else {
        // Basic URL validation
        try {
          new URL(formData.external_link);
        } catch {
          newErrors.external_link = 'Please enter a valid URL';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const materialData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      file: formData.uploadType === 'file' ? file : null,
      external_link: formData.uploadType === 'link' ? formData.external_link.trim() : null
    };

    if (onSubmit) {
      await onSubmit(materialData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData ? 'Edit Material' : 'Upload Material'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter material title"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the material (e.g., course notes, reference material, etc.)"
            rows="4"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Upload Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleUploadTypeChange('file')}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                formData.uploadType === 'file'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <FaFileUpload className="inline mr-2" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleUploadTypeChange('link')}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                formData.uploadType === 'link'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <FaLink className="inline mr-2" />
              External Link
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        {formData.uploadType === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFileUpload className="inline mr-1" />
              File <span className="text-red-500">*</span>
            </label>
            
            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="material-file-input"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                />
                <label
                  htmlFor="material-file-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FaFileUpload className="text-gray-400 text-4xl mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload a file
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, PPT, XLS, TXT, ZIP up to 10MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaFileUpload className="text-blue-500 text-2xl" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 p-2"
                    disabled={isSubmitting}
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {errors.file && (
              <p className="mt-1 text-sm text-red-500">{errors.file}</p>
            )}
          </div>
        )}

        {/* External Link Section */}
        {formData.uploadType === 'link' && (
          <div>
            <label htmlFor="external_link" className="block text-sm font-medium text-gray-700 mb-2">
              <FaLink className="inline mr-1" />
              External Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="external_link"
              name="external_link"
              value={formData.external_link}
              onChange={handleInputChange}
              placeholder="https://example.com/material"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.external_link ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.external_link && (
              <p className="mt-1 text-sm text-red-500">{errors.external_link}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the full URL including https://
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (initialData ? 'Updating Material...' : 'Uploading Material...') : (initialData ? 'Update Material' : 'Upload Material')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;
