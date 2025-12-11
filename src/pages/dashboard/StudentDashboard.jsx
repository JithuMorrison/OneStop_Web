import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/UserContext.jsx';
import {
  FiUsers,
  FiBell,
  FiFileText,
  FiBook,
  FiCalendar,
  FiTool,
  FiMessageSquare,
  FiAward,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

/**
 * StudentDashboard component
 * Displays personalized dashboard for students with quick access to campus features
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    streak: 0,
    upcomingEvents: [],
    likedAnnouncements: [],
    likedPosts: [],
    badges: [],
    achievements: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  /**
   * Fetch all dashboard data
   * Requirement 3.2: Display current streak count
   * Requirement 3.3: Display upcoming events (within 1 month)
   * Requirement 3.4: Display liked announcements and posts
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch user data for streak
      const userResponse = await fetch(`http://localhost:5000/api/user/${user._id || user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();

      // Fetch upcoming events (placeholder - will be implemented in event service)
      const eventsResponse = await fetch('http://localhost:5000/api/events/upcoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const events = eventsResponse.ok ? await eventsResponse.json() : [];

      // Fetch liked announcements
      const announcementsResponse = await fetch('http://localhost:5000/api/announcements/liked', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const announcements = announcementsResponse.ok ? await announcementsResponse.json() : [];

      // Fetch liked posts
      const postsResponse = await fetch('http://localhost:5000/api/posts/liked', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const posts = postsResponse.ok ? await postsResponse.json() : [];

      setDashboardData({
        streak: userData.streak || 0,
        upcomingEvents: Array.isArray(events) ? events.slice(0, 5) : [],
        likedAnnouncements: Array.isArray(announcements) ? announcements.slice(0, 3) : [],
        likedPosts: Array.isArray(posts) ? posts.slice(0, 3) : [],
        badges: userData.badges || [],
        achievements: userData.achievements || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick link navigation items
   * Requirement 3.1: Display quick links to all sections
   */
  const quickLinks = [
    { name: 'Clubs', icon: FiUsers, path: '/clubs', color: 'bg-blue-500' },
    { name: 'Announcements', icon: FiBell, path: '/announcements', color: 'bg-purple-500' },
    { name: 'Posts', icon: FiFileText, path: '/posts', color: 'bg-green-500' },
    { name: 'Materials', icon: FiBook, path: '/materials', color: 'bg-yellow-500' },
    { name: 'OD Claims', icon: FiFileText, path: '/od-claims', color: 'bg-red-500' },
    { name: 'Events', icon: FiCalendar, path: '/events', color: 'bg-indigo-500' },
    { name: 'Tools', icon: FiTool, path: '/tools', color: 'bg-pink-500' },
    { name: 'Messages', icon: FiMessageSquare, path: '/messages', color: 'bg-teal-500' }
  ];

  /**
   * Handle quick link navigation
   * Requirement 3.5: Navigate to corresponding page on click
   */
  const handleQuickLinkClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.username}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Here's what's happening on campus today
        </p>
      </div>

      {/* Streak and Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Streak Card - Requirement 3.2 */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-4 sm:p-6 text-white shadow-lg card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Daily Streak</p>
              <h3 className="text-3xl sm:text-4xl font-bold mt-1 sm:mt-2">{dashboardData.streak}</h3>
              <p className="text-xs sm:text-sm mt-1 opacity-90">consecutive days</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full">
              <FiTrendingUp size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* Badges Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Badges Earned</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {dashboardData.badges.length}
              </h3>
            </div>
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
              <FiAward size={20} className="sm:w-6 sm:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Achievements</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {dashboardData.achievements.length}
              </h3>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
              <FiAward size={20} className="sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Events Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Upcoming Events</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {dashboardData.upcomingEvents.length}
              </h3>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <FiCalendar size={20} className="sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section - Requirement 3.1 */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleQuickLinkClick(link.path)}
              className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 hover:shadow-lg active:shadow-sm transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex flex-col items-center justify-center touch-manipulation"
              aria-label={`Go to ${link.name}`}
            >
              <div className={`${link.color} p-2 sm:p-3 rounded-full mb-2`}>
                <link.icon size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                {link.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events - Requirement 3.3 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FiCalendar className="mr-2 text-indigo-600" />
                Upcoming Events
              </h2>
              <button
                onClick={() => navigate('/calendar')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View Calendar
              </button>
            </div>
            
            {dashboardData.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/events')}
                  >
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                      <FiClock className="text-indigo-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.name || 'Event'}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.type || 'General'} • {new Date(event.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar size={48} className="mx-auto mb-3 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Badges & Achievements */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiAward className="mr-2 text-yellow-600" />
            Recent Achievements
          </h2>
          
          {dashboardData.achievements.length > 0 || dashboardData.badges.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiAward className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{achievement}</span>
                </div>
              ))}
              {dashboardData.badges.slice(0, 3).map((badge, index) => (
                <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FiAward className="text-yellow-600" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{badge}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiAward size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No achievements yet</p>
              <p className="text-xs mt-1">Keep engaging to earn badges!</p>
            </div>
          )}
        </div>
      </div>

      {/* Liked Content Section - Requirement 3.4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Liked Announcements */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiBell className="mr-2 text-purple-600" />
              Liked Announcements
            </h2>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          {dashboardData.likedAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.likedAnnouncements.map((announcement, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/announcements')}
                >
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {announcement.description}
                  </p>
                  <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {announcement.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiBell size={48} className="mx-auto mb-3 opacity-50" />
              <p>No liked announcements</p>
            </div>
          )}
        </div>

        {/* Liked Posts */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-green-600" />
              Liked Posts
            </h2>
            <button
              onClick={() => navigate('/posts')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          {dashboardData.likedPosts.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.likedPosts.map((post, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/posts')}
                >
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{post.likes || 0} likes</span>
                    <span className="mx-2">•</span>
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiFileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>No liked posts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
