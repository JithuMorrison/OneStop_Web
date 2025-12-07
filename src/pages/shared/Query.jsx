import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaCheckCircle, FaClock, FaReply } from 'react-icons/fa';
import { submitQuery, getUserQueries, getAllQueries, respondToQuery } from '../../services/queryService.jsx';

/**
 * Query page - Submit and manage queries
 * Student/Teacher view: Submit queries and view their own queries
 * Admin view: View all queries and respond to them
 */
const Query = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQueryForm, setShowQueryForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'responded'
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Get current user
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === 'admin';

  // Form state for query submission
  const [queryFormData, setQueryFormData] = useState({
    title: '',
    description: ''
  });

  // Response form state
  const [responseText, setResponseText] = useState('');

  // Load queries on mount and when filter changes
  useEffect(() => {
    loadQueries();
  }, [statusFilter]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      setError(null);

      let queriesData;
      if (isAdmin) {
        // Admin sees all queries
        const filter = statusFilter === 'all' ? null : statusFilter;
        queriesData = await getAllQueries(filter);
      } else {
        // Students and teachers see only their own queries
        queriesData = await getUserQueries(currentUser._id);
        
        // Apply client-side filter for non-admin users
        if (statusFilter !== 'all') {
          queriesData = queriesData.filter(q => q.status === statusFilter);
        }
      }

      setQueries(queriesData);
    } catch (err) {
      setError(err.error || err.message || 'Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);

      // Validate required fields
      if (!queryFormData.title || !queryFormData.description) {
        throw new Error('Title and description are required');
      }

      await submitQuery(queryFormData);
      
      // Reset form and reload data
      setQueryFormData({ title: '', description: '' });
      setShowQueryForm(false);
      await loadQueries();
    } catch (err) {
      setError(err.error || err.message || 'Failed to submit query');
    }
  };

  const handleRespondToQuery = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);

      if (!responseText.trim()) {
        throw new Error('Response cannot be empty');
      }

      await respondToQuery(selectedQuery._id, responseText);
      
      // Reset and reload
      setResponseText('');
      setShowResponseModal(false);
      setSelectedQuery(null);
      await loadQueries();
    } catch (err) {
      setError(err.error || err.message || 'Failed to respond to query');
    }
  };

  const openResponseModal = (query) => {
    setSelectedQuery(query);
    setResponseText('');
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setSelectedQuery(null);
    setResponseText('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? 'All Queries' : 'My Queries'}
        </h1>
        {!isAdmin && !showQueryForm && (
          <button
            onClick={() => setShowQueryForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> Submit Query
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('responded')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'responded'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Responded
        </button>
      </div>

      {/* Query Submission Form (Non-Admin) */}
      {showQueryForm && !isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Submit New Query</h2>
            <button
              onClick={() => {
                setShowQueryForm(false);
                setQueryFormData({ title: '', description: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmitQuery} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={queryFormData.title}
                onChange={(e) => setQueryFormData({ ...queryFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief summary of your query"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={queryFormData.description}
                onChange={(e) => setQueryFormData({ ...queryFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="5"
                placeholder="Provide detailed information about your query"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Query
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQueryForm(false);
                  setQueryFormData({ title: '', description: '' });
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Queries List */}
      <div className="space-y-4">
        {queries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No queries found</p>
            {!isAdmin && (
              <p className="text-gray-400 mt-2">Submit your first query to get help from admin</p>
            )}
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* Query Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {query.title}
                  </h3>
                  {isAdmin && query.submitted_by && (
                    <p className="text-sm text-gray-600">
                      Submitted by: <span className="font-medium">{query.submitted_by.name}</span>
                      {' '}({query.submitted_by.email}) - {query.submitter_role}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(query.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {query.status === 'pending' ? (
                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <FaClock size={12} /> Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <FaCheckCircle size={12} /> Responded
                    </span>
                  )}
                </div>
              </div>

              {/* Query Description */}
              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{query.description}</p>
              </div>

              {/* Admin Response */}
              {query.status === 'responded' && query.response && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Admin Response:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{query.response}</p>
                  {query.responded_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on: {new Date(query.responded_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && query.status === 'pending' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => openResponseModal(query)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaReply /> Respond
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Response Modal (Admin) */}
      {showResponseModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Respond to Query</h2>
                <button
                  onClick={closeResponseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Query Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">{selectedQuery.title}</h3>
                <p className="text-gray-700 text-sm mb-2">{selectedQuery.description}</p>
                {selectedQuery.submitted_by && (
                  <p className="text-xs text-gray-600">
                    From: {selectedQuery.submitted_by.name} ({selectedQuery.submitted_by.email})
                  </p>
                )}
              </div>

              {/* Response Form */}
              <form onSubmit={handleRespondToQuery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Response *
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="6"
                    placeholder="Provide a detailed response to help the user"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Response
                  </button>
                  <button
                    type="button"
                    onClick={closeResponseModal}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
  );
};

export default Query;
