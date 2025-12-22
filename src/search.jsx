import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiMessageCircle, FiUser, FiX, FiFileText, FiBell, FiBook } from 'react-icons/fi';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa';
import postService from './services/postService.jsx';
import announcementService from './services/announcementService.jsx';
import materialService from './services/materialService.jsx';

/**
 * Search component for finding users and content
 */
const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchAllData();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    filterAll();
  }, [searchQuery, users, posts, announcements, materials]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch users
      const userResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const usersList = userData.users || [];
        const filteredList = usersList.filter(u => u._id !== currentUser?._id && u._id !== currentUser?.id);
        setUsers(filteredList);
      }

      // Fetch posts
      const postsData = await postService.getPosts();
      setPosts(postsData || []);

      // Fetch announcements
      const announcementsData = await announcementService.getAnnouncements();
      setAnnouncements(announcementsData || []);

      // Fetch materials
      const materialsData = await materialService.getMaterials();
      setMaterials(materialsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAll = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      setFilteredPosts([]);
      setFilteredAnnouncements([]);
      setFilteredMaterials([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Filter users
    const filteredU = users.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.dept?.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query) ||
      user.roll_number?.toLowerCase().includes(query)
    );
    setFilteredUsers(filteredU);

    // Filter posts
    const filteredP = posts.filter(post =>
      post.title?.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.hashtags?.some(tag => tag.toLowerCase().includes(query))
    );
    setFilteredPosts(filteredP);

    // Filter announcements
    const filteredA = announcements.filter(ann =>
      ann.title?.toLowerCase().includes(query) ||
      ann.description?.toLowerCase().includes(query) ||
      ann.category?.toLowerCase().includes(query) ||
      ann.hashtag?.toLowerCase().includes(query)
    );
    setFilteredAnnouncements(filteredA);

    // Filter materials
    const filteredM = materials.filter(mat =>
      mat.title?.toLowerCase().includes(query) ||
      mat.description?.toLowerCase().includes(query)
    );
    setFilteredMaterials(filteredM);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <FaUserGraduate className="text-blue-600" size={20} />;
      case 'teacher':
        return <FaChalkboardTeacher className="text-green-600" size={20} />;
      case 'admin':
        return <FaUserShield className="text-purple-600" size={20} />;
      default:
        return <FiUser className="text-gray-600" size={20} />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-700';
      case 'teacher':
        return 'bg-green-100 text-green-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleChatClick = (user) => {
    setSelectedUser(user);
    setShowChatModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      setChatLoading(true);
      const token = localStorage.getItem('token');
      
      // Step 1: Get or create chat thread
      const chatResponse = await fetch(`http://localhost:5000/api/chat/${selectedUser._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!chatResponse.ok) throw new Error('Failed to create chat');

      const chat = await chatResponse.json();

      // Step 2: Send message to the chat
      const messageResponse = await fetch(`http://localhost:5000/api/chat/${chat._id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: message.trim()
        })
      });

      if (!messageResponse.ok) throw new Error('Failed to send message');

      alert('Message sent successfully!');
      setMessage('');
      setShowChatModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Users</h1>
          <p className="text-gray-600 mt-2">Find and connect with students, teachers, and staff</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users, posts, announcements, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>

          {searchQuery && (
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <span>{filteredUsers.length} users</span>
                  <span>•</span>
                  <span>{filteredPosts.length} posts</span>
                  <span>•</span>
                  <span>{filteredAnnouncements.length} announcements</span>
                  <span>•</span>
                  <span>{filteredMaterials.length} materials</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        {searchQuery && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'users'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiUser size={18} />
                Users ({filteredUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'posts'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiFileText size={18} />
                Posts ({filteredPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'announcements'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiBell size={18} />
                Announcements ({filteredAnnouncements.length})
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'materials'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FiBook size={18} />
                Materials ({filteredMaterials.length})
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {/* Users Tab */}
                {activeTab === 'users' && (
                  filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FiUser size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No users found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {user.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            {user.dept || user.department ? (
                              <span>{user.dept || user.department}</span>
                            ) : null}
                            {user.section && (
                              <>
                                <span>•</span>
                                <span>Section {user.section}</span>
                              </>
                            )}
                            {user.year && (
                              <>
                                <span>•</span>
                                <span>Year {user.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewProfile(user._id)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <FiUser size={20} />
                        </button>
                        <button
                          onClick={() => handleChatClick(user)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          title="Send Message"
                        >
                          <FiMessageCircle size={18} />
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                      ))}
                    </div>
                  )
                )}

                {/* Posts Tab */}
                {activeTab === 'posts' && (
                  filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FiFileText size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No posts found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredPosts.map((post) => (
                        <div key={post._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/feed')}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>By {post.created_by?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            {post.hashtags && post.hashtags.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-600">{post.hashtags.join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                  filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FiBell size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No announcements found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredAnnouncements.map((announcement) => (
                        <div key={announcement._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/feed')}>
                          <div className="flex items-start gap-3">
                            {announcement.image && (
                              <img src={announcement.image} alt={announcement.title} className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">{announcement.category}</span>
                                <span>•</span>
                                <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                  filteredMaterials.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FiBook size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No materials found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredMaterials.map((material) => (
                        <div key={material._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/materials')}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{material.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>By {material.uploaded_by?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                            {material.file_url && (
                              <>
                                <span>•</span>
                                <FiBook className="inline" />
                                <span>File attached</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <FiSearch size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Search for Users and Content
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Start typing in the search bar above to find users, posts, announcements, and materials.
              You can search by name, title, description, hashtags, and more.
            </p>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedUser(null);
                    setMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Message Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Messages auto-expire after 10 hours
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedUser(null);
                    setMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || chatLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {chatLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMessageCircle size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
