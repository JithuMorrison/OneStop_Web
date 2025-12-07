import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';

/**
 * AnnouncementCard component for displaying announcement information
 * @param {Object} announcement - Announcement data
 * @param {Function} onLike - Callback for like action
 * @param {Function} onComment - Callback for comment action
 * @param {Function} onRegister - Callback for registration action
 * @param {string} currentUserId - Current user's ID
 * @param {boolean} canEdit - Whether current user can edit
 */
const AnnouncementCard = ({ 
  announcement, 
  onLike, 
  onComment, 
  onRegister,
  currentUserId,
  canEdit = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
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

        {/* Registration Button */}
        {registration_enabled && (
          <div className="mb-3 sm:mb-4">
            <button
              onClick={handleRegister}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-2.5 sm:py-2 px-4 rounded-lg transition-all btn touch-manipulation"
              aria-label="Register for this event"
            >
              Register for this Event
            </button>
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
  );
};

export default AnnouncementCard;
