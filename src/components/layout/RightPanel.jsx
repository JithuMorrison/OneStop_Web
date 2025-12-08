import { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaSearch, 
  FaUser, 
  FaPaperPlane,
  FaChevronLeft
} from 'react-icons/fa';
import { useAuth } from '../../context/UserContext.jsx';
import * as chatService from '../../services/chatService.jsx';
import * as userService from '../../services/userService.jsx';

/**
 * RightPanel component - Toggleable chat panel with contact list and chat threads
 * Implements contact list display and chat thread selection
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {Function} props.onToggle - Callback to toggle panel visibility
 * @param {string} props.userId - Current user ID
 * @param {string} props.targetUserId - Optional user ID to start chat with automatically (for other users' profiles)
 */
const RightPanel = ({ isOpen, onToggle, userId, targetUserId }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const pollCleanupRef = useRef(null);
  const threadPollCleanupRef = useRef(null);

  /**
   * Auto-scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Determine if viewing own profile or another user's profile
   */
  useEffect(() => {
    setIsOwnProfile(!targetUserId || targetUserId === user?.id);
  }, [targetUserId, user]);

  /**
   * Load chat threads and contacts on mount
   * Set up polling for real-time updates
   */
  useEffect(() => {
    if (isOpen && user) {
      loadChatThreads();
      
      // Start polling for chat thread updates only if on own profile
      // Delay the first poll to avoid duplicate loading
      if (isOwnProfile) {
        const pollInterval = setInterval(async () => {
          try {
            const updatedChats = await chatService.getChatThreads();
            
            // Transform threads to include other user info
            const transformedThreads = updatedChats.map(thread => {
              // Find the other user (not the current user)
              const otherUser = thread.participants.find(p => {
                const participantId = p._id || p;
                return participantId !== user.id && participantId !== user._id;
              });
              
              const lastMessage = thread.messages.length > 0 
                ? thread.messages[thread.messages.length - 1] 
                : null;
              
              return {
                ...thread,
                otherUser: otherUser ? {
                  id: otherUser._id || otherUser,
                  name: otherUser.username || otherUser.name || 'Unknown User',
                  email: otherUser.email || ''
                } : null,
                lastMessage: lastMessage?.content || null,
                lastMessageTime: lastMessage?.timestamp || thread.updatedAt,
                unreadCount: 0
              };
            });
            
            setChatThreads(transformedThreads);
          } catch (error) {
            console.error('Error polling chat threads:', error);
          }
        }, 5000);
        
        threadPollCleanupRef.current = () => clearInterval(pollInterval);
      }
    }
    
    // Cleanup polling on unmount or when panel closes
    return () => {
      if (threadPollCleanupRef.current) {
        threadPollCleanupRef.current();
      }
    };
  }, [isOpen, user, isOwnProfile]);

  /**
   * Update contacts when chat threads change
   */
  useEffect(() => {
    if (chatThreads.length > 0) {
      loadContacts();
    }
  }, [chatThreads]);

  /**
   * Auto-start chat with targetUserId if provided (when viewing another user's profile)
   */
  useEffect(() => {
    if (isOpen && targetUserId && !isOwnProfile) {
      // When viewing another user's profile, automatically open chat with them
      if (chatThreads.length > 0) {
        const existingThread = chatThreads.find(thread =>
          thread.participants.some(p => p._id === targetUserId || p === targetUserId)
        );

        if (existingThread) {
          setSelectedThread(existingThread);
        } else {
          // Create a new thread with the target user
          fetchAndStartChat(targetUserId);
        }
      } else {
        // If no threads loaded yet, create new chat
        fetchAndStartChat(targetUserId);
      }
    }
  }, [isOpen, targetUserId, chatThreads, isOwnProfile]);

  /**
   * Fetch target user info and start chat
   * @param {string} targetId - Target user ID
   */
  const fetchAndStartChat = async (targetId) => {
    try {
      // Fetch the actual user info from backend
      const targetUser = await userService.getUserById(targetId);
      
      // Transform to expected format
      const userForChat = {
        id: targetUser._id,
        name: targetUser.name || targetUser.username,
        email: targetUser.email,
        role: targetUser.role
      };
      
      startChat(userForChat);
    } catch (error) {
      console.error('Error fetching target user:', error);
    }
  };

  /**
   * Load messages when a thread is selected
   * Set up polling for real-time message updates
   */
  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread._id);
      
      // Start polling for new messages - delay first poll to avoid duplicate
      const pollInterval = setInterval(async () => {
        try {
          const chat = await chatService.getChatMessages(selectedThread._id);
          
          // Transform messages to match component format
          const transformedMessages = chat.messages.map(msg => {
            // Extract sender ID - handle both populated and non-populated sender
            let senderId;
            if (typeof msg.sender === 'object' && msg.sender !== null) {
              senderId = msg.sender._id || msg.sender.id;
            } else {
              senderId = msg.sender;
            }
            
            return {
              id: msg._id,
              senderId: senderId,
              senderName: msg.sender?.username || msg.sender?.name || 'Unknown',
              content: msg.content,
              createdAt: msg.timestamp,
              read: true
            };
          });
          
          setMessages(transformedMessages);
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }, 3000);
      
      pollCleanupRef.current = () => clearInterval(pollInterval);
    }
    
    // Cleanup polling when thread changes or component unmounts
    return () => {
      if (pollCleanupRef.current) {
        pollCleanupRef.current();
      }
    };
  }, [selectedThread]);

  /**
   * Load user's chat threads
   */
  const loadChatThreads = async () => {
    try {
      setLoading(true);
      const threads = await chatService.getChatThreads();
      
      // Transform threads to include other user info
      const transformedThreads = threads.map(thread => {
        // Find the other user (not the current user)
        const otherUser = thread.participants.find(p => {
          const participantId = p._id || p;
          return participantId !== user.id && participantId !== user._id;
        });
        
        const lastMessage = thread.messages.length > 0 
          ? thread.messages[thread.messages.length - 1] 
          : null;
        
        return {
          ...thread,
          otherUser: otherUser ? {
            id: otherUser._id || otherUser,
            name: otherUser.username || otherUser.name || 'Unknown User',
            email: otherUser.email || ''
          } : null,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.timestamp || thread.updatedAt,
          unreadCount: 0
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
   * Load user's contacts
   * Contacts are users the current user has chatted with
   */
  const loadContacts = async () => {
    try {
      // Extract unique contacts from chat threads
      const uniqueContacts = [];
      const seenIds = new Set();
      
      chatThreads.forEach(thread => {
        if (thread.otherUser && !seenIds.has(thread.otherUser.id)) {
          seenIds.add(thread.otherUser.id);
          uniqueContacts.push({
            id: thread.otherUser.id,
            name: thread.otherUser.name,
            email: thread.otherUser.email,
            role: 'user' // Role info not available in chat threads
          });
        }
      });
      
      setContacts(uniqueContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  /**
   * Load messages for a chat thread
   * @param {string} threadId - Chat thread ID
   */
  const loadMessages = async (threadId) => {
    try {
      setLoading(true);
      const chat = await chatService.getChatMessages(threadId);
      
      // Transform messages to match component format
      const transformedMessages = chat.messages.map(msg => {
        // Extract sender ID - handle both populated and non-populated sender
        let senderId;
        if (typeof msg.sender === 'object' && msg.sender !== null) {
          senderId = msg.sender._id || msg.sender.id;
        } else {
          senderId = msg.sender;
        }
        
        return {
          id: msg._id,
          senderId: senderId,
          senderName: msg.sender?.username || msg.sender?.name || 'Unknown',
          content: msg.content,
          createdAt: msg.timestamp,
          read: true
        };
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search for users by email
   * @param {string} query - Search query
   */
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await userService.searchUserByEmail(query);
      
      // Transform results to match component format
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
   * @param {Object} otherUser - User to chat with
   */
  const startChat = async (otherUser) => {
    try {
      // Check if thread already exists
      const existingThread = chatThreads.find(thread =>
        thread.otherUser?.id === otherUser.id
      );

      if (existingThread) {
        setSelectedThread(existingThread);
      } else {
        // Create new chat thread via API
        const newChatData = await chatService.createChatThread(otherUser.id);
        
        // Transform to component format
        const newThread = {
          ...newChatData,
          otherUser: otherUser,
          lastMessage: null,
          lastMessageTime: new Date(),
          unreadCount: 0
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
    setMessageInput(''); // Clear input immediately for better UX

    try {
      // Optimistically add message to UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        content: messageContent,
        createdAt: new Date(),
        read: false
      };
      
      setMessages([...messages, tempMessage]);
      
      // Send message to backend
      await chatService.sendMessage(selectedThread._id, messageContent);
      
      // Update thread's last message
      const updatedThreads = chatThreads.map(thread =>
        thread._id === selectedThread._id
          ? { ...thread, lastMessage: messageContent, lastMessageTime: new Date() }
          : thread
      );
      setChatThreads(updatedThreads);
      
      // Reload messages to get the actual message from server
      // This will be handled by polling, but we can do it immediately for better UX
      setTimeout(() => loadMessages(selectedThread._id), 500);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(messages.filter(msg => msg.id !== `temp-${Date.now()}`));
      setMessageInput(messageContent); // Restore message input
    }
  };

  /**
   * Format timestamp for display
   * @param {Date} date - Date to format
   * @returns {string} - Formatted time string
   */
  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(messageDate.getTime())) return '';
    
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // If message is from today, show time
    const isToday = messageDate.toDateString() === now.toDateString();
    if (isToday) {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      // Show actual time for today's messages
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If message is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If within last week, show day name
    if (diffDays < 7) {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedThread ? 'Chat' : 'Messages'}
        </h2>
        <button
          onClick={onToggle}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close chat panel"
        >
          <FaTimes />
        </button>
      </div>

      {/* Content */}
      {selectedThread ? (
        // Chat View
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center p-3 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setSelectedThread(null);
                // If not own profile, close the panel entirely
                if (!isOwnProfile) {
                  onToggle();
                }
              }}
              className="p-2 mr-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label={isOwnProfile ? "Back to threads" : "Close chat"}
            >
              <FaChevronLeft />
            </button>
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {selectedThread.otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {selectedThread.otherUser?.name || 'Unknown User'}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedThread.otherUser?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  // Check if message is sent by current user
                  const isSent = message.senderId === user._id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isSent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
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
        // Thread List View (only show on own profile)
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search Bar - only show on own profile */}
          {isOwnProfile && (
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
          )}

          {/* Chat Threads - only show on own profile */}
          {isOwnProfile && (
            <div className="flex-1 overflow-y-auto">
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
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {thread.lastMessage || 'No messages yet'}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                </div>
              )}
            </div>
          )}

          {/* Contacts Section - only show on own profile */}
          {isOwnProfile && contacts.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="p-3 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-600 uppercase">
                  Contacts
                </h3>
              </div>
              <div className="max-h-32 overflow-y-auto divide-y divide-gray-200">
                {contacts.slice(0, 5).map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => startChat(contact)}
                    className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold mr-3 text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate capitalize">
                        {contact.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RightPanel;
