import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaUserCircle, FaCalendarAlt, FaShare, FaTimes } from 'react-icons/fa';
import * as chatService from '../../services/chatService.jsx';

/**
 * AnnouncementCard component for displaying announcement information
 * @param {Object} announcement - Announcement data
 * @param {Function} onLike - Callback for like action
 * @param {Function} onComment - Callback for comment action
 * @param {Function} onRegister - Callback for registration action
 * @param {Function} onShare - Callback for share action
 * @param {string} currentUserId - Current user's ID
 * @param {boolean} canEdit - Whether current user can edit
 */
const AnnouncementCard = ({ 
  announcement, 
  onLike, 
  onComment, 
  onRegister,
  onShare,
  currentUserId,
  canEdit = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showRegistrationsDialog, setShowRegistrationsDialog] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatContacts, setChatContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sharingTo, setSharingTo] = useState(null);

  if (!announcement) {
    return null;
  }

  const {
    _id,
    title,
    description,
    category,
    image,
    additional_images = [],
    hashtag,
    created_by,
    likes = 0,
    liked_by = [],
    comments = [],
    registration_enabled = false,
    registration_fields = [],
    createdAt
  } = announcement;

  const isLiked = liked_by.includes(currentUserId);
  const creatorName = created_by?.name || 'Unknown';
  const creatorRole = created_by?.role || '';

  const handleLike = () => {
    if (onLike) {
      onLike(_id);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() && onComment) {
      onComment(_id, commentText);
      setCommentText('');
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister(_id);
    }
  };

  const handleShareClick = async () => {
    setShowShareModal(true);
    await loadChatContacts();
  };

  const loadChatContacts = async () => {
    try {
      setLoadingContacts(true);
      const threads = await chatService.getChatThreads();
      
      // Extract unique contacts - get current user ID correctly
      const userStr = localStorage.getItem('user');
      const currentUserId = userStr ? JSON.parse(userStr)?._id : null;
      
      const contacts = threads.map(thread => {
        const otherUser = thread.participants.find(p => {
          const participantId = p._id || p;
          return participantId !== currentUserId;
        });
        return otherUser ? {
          id: otherUser._id || otherUser,
          name: otherUser.username || otherUser.name || 'Unknown',
          email: otherUser.email || '',
          chatId: thread._id
        } : null;
      }).filter(Boolean);
      
      setChatContacts(contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleShareToContact = async (contact) => {
    try {
      setSharingTo(contact.id);
      const shareMessage = `Check out this announcement: "${title}"\n\nAnnouncement ID: ${_id}`;
      
      await chatService.sendMessage(contact.chatId, shareMessage);
      alert(`Shared with ${contact.name}!`);
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setSharingTo(null);
    }
  };

  const handleViewRegistrations = async () => {
    if (!announcement.registrations || announcement.registrations.length === 0) return;
    
    setShowRegistrationsDialog(true);
    setLoadingUsers(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/announcements/${_id}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform the registration data to match the expected format
        const users = data.map(reg => ({
          name: reg.user_id?.name || 'Unknown',
          email: reg.user_id?.email || '',
          role: reg.user_id?.role || 'student',
          dept: reg.user_id?.department || reg.user_id?.dept || '-',
          department: reg.user_id?.department || reg.user_id?.dept || '-',
          registrationData: reg.data || {},
          registeredAt: reg.createdAt
        }));
        setRegisteredUsers(users);
      } else {
        console.error('Failed to fetch registrations');
        setRegisteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching registered users:', error);
      setRegisteredUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all card-hover">
      {/* Image */}
      {image && (
        <div className="w-full h-48 sm:h-64 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Category Badge */}
        <div className="mb-2 sm:mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full badge badge-primary">
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-3">
          {description}
        </p>

        {/* Hashtag */}
        {hashtag && (
          <div className="flex items-center text-blue-600 mb-4">
            <FaCalendarAlt className="mr-2" />
            <span className="text-sm font-medium">{hashtag}</span>
          </div>
        )}

        {/* Additional Images */}
        {additional_images.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Additional Resources:</p>
            <div className="flex flex-wrap gap-2">
              {additional_images.map((imgUrl, index) => (
                <a
                  key={index}
                  href={imgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Image {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-center text-gray-600 mb-4 pb-4 border-b">
          <FaUserCircle className="text-2xl mr-2" />
          <div>
            <p className="text-sm font-medium">
              {creatorName}
              {creatorRole && (
                <span className="ml-2 text-xs text-gray-500">
                  ({creatorRole})
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Registration Section */}
        {registration_enabled && (
          <div className="mb-3 sm:mb-4">
            {/* Show registration button/status only if not the creator */}
            {created_by?._id !== currentUserId && (() => {
              // Check if user is already registered
              const isRegistered = announcement.registrations && announcement.registrations.some(reg => {
                const regUserId = typeof reg === 'object' ? reg.user_id : reg;
                return regUserId === currentUserId;
              });

              if (isRegistered) {
                // Show "Registered" status
                return (
                  <div className="w-full bg-green-50 border-2 border-green-500 text-green-700 font-semibold py-2.5 sm:py-2 px-4 rounded-lg text-center">
                    ✓ Registered
                  </div>
                );
              } else {
                // Show registration button
                return (
                  <div>
                    <button
                      onClick={handleRegister}
                      className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-2.5 sm:py-2 px-4 rounded-lg transition-all btn touch-manipulation"
                      aria-label="Register for this event"
                    >
                      Register for this Event
                    </button>
                    {/* Show role restriction info if applicable */}
                    {announcement.registration_role_restriction && announcement.registration_role_restriction !== 'all' && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {announcement.registration_role_restriction === 'students' ? '(Students Only)' : '(Teachers Only)'}
                      </p>
                    )}
                  </div>
                );
              }
            })()}
            
            {/* Show registered users count if creator */}
            {created_by?._id === currentUserId && announcement.registrations && announcement.registrations.length > 0 && (
              <button
                onClick={handleViewRegistrations}
                className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="text-blue-600 text-xl" />
                    <span className="font-semibold text-gray-900">
                      Registered Users ({announcement.registrations.length})
                    </span>
                  </div>
                  <span className="text-blue-600 text-sm">View Details →</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Like and Comment Actions */}
        <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-red-600 active:text-red-700 transition-all touch-manipulation"
            aria-label={isLiked ? 'Unlike announcement' : 'Like announcement'}
          >
            {isLiked ? (
              <FaHeart className="text-red-600 text-lg sm:text-xl" aria-hidden="true" />
            ) : (
              <FaRegHeart className="text-lg sm:text-xl" aria-hidden="true" />
            )}
            <span className="font-medium text-sm sm:text-base">{likes}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 active:text-blue-700 transition-all touch-manipulation"
            aria-label={showComments ? 'Hide comments' : 'Show comments'}
            aria-expanded={showComments}
          >
            <FaComment className="text-lg sm:text-xl" aria-hidden="true" />
            <span className="font-medium text-sm sm:text-base">{comments.length}</span>
          </button>

          {/* Share Button */}
          {onShare && (
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-green-600 active:text-green-700 transition-all touch-manipulation"
              aria-label="Share announcement"
            >
              <FaShare className="text-lg sm:text-xl" aria-hidden="true" />
              <span className="font-medium text-sm sm:text-base">Share</span>
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment.id || index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FaUserCircle className="text-gray-400 text-xl flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {comment.userName || 'Anonymous'}
                        </p>
                        <p className="text-gray-700 text-sm mt-1">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Registrations Dialog */}
      {showRegistrationsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Registered Users ({registeredUsers.length})
              </h3>
              <button
                onClick={() => setShowRegistrationsDialog(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading user details...</p>
                </div>
              ) : registeredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No registered users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Additional Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registeredUsers.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.registrationData && Object.keys(user.registrationData).length > 0 ? (
                              <div className="space-y-1">
                                {Object.entries(user.registrationData)
                                  .filter(([key]) => !['name', 'email', 'role'].includes(key)) // Exclude auto-populated fields
                                  .map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium capitalize">{key}:</span> {value}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.registeredAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRegistrationsDialog(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Share Announcement</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {loadingContacts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading contacts...</p>
                </div>
              ) : chatContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No chat contacts found.</p>
                  <p className="text-sm mt-2">Start a conversation to share content!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleShareToContact(contact)}
                      disabled={sharingTo === contact.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      {sharingTo === contact.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementCard;
