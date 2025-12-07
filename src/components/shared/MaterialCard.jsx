// src/components/shared/MaterialCard.jsx
import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaFileAlt, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';

/**
 * MaterialCard component displays a single material with interaction options
 * @param {Object} props
 * @param {Object} props.material - Material object
 * @param {Function} props.onLike - Callback when like button is clicked
 * @param {Function} props.onComment - Callback when comment is submitted
 * @param {Function} props.onShare - Callback when share button is clicked
 * @param {boolean} props.showShareButton - Whether to show share button (default: true)
 */
const MaterialCard = ({ material, onLike, onComment, onShare, showShareButton = true }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Check if current user has liked this material
  const currentUserId = localStorage.getItem('userId');
  const isLiked = material.liked_by?.includes(currentUserId);

  const handleLikeClick = () => {
    if (onLike) {
      onLike(material._id);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      if (onComment) {
        await onComment(material._id, commentText);
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
      onShare(material._id);
    }
  };

  const handleFileClick = () => {
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    } else if (material.external_link) {
      window.open(material.external_link, '_blank');
    }
  };

  // Determine file type from URL
  const getFileType = () => {
    if (material.file_url) {
      const ext = material.file_url.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) return 'PDF';
      if (['doc', 'docx'].includes(ext)) return 'DOC';
      if (['ppt', 'pptx'].includes(ext)) return 'PPT';
      if (['xls', 'xlsx'].includes(ext)) return 'XLS';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'IMG';
      return 'FILE';
    }
    return 'LINK';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      {/* Material Header - Uploader Info */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
          {material.uploaded_by?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-900">
            {material.uploaded_by?.name || 'Unknown User'}
          </p>
          <p className="text-sm text-gray-500">
            {material.uploaded_by?.role && (
              <span className="capitalize">{material.uploaded_by.role}</span>
            )}
            {' • '}
            {new Date(material.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Material Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{material.title}</h3>

      {/* Material Description */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{material.description}</p>

      {/* File/Link Preview */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {material.file_url ? (
              <FaFileAlt className="text-blue-500" size={32} />
            ) : (
              <FaExternalLinkAlt className="text-purple-500" size={32} />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {material.file_url ? 'File Attachment' : 'External Link'}
              </p>
              <p className="text-sm text-gray-500">
                {getFileType()} • Click to {material.file_url ? 'download' : 'open'}
              </p>
            </div>
          </div>
          <button
            onClick={handleFileClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            {material.file_url ? (
              <>
                <FaDownload size={16} />
                <span>Download</span>
              </>
            ) : (
              <>
                <FaExternalLinkAlt size={16} />
                <span>Open</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
        >
          {isLiked ? (
            <FaHeart className="text-red-500" size={20} />
          ) : (
            <FaRegHeart size={20} />
          )}
          <span className="font-medium">{material.likes || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
        >
          <FaComment size={20} />
          <span className="font-medium">{material.comments?.length || 0}</span>
        </button>

        {/* Share Button */}
        {showShareButton && (
          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <FaShare size={20} />
            <span className="font-medium">Share</span>
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {material.comments && material.comments.length > 0 ? (
            <div className="space-y-3">
              {material.comments.map((comment, index) => (
                <div key={comment.id || index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
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

export default MaterialCard;
