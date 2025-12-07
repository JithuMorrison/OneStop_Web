// src/pages/shared/Posts.jsx
import React, { useState, useEffect } from 'react';
import PostCard from '../../components/shared/PostCard.jsx';
import PostForm from '../../components/forms/PostForm.jsx';
import postService from '../../services/postService.jsx';
import userService from '../../services/userService.jsx';
import interactionService from '../../services/interactionService.jsx';
import { FaPlus, FaTimes, FaFilter, FaHashtag } from 'react-icons/fa';

/**
 * Posts page - Display and manage posts
 * Implements hashtag filtering, post creation, and sharing functionality
 */
const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [selectedHashtags]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (selectedHashtags.length > 0) {
        filters.hashtags = selectedHashtags;
      }

      const fetchedPosts = await postService.getPosts(filters);
      setPosts(fetchedPosts);

      // Extract unique hashtags from all posts
      const hashtags = new Set();
      fetchedPosts.forEach(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach(tag => hashtags.add(tag));
        }
      });
      setAvailableHashtags(Array.from(hashtags));
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await postService.createPost(postData);
      
      // Refresh posts list
      await fetchPosts();
      
      // Close form
      setShowCreateForm(false);
      
      // Show success message
      alert('Post created successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.error || 'Failed to create post');
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await interactionService.likeContent('posts', postId);
      
      // Update the post in the local state with real-time like count
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const currentUserId = localStorage.getItem('userId');
            return {
              ...post,
              likes: result.likes,
              liked_by: result.liked 
                ? [...(post.liked_by || []), currentUserId]
                : (post.liked_by || []).filter(id => id !== currentUserId)
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error liking post:', err);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      const result = await interactionService.addComment('posts', postId, commentText);
      
      // Update the post in the local state with the new comment
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), result.comment]
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error commenting on post:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleShareClick = async (postId) => {
    try {
      setSharePostId(postId);
      
      // Fetch user's contacts
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.contacts && currentUser.contacts.length > 0) {
        // Fetch contact details
        const contactDetails = await Promise.all(
          currentUser.contacts.map(contactId => 
            userService.getUserById(contactId).catch(() => null)
          )
        );
        setContacts(contactDetails.filter(c => c !== null));
      } else {
        setContacts([]);
      }
      
      setShowShareModal(true);
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error loading contacts:', err);
      alert('Failed to load contacts');
    }
  };

  const handleShareSubmit = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    try {
      await postService.sharePost(sharePostId, selectedContacts);
      alert(`Post shared with ${selectedContacts.length} contact(s)!`);
      setShowShareModal(false);
      setSharePostId(null);
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error sharing post:', err);
      alert('Failed to share post. Please try again.');
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const toggleHashtagFilter = (hashtag) => {
    setSelectedHashtags(prev => {
      if (prev.includes(hashtag)) {
        return prev.filter(tag => tag !== hashtag);
      } else {
        return [...prev, hashtag];
      }
    });
  };

  const clearFilters = () => {
    setSelectedHashtags([]);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Posts</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all font-semibold text-sm sm:text-base touch-manipulation"
            aria-label={showCreateForm ? 'Cancel post creation' : 'Create new post'}
          >
            {showCreateForm ? (
              <>
                <FaTimes aria-hidden="true" /> <span>Cancel</span>
              </>
            ) : (
              <>
                <FaPlus aria-hidden="true" /> <span>Create Post</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create Post Form */}
        {showCreateForm && (
          <div className="mb-6">
            <PostForm
              onSubmit={handleCreatePost}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Hashtag Filters */}
        {availableHashtags.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaFilter aria-hidden="true" /> <span>Filter by Hashtags</span>
              </h3>
              {selectedHashtags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 active:text-blue-800 transition-colors touch-manipulation"
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableHashtags.map((hashtag, index) => (
                <button
                  key={index}
                  onClick={() => toggleHashtagFilter(hashtag)}
                  className={`inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm transition-all touch-manipulation ${
                    selectedHashtags.includes(hashtag)
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                  aria-label={`${selectedHashtags.includes(hashtag) ? 'Remove' : 'Add'} filter ${hashtag}`}
                  aria-pressed={selectedHashtags.includes(hashtag)}
                >
                  <FaHashtag className="mr-1" size={10} aria-hidden="true" />
                  {hashtag.replace('#', '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              {selectedHashtags.length > 0
                ? 'No posts found with selected hashtags'
                : 'No posts yet. Be the first to create one!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShareClick}
              />
            ))}
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">Share Post</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                {/* Search Contacts */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Contacts List */}
                <div className="max-h-96 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No contacts found. Start chatting with users to add them to your contacts.
                    </p>
                  ) : filteredContacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No contacts match your search.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredContacts.map(contact => (
                        <label
                          key={contact._id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact._id)}
                            onChange={() => toggleContactSelection(contact._id)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-4 border-t">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareSubmit}
                  disabled={selectedContacts.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Share ({selectedContacts.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
