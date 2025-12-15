import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/UserContext.jsx';
import { FaPlus, FaSearch, FaTimes, FaUsers, FaGlobeAmericas, FaPaperPlane, FaInfinity } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * GroupChat page component
 * Features: World Chat, Custom Groups, Club Groups
 */
const GroupChat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Create group form
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'custom', // 'custom' or 'club'
    club_id: ''
  });

  // User search for adding members
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchClubs();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup._id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedGroup._id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  useEffect(() => {
    // Only auto-scroll if flag is set
    if (shouldAutoScroll && messagesContainerRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/group-chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data || []);
      
      // Auto-select World Chat if available
      const worldChat = response.data.find(g => g.type === 'world');
      if (worldChat && !selectedGroup) {
        setSelectedGroup(worldChat);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/clubs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClubs(response.data || []);
    } catch (err) {
      console.error('Error fetching clubs:', err);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/group-chats/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/group-chats`,
        {
          ...newGroup,
          members: selectedUsers.map(u => u._id)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setGroups([...groups, response.data]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', type: 'custom', club_id: '' });
      setSelectedUsers([]);
      alert('Group created successfully!');
    } catch (err) {
      console.error('Error creating group:', err);
      alert(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedGroup) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/group-chats/${selectedGroup._id}/messages`,
        { message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessageText('');
      fetchMessages(selectedGroup._id);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleAddUser = (userToAdd) => {
    if (!selectedUsers.find(u => u._id === userToAdd._id)) {
      setSelectedUsers([...selectedUsers, userToAdd]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleAddMembersToGroup = async () => {
    if (!selectedGroup || selectedUsers.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/group-chats/${selectedGroup._id}/members`,
        { members: selectedUsers.map(u => u._id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Members added successfully!');
      setShowAddMembersModal(false);
      setSelectedUsers([]);
      setSearchQuery('');
      fetchGroups(); // Refresh groups
    } catch (err) {
      console.error('Error adding members:', err);
      alert(err.response?.data?.error || 'Failed to add members');
    }
  };

  const handleViewMembers = async () => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/group-chats/${selectedGroup._id}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupMembers(response.data || []);
      setShowMembersModal(true);
    } catch (err) {
      console.error('Error fetching members:', err);
      alert('Failed to load members');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!selectedGroup) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/group-chats/${selectedGroup._id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Member removed successfully!');
      setGroupMembers(groupMembers.filter(m => m._id !== memberId));
      fetchGroups(); // Refresh groups
    } catch (err) {
      console.error('Error removing member:', err);
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden -mx-7 -my-5 ">
      {/* Sidebar - Groups List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Group Chats</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Create Group"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {groups.map(group => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full p-3 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                selectedGroup?._id === group._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Group Icon/Logo */}
                {group.type === 'club' && group.club_id?.logo ? (
                  <img 
                    src={group.club_id.logo} 
                    alt={group.club_id.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                    group.type === 'world' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    group.type === 'club' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                    'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}>
                    {group.type === 'world' ? <FaGlobeAmericas size={20} /> : <FaUsers size={20} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{group.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {group.type === 'club' && group.club_id?.name ? (
                      <span className="text-green-600 font-medium">{group.club_id.name}</span>
                    ) : (
                      group.members?.length > 0 ? <span>{group.members?.length} members</span> : <div className="flex items-center gap-1"><FaInfinity /><span>members</span></div>
                    )}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Show club logo in header if club group */}
                  {selectedGroup.type === 'club' && selectedGroup.club_id?.logo && (
                    <img 
                      src={selectedGroup.club_id.logo} 
                      alt={selectedGroup.club_id.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">{selectedGroup.name}</h2>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedGroup.type === 'club' && selectedGroup.club_id?.name ? (
                        <span className="text-green-600 font-medium">{selectedGroup.club_id.name} • {selectedGroup.members?.length || 0} members</span>
                      ) : (
                        selectedGroup.description || `${selectedGroup.members?.length || 0} members`
                      )}
                    </p>
                  </div>
                </div>
                {selectedGroup.type !== 'world' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={handleViewMembers}
                      className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <FaUsers size={12} /> Members
                    </button>
                    <button
                      onClick={() => setShowAddMembersModal(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FaPlus size={12} /> Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" 
              onScroll={handleScroll}
            >
              {messages.map((msg, index) => {
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);
                const isOwnMessage = msg.sender?._id === user?._id;

                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {!isOwnMessage && (
                          <p className="text-xs text-gray-600 mb-1 ml-2">
                            {msg.sender?.name || 'Unknown User'}
                          </p>
                        )}
                        <div className={`rounded-lg p-3 ${
                          isOwnMessage 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <FaPaperPlane /> Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaUsers className="mx-auto text-6xl mb-4 text-gray-300" />
              <p className="text-xl">Select a group to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGroup({ name: '', description: '', type: 'custom', club_id: '' });
                  setSelectedUsers([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type
                </label>
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value, club_id: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom Group</option>
                  <option value="club">Club Group</option>
                </select>
              </div>

              {newGroup.type === 'club' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Club
                  </label>
                  <select
                    value={newGroup.club_id}
                    onChange={(e) => setNewGroup({ ...newGroup, club_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a club...</option>
                    {clubs.map(club => (
                      <option key={club._id} value={club._id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group description"
                  rows="3"
                />
              </div>

              {/* Add Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Members
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <FaSearch className="absolute left-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map(searchUser => (
                        <button
                          key={searchUser._id}
                          type="button"
                          onClick={() => handleAddUser(searchUser)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-medium text-gray-900">{searchUser.name}</p>
                          <p className="text-sm text-gray-500">{searchUser.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">Selected Members ({selectedUsers.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(selectedUser => (
                        <div
                          key={selectedUser._id}
                          className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm text-blue-900">{selectedUser.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(selectedUser._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroup({ name: '', description: '', type: 'custom', club_id: '' });
                    setSelectedUsers([]);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Members to {selectedGroup.name}</h3>
              <button
                onClick={() => {
                  setShowAddMembersModal(false);
                  setSelectedUsers([]);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4">
              {/* Search Users */}
              <div className="relative mb-4">
                <div className="flex items-center gap-2">
                  <FaSearch className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                    {searchResults.map(searchUser => (
                      <button
                        key={searchUser._id}
                        type="button"
                        onClick={() => handleAddUser(searchUser)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{searchUser.name}</p>
                        <p className="text-sm text-gray-500">{searchUser.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected ({selectedUsers.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(selectedUser => (
                      <div
                        key={selectedUser._id}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm text-blue-900">{selectedUser.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(selectedUser._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddMembersToGroup}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => {
                    setShowAddMembersModal(false);
                    setSelectedUsers([]);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Members of {selectedGroup.name} ({groupMembers.length})
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {groupMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No members found</p>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map(member => {
                    const isCreator = selectedGroup.created_by?._id === member._id || selectedGroup.created_by === member._id;
                    const isCurrentUser = user?._id === member._id;
                    const canRemove = !isCreator && !isCurrentUser && selectedGroup.type !== 'world';

                    return (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.name}
                              {isCreator && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Creator</span>}
                              {isCurrentUser && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>}
                            </p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        {canRemove && (
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;