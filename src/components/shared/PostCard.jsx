// src/components/shared/PostCard.jsx
import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaHashtag } from 'react-icons/fa';

/**
 * PostCard component displays a single post with interaction options
 * @param {Object} props
 * @param {Object} props.post - Post object
 * @param {Function} props.onLike - Callback when like button is clicked
 * @param {Function} props.onComment - Callback when comment is submitted
 * @param {Function} props.onShare - Callback when share button is clicked
 * @param {boolean} props.showShareButton - Whether to show share button (default: true)
 */
const PostCard = ({ post, onLike, onComment, onShare, showShareButton = true }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Check if current user has liked this post
  const currentUserId = localStorage.getItem('userId');
  const isLiked = post.liked_by?.includes(currentUserId);

  const handleLikeClick = () => {
    if (onLike) {
      onLike(post._id);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      if (onComment) {
        await onComment(post._id, commentText);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(post._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 hover:shadow-lg transition-all card-hover">
      {/* Post Header - Creator Info */}
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {post.created_by?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">
            {post.created_by?.name || 'Unknown User'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {post.created_by?.role && (
              <span className="capitalize">{post.created_by.role}</span>
            )}
            {' • '}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Post Title */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

      {/* Post Description */}
      <p className="text-sm sm:text-base text-gray-700 mb-4 whitespace-pre-wrap">{post.description}</p>

      {/* Post Image */}
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto object-cover max-h-96"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <FaHashtag className="mr-1" size={12} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Visibility Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          post.visibility === 'everyone' ? 'bg-green-100 text-green-800' :
          post.visibility === 'students' ? 'bg-blue-100 text-blue-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          Visible to: {post.visibility}
        </span>
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-200">
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-red-500 active:text-red-600 transition-all touch-manipulation"
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          {isLiked ? (
            <FaHeart className="text-red-500" size={18} aria-hidden="true" />
          ) : (
            <FaRegHeart size={18} aria-hidden="true" />
          )}
          <span className="font-medium text-sm sm:text-base">{post.likes || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-500 active:text-blue-600 transition-all touch-manipulation"
          aria-label={showComments ? 'Hide comments' : 'Show comments'}
          aria-expanded={showComments}
        >
          <FaComment size={18} aria-hidden="true" />
          <span className="font-medium text-sm sm:text-base">{post.comments?.length || 0}</span>
        </button>

        {/* Share Button */}
        {showShareButton && (
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-green-500 active:text-green-600 transition-all touch-manipulation"
            aria-label="Share post"
          >
            <FaShare size={18} aria-hidden="true" />
            <span className="font-medium text-sm sm:text-base">Share</span>
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow input"
                disabled={isSubmittingComment}
                aria-label="Comment text"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all btn btn-primary touch-manipulation"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment, index) => (
                <div key={comment.id || index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {comment.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.userName || 'Unknown User'}
                      </p>
                      <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
