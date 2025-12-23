import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaExternalLinkAlt, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { createPortal, getPortals, createTool, getTools, editPortal, deletePortal, editTool, deleteTool } from '../../services/portalToolService.jsx';

/**
 * PortalsTools page - Display and manage portals and tools
 */
const PortalsTools = () => {
  const [portals, setPortals] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPortalForm, setShowPortalForm] = useState(false);
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingPortal, setEditingPortal] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const [showPortalOptions, setShowPortalOptions] = useState(null);
  const [showToolOptions, setShowToolOptions] = useState(null);

  // Get current user
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === 'admin';

  // Form state for portal
  const [portalFormData, setPortalFormData] = useState({
    title: '',
    description: '',
    external_link: ''
  });

  // Form state for tool
  const [toolFormData, setToolFormData] = useState({
    title: '',
    description: '',
    external_link: ''
  });

  // Load portals and tools on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [portalsData, toolsData] = await Promise.all([
        getPortals(),
        getTools()
      ]);
      setPortals(portalsData);
      setTools(toolsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortal = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);

      // Validate required fields
      if (!portalFormData.title || !portalFormData.description || !portalFormData.external_link) {
        throw new Error('All fields are required');
      }

      await createPortal(portalFormData);
      
      // Reset form and reload data
      setPortalFormData({ title: '', description: '', external_link: '' });
      setShowPortalForm(false);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || 'Failed to create portal');
    }
  };

  const handleCreateTool = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);

      // Validate required fields
      if (!toolFormData.title || !toolFormData.description || !toolFormData.external_link) {
        throw new Error('All fields are required');
      }

      await createTool(toolFormData);
      
      // Reset form and reload data
      setToolFormData({ title: '', description: '', external_link: '' });
      setShowToolForm(false);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || 'Failed to create tool');
    }
  };

  // Portal edit/delete handlers
  const handleEditPortal = (portal) => {
    setEditingPortal(portal);
    setPortalFormData({
      title: portal.title,
      description: portal.description,
      external_link: portal.external_link
    });
    setShowPortalForm(true);
    setShowPortalOptions(null);
  };

  const handleUpdatePortal = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      await editPortal(editingPortal._id, portalFormData);
      
      setPortalFormData({ title: '', description: '', external_link: '' });
      setShowPortalForm(false);
      setEditingPortal(null);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || 'Failed to update portal');
    }
  };

  const handleDeletePortal = async (portalId) => {
    if (!confirm('Are you sure you want to delete this portal?')) return;
    
    try {
      setError(null);
      await deletePortal(portalId);
      setShowPortalOptions(null);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || 'Failed to delete portal');
    }
  };

  // Tool edit/delete handlers
  const handleEditTool = (tool) => {
    setEditingTool(tool);
    setToolFormData({
      title: tool.title,
      description: tool.description,
      external_link: tool.external_link
    });
    setShowToolForm(true);
    setShowToolOptions(null);
  };

  const handleUpdateTool = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      await editTool(editingTool._id, toolFormData);
      
      setToolFormData({ title: '', description: '', external_link: '' });
      setShowToolForm(false);
      setEditingTool(null);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || 'Failed to update tool');
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    
    try {
      setError(null);
      await deleteTool(toolId);
      setShowToolOptions(null);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || 'Failed to delete tool');
    }
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
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Portals Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Portals</h1>
          {isAdmin && !showPortalForm && (
            <button
              onClick={() => setShowPortalForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> Add Portal
            </button>
          )}
        </div>

        {/* Portal Creation Form */}
        {showPortalForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Create New Portal</h2>
              <button
                onClick={() => {
                  setShowPortalForm(false);
                  setPortalFormData({ title: '', description: '', external_link: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={editingPortal ? handleUpdatePortal : handleCreatePortal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={portalFormData.title}
                  onChange={(e) => setPortalFormData({ ...portalFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={portalFormData.description}
                  onChange={(e) => setPortalFormData({ ...portalFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Link *
                </label>
                <input
                  type="url"
                  value={portalFormData.external_link}
                  onChange={(e) => setPortalFormData({ ...portalFormData, external_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPortal ? 'Update Portal' : 'Create Portal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPortalForm(false);
                    setEditingPortal(null);
                    setPortalFormData({ title: '', description: '', external_link: '' });
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Portals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No portals found</p>
              {isAdmin && (
                <p className="text-gray-400 mt-2">Create the first portal to get started</p>
              )}
            </div>
          ) : (
            portals.map((portal) => (
              <div
                key={portal._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
                onClick={() => setShowPortalOptions(null)}
              >
                {/* Admin Options Menu */}
                {isAdmin && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPortalOptions(showPortalOptions === portal._id ? null : portal._id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FaEllipsisV size={16} />
                    </button>
                    
                    {showPortalOptions === portal._id && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPortal(portal);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-t-lg flex items-center gap-2 text-sm"
                        >
                          <FaEdit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePortal(portal._id);
                          }}
                          className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2 text-sm border-t border-gray-100"
                        >
                          <FaTrash size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-800 mb-2 pr-8">
                  {portal.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {portal.description}
                </p>
                <a
                  href={portal.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Visit Portal <FaExternalLinkAlt size={14} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Tools</h1>
          {isAdmin && !showToolForm && (
            <button
              onClick={() => setShowToolForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus /> Add Tool
            </button>
          )}
        </div>

        {/* Tool Creation Form */}
        {showToolForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Create New Tool</h2>
              <button
                onClick={() => {
                  setShowToolForm(false);
                  setToolFormData({ title: '', description: '', external_link: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={editingTool ? handleUpdateTool : handleCreateTool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={toolFormData.title}
                  onChange={(e) => setToolFormData({ ...toolFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={toolFormData.description}
                  onChange={(e) => setToolFormData({ ...toolFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Link *
                </label>
                <input
                  type="url"
                  value={toolFormData.external_link}
                  onChange={(e) => setToolFormData({ ...toolFormData, external_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingTool ? 'Update Tool' : 'Create Tool'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowToolForm(false);
                    setEditingTool(null);
                    setToolFormData({ title: '', description: '', external_link: '' });
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tools List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No tools found</p>
              {isAdmin && (
                <p className="text-gray-400 mt-2">Create the first tool to get started</p>
              )}
            </div>
          ) : (
            tools.map((tool) => (
              <div
                key={tool._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
                onClick={() => setShowToolOptions(null)}
              >
                {/* Admin Options Menu */}
                {isAdmin && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowToolOptions(showToolOptions === tool._id ? null : tool._id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FaEllipsisV size={16} />
                    </button>
                    
                    {showToolOptions === tool._id && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTool(tool);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-t-lg flex items-center gap-2 text-sm"
                        >
                          <FaEdit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTool(tool._id);
                          }}
                          className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2 text-sm border-t border-gray-100"
                        >
                          <FaTrash size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-800 mb-2 pr-8">
                  {tool.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {tool.description}
                </p>
                <a
                  href={tool.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  Visit Tool <FaExternalLinkAlt size={14} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalsTools;
