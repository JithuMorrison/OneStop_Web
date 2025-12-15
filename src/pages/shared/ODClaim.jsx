import { useState, useEffect } from 'react';
import { useAuth } from '../../context/UserContext.jsx';
import {
  createODClaim,
  getStudentODClaims,
  getTeacherODClaims,
  updateODStatus
} from '../../services/odService.jsx';
import axios from 'axios';
import { supabase } from '../../services/supabaseClient.jsx';
import { FaPlus, FaTimes, FaUpload } from 'react-icons/fa';

/**
 * ODClaim page component
 * Displays different views for students and teachers:
 * - Students: OD creation form and their claim list
 * - Teachers: OD approval interface with filters
 */
const ODClaim = () => {
  const { user } = useAuth();
  const [odClaims, setOdClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Student form state
  const [formData, setFormData] = useState({
    event_name: '',
    teacher_id: '',
    description: '',
    event_id: '',
    dates: [],
    proof_url: ''
  });
  
  // Date and file upload state
  const [newDate, setNewDate] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  
  // Teacher filter state
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Teachers list for dropdown
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  // Events list for dropdown
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  /**
   * Fetch teachers and events for the dropdowns
   */
  useEffect(() => {
    const fetchTeachers = async () => {
      if (user?.role !== 'student') return;
      
      setLoadingTeachers(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/users?role=teacher', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeachers(response.data.users || []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
      } finally {
        setLoadingTeachers(false);
      }
    };

    const fetchEvents = async () => {
      if (user?.role !== 'student') return;
      
      setLoadingEvents(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(response.data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchTeachers();
    fetchEvents();
  }, [user]);

  /**
   * Fetch OD claims based on user role
   */
  useEffect(() => {
    const fetchODClaims = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        let claims;
        const userId = user._id || user.id;
        if (user.role === 'student') {
          claims = await getStudentODClaims(userId);
        } else if (user.role === 'teacher') {
          const status = statusFilter === 'all' ? null : statusFilter;
          claims = await getTeacherODClaims(userId, status);
        }
        setOdClaims(claims || []);
      } catch (err) {
        console.error('Error fetching OD claims:', err);
        setError(err.error || 'Failed to fetch OD claims');
      } finally {
        setLoading(false);
      }
    };

    fetchODClaims();
  }, [user, statusFilter]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Add date to the dates array
   */
  const handleAddDate = () => {
    if (newDate && !formData.dates.includes(newDate)) {
      setFormData(prev => ({
        ...prev,
        dates: [...prev.dates, newDate].sort()
      }));
      setNewDate('');
    }
  };

  /**
   * Remove date from the dates array
   */
  const handleRemoveDate = (dateToRemove) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter(date => date !== dateToRemove)
    }));
  };

  /**
   * Handle proof file upload to Supabase
   */
  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploadingProof(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `od-claims/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jithu')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jithu')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        proof_url: publicUrl
      }));
      setProofFile(file);
      setSuccess('Proof file uploaded successfully!');
    } catch (err) {
      console.error('Error uploading proof:', err);
      setError(err.message || 'Failed to upload proof file');
    } finally {
      setUploadingProof(false);
    }
  };

  /**
   * Handle OD claim submission (students)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.event_name || !formData.teacher_id || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate dates
    if (formData.dates.length === 0) {
      setError('Please add at least one date for the OD claim');
      return;
    }

    try {
      const result = await createODClaim({
        event_name: formData.event_name,
        teacher_id: formData.teacher_id,
        description: formData.description,
        event_id: formData.event_id || null,
        dates: formData.dates,
        proof_url: formData.proof_url || null
      });

      setSuccess('OD claim submitted successfully!');
      
      // Reset form
      setFormData({
        event_name: '',
        teacher_id: '',
        description: '',
        event_id: '',
        dates: [],
        proof_url: ''
      });
      setProofFile(null);
      setNewDate('');

      // Refresh claims list
      const userId = user._id || user.id;
      const claims = await getStudentODClaims(userId);
      setOdClaims(claims || []);
    } catch (err) {
      console.error('Error creating OD claim:', err);
      setError(err.error || 'Failed to create OD claim');
    }
  };

  /**
   * Handle OD claim status update (teachers)
   */
  const handleStatusUpdate = async (odClaimId, newStatus) => {
    setError(null);
    setSuccess(null);

    try {
      await updateODStatus(odClaimId, newStatus);
      setSuccess(`OD claim ${newStatus} successfully!`);

      // Refresh claims list
      const status = statusFilter === 'all' ? null : statusFilter;
      const claims = await getTeacherODClaims(user.id, status);
      setOdClaims(claims || []);
    } catch (err) {
      console.error('Error updating OD claim status:', err);
      setError(err.error || 'Failed to update OD claim status');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && odClaims.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading OD claims...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">OD Claims</h1>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Student View */}
      {user?.role === 'student' && (
        <div className="space-y-8">
          {/* OD Claim Creation Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Submit OD Claim</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="event_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  id="event_name"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event, workshop, or hackathon name"
                  required
                />
              </div>

              <div>
                <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Related Event (Optional)
                </label>
                <select
                  id="event_id"
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingEvents}
                >
                  <option value="">N/A - No event</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name} ({event.type}) - {new Date(event.start_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select an event if this OD is related to a registered event
                </p>
              </div>

              <div>
                <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Responsible Teacher *
                </label>
                <select
                  id="teacher_id"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingTeachers}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your participation and reason for OD"
                  required
                />
              </div>

              {/* Dates Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OD Dates * (Add all dates you need OD for)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDate}
                    disabled={!newDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <FaPlus /> Add Date
                  </button>
                </div>
                
                {/* Display added dates */}
                {formData.dates.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-sm text-gray-600">Selected Dates ({formData.dates.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.dates.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm text-blue-900">
                            {new Date(date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(date)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.dates.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">Please add at least one date</p>
                )}
              </div>

              {/* Proof Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof Document (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer transition-colors">
                    <FaUpload />
                    <span>{uploadingProof ? 'Uploading...' : 'Upload Proof'}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleProofUpload}
                      className="hidden"
                      disabled={uploadingProof}
                    />
                  </label>
                  {proofFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>✓ {proofFile.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload certificate, invitation, or any proof document (PDF, Image, or Word - Max 5MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={formData.dates.length === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Submit OD Claim
              </button>
            </form>
          </div>

          {/* Student's OD Claims List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">My OD Claims</h2>
            {odClaims.length === 0 ? (
              <p className="text-gray-500">No OD claims submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {odClaims.map(claim => (
                  <div key={claim._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{claim.event_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{claim.description}</p>
                    
                    {/* Display OD Dates */}
                    {claim.dates && claim.dates.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">OD Dates:</p>
                        <div className="flex flex-wrap gap-2">
                          {claim.dates.map((date, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Display Proof Link */}
                    {claim.proof_url && (
                      <div className="mb-2">
                        <a
                          href={claim.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-800 underline"
                        >
                          📎 View Proof Document
                        </a>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        <span className="font-medium">Teacher:</span>{' '}
                        {claim.teacher_id?.name || 'N/A'}
                      </p>
                      <p>
                        <span className="font-medium">Submitted:</span>{' '}
                        {formatDate(claim.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher View */}
      {user?.role === 'teacher' && (
        <div className="space-y-6">
          {/* Status Filter */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Filter OD Claims</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  statusFilter === 'accepted'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* OD Claims List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              OD Claims {statusFilter !== 'all' && `(${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})`}
            </h2>
            {odClaims.length === 0 ? (
              <p className="text-gray-500">No OD claims found.</p>
            ) : (
              <div className="space-y-4">
                {odClaims.map(claim => (
                  <div key={claim._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{claim.event_name}</h3>
                        <p className="text-sm text-gray-600">
                          Student: {claim.student_id?.name || 'N/A'} 
                          {claim.student_id?.roll_number && ` (${claim.student_id.roll_number})`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{claim.description}</p>
                    
                    {/* Display OD Dates */}
                    {claim.dates && claim.dates.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">OD Dates:</p>
                        <div className="flex flex-wrap gap-2">
                          {claim.dates.map((date, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Display Proof Link */}
                    {claim.proof_url && (
                      <div className="mb-3">
                        <a
                          href={claim.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-800 underline font-medium"
                        >
                          📎 View Proof Document
                        </a>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mb-3">
                      <p>
                        <span className="font-medium">Submitted:</span>{' '}
                        {formatDate(claim.createdAt)}
                      </p>
                    </div>
                    
                    {/* Action Buttons (only for pending claims) */}
                    {claim.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(claim._id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(claim._id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin View (if needed) */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">Admin view for OD claims is not implemented yet.</p>
        </div>
      )}
    </div>
  );
};

export default ODClaim;
