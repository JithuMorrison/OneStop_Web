/**
 * ChatPanel Component
 * Standalone chat panel that can be embedded in pages like Profile
 * This is a simplified version of RightPanel for inline use
 */

import { useState, useEffect, useRef } from 'react';
import { 
  FaSearch, 
  FaUser, 
  FaPaperPlane,
  FaChevronLeft
} from 'react-icons/fa';
import { useAuth } from '../../context/UserContext.jsx';
import * as chatService from '../../services/chatService.jsx';
import * as userService from '../../services/userService.jsx';

/**
 * ChatPanel component for inline chat functionality
 * @param {Object} props - Component props
 * @param {string} props.targetUserId - Optional user ID to start chat with automatically
 * @param {string} props.className - Additional CSS classes
 */
const ChatPanel = ({ targetUserId, className = '' }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const pollCleanupRef = useRef(null);

  /**
   * Auto-scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Load chat threads on mount
   */
  useEffect(() => {
    if (user) {
      loadChatThreads();
    }
  }, [user]);

  /**
   * Auto-start chat with targetUserId if provided
   */
  useEffect(() => {
    if (targetUserId && chatThreads.length > 0 && user) {
      const existingThread = chatThreads.find(thread =>
        thread.otherUser?.id === targetUserId
      );

      if (existingThread) {
        setSelectedThread(existingThread);
      } else {
        fetchAndStartChat(targetUserId);
      }
    }
  }, [targetUserId, chatThreads, user]);

  /**
   * Load messages when a thread is selected
   * Set up polling for real-time message updates
   */
  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread._id);
      
      // Start polling for new messages
      pollCleanupRef.current = chatService.pollMessages(
        selectedThread._id,
        (updatedMessages) => {
          setMessages(updatedMessages);
        },
        3000
      );
    }
    
    // Cleanup polling when thread changes
    return () => {
      if (pollCleanupRef.current) {
        pollCleanupRef.current();
      }
    };
  }, [selectedThread]);

  /**
   * Fetch target user info and start chat
   */
  const fetchAndStartChat = async (targetId) => {
    try {
      const targetUser = await userService.getUserById(targetId);
      
      const userForChat = {
        id: targetUser._id,
        name: targetUser.username || targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      };
      
      startChat(userForChat);
    } catch (error) {
      console.error('Error fetching target user:', error);
    }
  };

  /**
   * Load user's chat threads
   */
  const loadChatThreads = async () => {
    try {
      setLoading(true);
      const threads = await chatService.getChatThreads();
      
      const transformedThreads = threads.map(thread => {
        const otherUser = thread.participants.find(p => p._id !== user.id);
        const lastMessage = thread.messages.length > 0 
          ? thread.messages[thread.messages.length - 1] 
          : null;
        
        return {
          ...thread,
          otherUser: otherUser ? {
            id: otherUser._id,
            name: otherUser.username,
            email: otherUser.email
          } : null,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.timestamp || thread.updatedAt
        };
      });
      
      setChatThreads(transformedThreads);
    } catch (error) {
      console.error('Error loading chat threads:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load messages for a chat thread
   */
  const loadMessages = async (threadId) => {
    try {
      setLoading(true);
      const chat = await chatService.getChatMessages(threadId);
      
      const transformedMessages = chat.messages.map(msg => ({
        id: msg._id,
        senderId: msg.sender._id || msg.sender,
        senderName: msg.sender.username || 'Unknown',
        content: msg.content,
        createdAt: msg.timestamp,
        read: true
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search for users by email
   */
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await userService.searchUserByEmail(query);
      
      const transformedResults = Array.isArray(results) 
        ? results.map(u => ({
            id: u._id,
            name: u.username || u.name,
            email: u.email,
            role: u.role
          }))
        : results 
          ? [{
              id: results._id,
              name: results.username || results.name,
              email: results.email,
              role: results.role
            }]
          : [];
      
      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  /**
   * Start a new chat with a user
   */
  const startChat = async (otherUser) => {
    try {
      const existingThread = chatThreads.find(thread =>
        thread.otherUser?.id === otherUser.id
      );

      if (existingThread) {
        setSelectedThread(existingThread);
      } else {
        const newChatData = await chatService.createChatThread(otherUser.id);
        
        const newThread = {
          ...newChatData,
          otherUser: otherUser,
          lastMessage: null,
          lastMessageTime: new Date()
        };
        
        setChatThreads([newThread, ...chatThreads]);
        setSelectedThread(newThread);
      }
      
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  /**
   * Send a message in the current thread
   */
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedThread) {
      return;
    }

    const messageContent = messageInput.trim();
    setMessageInput('');

    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        content: messageContent,
        createdAt: new Date(),
        read: false
      };
      
      setMessages([...messages, tempMessage]);
      
      await chatService.sendMessage(selectedThread._id, messageContent);
      
      const updatedThreads = chatThreads.map(thread =>
        thread._id === selectedThread._id
          ? { ...thread, lastMessage: messageContent, lastMessageTime: new Date() }
          : thread
      );
      setChatThreads(updatedThreads);
      
      setTimeout(() => loadMessages(selectedThread._id), 500);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(messages.filter(msg => msg.id !== `temp-${Date.now()}`));
      setMessageInput(messageContent);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedThread ? 'Chat' : 'Messages'}
        </h2>
      </div>

      {/* Content */}
      {selectedThread ? (
        // Chat View
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center p-3 border-b border-gray-200">
            <button
              onClick={() => setSelectedThread(null)}
              className="p-2 mr-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Back to threads"
            >
              <FaChevronLeft />
            </button>
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {selectedThread.otherUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {selectedThread.otherUser?.name || 'Unknown User'}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedThread.otherUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '400px', maxHeight: '500px' }}>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-500">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500">
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isSent = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isSent
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSent ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Thread List View
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search by email..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Search Results */}
            {showSearch && searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => startChat(result)}
                    className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold mr-3">
                      {result.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{result.name}</p>
                      <p className="text-xs text-gray-500">{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Threads */}
          <div className="flex-1 overflow-y-auto" style={{ minHeight: '400px', maxHeight: '500px' }}>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-500">Loading chats...</div>
              </div>
            ) : chatThreads.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full p-6 text-center">
                <FaUser className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">No conversations yet</p>
                <p className="text-sm text-gray-400">
                  Search for users by email to start chatting
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {chatThreads.map((thread) => (
                  <button
                    key={thread._id}
                    onClick={() => setSelectedThread(thread)}
                    className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0">
                      {thread.otherUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {thread.otherUser?.name || 'Unknown User'}
                        </h3>
                        {thread.lastMessageTime && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(thread.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {thread.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
