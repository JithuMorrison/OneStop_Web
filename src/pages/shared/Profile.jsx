// src/pages/shared/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaFire, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import userService from '../../services/userService.jsx';
import postService from '../../services/postService.jsx';
import announcementService from '../../services/announcementService.jsx';
import materialService from '../../services/materialService.jsx';
import PostCard from '../../components/shared/PostCard.jsx';
import AnnouncementCard from '../../components/shared/AnnouncementCard.jsx';
import MaterialCard from '../../components/shared/MaterialCard.jsx';
import RightPanel from '../../components/layout/RightPanel.jsx';

/**
 * Profile page component
 * Displays user information, social metrics, and user-created content
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */
const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.id;

  // State
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

  // Content state
  const [userPosts, setUserPosts] = useState([]);
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [userMaterials, setUserMaterials] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Determine which user ID to fetch
  const profileId = id || currentUserId;

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  useEffect(() => {
    if (profile) {
      fetchUserContent();
    }
  }, [profile, activeTab]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const userData = await userService.getUserById(profileId);
      setProfile(userData);
      setIsOwnProfile(userData._id === currentUserId);

      // Check if current user is following this profile
      if (userData._id !== currentUserId) {
        const currentUserData = await userService.getUserById(currentUserId);
        setIsFollowing(currentUserData.following?.includes(userData._id) || false);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    if (!profile) return;

    try {
      setLoadingContent(true);

      if (activeTab === 'posts') {
        // Fetch all posts and filter by creator
        const allPosts = await postService.getPosts();
        const filtered = allPosts.filter(post => post.created_by?._id === profile._id);
        setUserPosts(filtered);
      } else if (activeTab === 'announcements') {
        // Fetch all announcements and filter by creator
        const allAnnouncements = await announcementService.getAnnouncements();
        const filtered = allAnnouncements.filter(ann => ann.created_by?._id === profile._id);
        setUserAnnouncements(filtered);
      } else if (activeTab === 'materials') {
        // Fetch all materials and filter by uploader
        const allMaterials = await materialService.getMaterials();
        const filtered = allMaterials.filter(mat => mat.uploaded_by?._id === profile._id);
        setUserMaterials(filtered);
      }
    } catch (err) {
      console.error('Error fetching user content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(profile._id);
        setProfile(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(id => id !== currentUserId)
        }));
      } else {
        await userService.followUser(profile._id);
        setProfile(prev => ({
          ...prev,
          followers: [...(prev.followers || []), currentUserId]
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      alert('Failed to update follow status');
    }
  };

  const handleLike = async (contentId, contentType) => {
    // Implement like functionality
    console.log('Like:', contentId, contentType);
  };

  const handleComment = async (contentId, commentText, contentType) => {
    // Implement comment functionality
    console.log('Comment:', contentId, commentText, contentType);
  };

  const handleShare = async (contentId, contentType) => {
    // Implement share functionality
    console.log('Share:', contentId, contentType);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className={`flex-1 ${chatPanelOpen ? 'mr-80' : ''} transition-all duration-300`}>
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Profile Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>

                {/* Profile Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                  <p className="text-gray-600 mb-2">
                    <span className="capitalize font-medium">{profile.role}</span>
                    {' • '}
                    {profile.email}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {profile.department && <span>{profile.department}</span>}
                    {profile.join_year && <span>Joined {profile.join_year}</span>}
                    {profile.section && <span>Section {profile.section}</span>}
                  </div>
                  {profile.roll_number && (
                    <p className="text-sm text-gray-500 mt-1">Roll: {profile.roll_number}</p>
                  )}
                  {profile.digital_id && (
                    <p className="text-sm text-gray-500">Digital ID: {profile.digital_id}</p>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FaUserMinus /> Unfollow
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Followers */}
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm mb-1">Followers</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.followers?.length || 0}
              </p>
            </div>

            {/* Following */}
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm mb-1">Following</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.following?.length || 0}
              </p>
            </div>

            {/* Streak */}
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FaFire className="text-orange-500" />
                <p className="text-gray-600 text-sm">Streak</p>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {profile.streak || 0} days
              </p>
            </div>

            {/* Posts */}
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm mb-1">Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.posts?.length || 0}
              </p>
            </div>
          </div>

          {/* Badges and Achievements */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Badges */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMedal className="text-yellow-500 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">Badges</h2>
              </div>
              {profile.badges && profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No badges yet</p>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaTrophy className="text-purple-500 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
              </div>
              {profile.achievements && profile.achievements.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.achievements.map((achievement, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No achievements yet</p>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Posts ({profile.posts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'announcements'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Announcements ({profile.announcements?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'materials'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Materials ({profile.materials?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loadingContent ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading content...</p>
                </div>
              ) : (
                <>
                  {/* Posts Tab */}
                  {activeTab === 'posts' && (
                    <div>
                      {userPosts.length > 0 ? (
                        userPosts.map(post => (
                          <PostCard
                            key={post._id}
                            post={post}
                            onLike={(id) => handleLike(id, 'post')}
                            onComment={(id, text) => handleComment(id, text, 'post')}
                            onShare={(id) => handleShare(id, 'post')}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No posts yet</p>
                      )}
                    </div>
                  )}

                  {/* Announcements Tab */}
                  {activeTab === 'announcements' && (
                    <div>
                      {userAnnouncements.length > 0 ? (
                        userAnnouncements.map(announcement => (
                          <AnnouncementCard
                            key={announcement._id}
                            announcement={announcement}
                            onLike={(id) => handleLike(id, 'announcement')}
                            onRegister={() => {}}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No announcements yet</p>
                      )}
                    </div>
                  )}

                  {/* Materials Tab */}
                  {activeTab === 'materials' && (
                    <div>
                      {userMaterials.length > 0 ? (
                        userMaterials.map(material => (
                          <MaterialCard
                            key={material._id}
                            material={material}
                            onLike={(id) => handleLike(id, 'material')}
                            onComment={(id, text) => handleComment(id, text, 'material')}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No materials yet</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Toggle Button */}
          {!isOwnProfile && (
            <button
              onClick={() => setChatPanelOpen(!chatPanelOpen)}
              className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40"
            >
              💬
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      {!isOwnProfile && (
        <RightPanel
          isOpen={chatPanelOpen}
          onToggle={() => setChatPanelOpen(!chatPanelOpen)}
          userId={currentUserId}
          targetUserId={profile._id}
        />
      )}
    </div>
  );
};

export default Profile;
