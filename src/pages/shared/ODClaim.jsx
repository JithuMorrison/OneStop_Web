import { useState, useEffect } from 'react';
import { useAuth } from '../../context/UserContext.jsx';
import {
  createODClaim,
  getStudentODClaims,
  getTeacherODClaims,
  updateODStatus
} from '../../services/odService.jsx';
import axios from 'axios';

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
    event_id: ''
  });
  
  // Teacher filter state
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Teachers list for dropdown
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  /**
   * Fetch teachers for the dropdown
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

    fetchTeachers();
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
        if (user.role === 'student') {
          claims = await getStudentODClaims(user.id);
        } else if (user.role === 'teacher') {
          const status = statusFilter === 'all' ? null : statusFilter;
          claims = await getTeacherODClaims(user.id, status);
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

    try {
      const result = await createODClaim({
        event_name: formData.event_name,
        teacher_id: formData.teacher_id,
        description: formData.description,
        event_id: formData.event_id || null
      });

      setSuccess('OD claim submitted successfully!');
      
      // Reset form
      setFormData({
        event_name: '',
        teacher_id: '',
        description: '',
        event_id: ''
      });

      // Refresh claims list
      const claims = await getStudentODClaims(user.id);
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

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
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
