import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/UserContext.jsx';
import { userService } from '../../services/userService.jsx';
import {
  FiCalendar,
  FiFileText,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiAlertCircle,
  FiEdit
} from 'react-icons/fi';

/**
 * TeacherDashboard component
 * Displays administrative tools and pending tasks for teachers
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pendingODCount: 0,
    upcomingEvents: [],
    recentAnnouncements: [],
    stats: {
      totalODClaims: 0,
      approvedODClaims: 0,
      eventsCreated: 0,
      announcementsCreated: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  /**
   * Fetch all dashboard data
   * Requirement 4.2: Show pending OD claims count
   * Requirement 4.3: Display upcoming events created by teacher
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Update streak first (for users already logged in accessing dashboard)
      try {
        await userService.updateStreak();
      } catch (streakError) {
        console.log('Streak update failed:', streakError);
      }

      // Fetch pending OD claims count
      const odResponse = await fetch(`http://localhost:5000/api/od-claims/teacher/${user._id}?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const odClaims = odResponse.ok ? await odResponse.json() : [];
      const pendingODCount = Array.isArray(odClaims) ? odClaims.length : 0;

      // Fetch all OD claims for stats
      const allODResponse = await fetch(`http://localhost:5000/api/od-claims/teacher/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const allODClaims = allODResponse.ok ? await allODResponse.json() : [];
      const approvedODCount = Array.isArray(allODClaims) 
        ? allODClaims.filter(od => od.status === 'accepted').length 
        : 0;

      // Fetch upcoming events created by teacher
      const eventsResponse = await fetch(`http://localhost:5000/api/events/teacher/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const events = eventsResponse.ok ? await eventsResponse.json() : [];

      // Fetch recent announcements
      const announcementsResponse = await fetch(`http://localhost:5000/api/announcements/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }));
      
      const announcements = announcementsResponse.ok ? await announcementsResponse.json() : [];

      setDashboardData({
        pendingODCount,
        upcomingEvents: Array.isArray(events) ? events.slice(0, 5) : [],
        recentAnnouncements: Array.isArray(announcements) ? announcements.slice(0, 3) : [],
        stats: {
          totalODClaims: Array.isArray(allODClaims) ? allODClaims.length : 0,
          approvedODClaims: approvedODCount,
          eventsCreated: Array.isArray(events) ? events.length : 0,
          announcementsCreated: Array.isArray(announcements) ? announcements.length : 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Administrative tools for teachers
   * Requirement 4.1: Display administrative tools
   */
  const adminTools = [
    {
      name: 'Timetable',
      description: 'Manage exam timetables',
      icon: FiCalendar,
      path: '/timetable',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'OD Approvals',
      description: 'Review and approve OD claims',
      icon: FiCheckCircle,
      path: '/od-claims',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      badge: dashboardData.pendingODCount
    },
    {
      name: 'Announcements',
      description: 'Create campus announcements',
      icon: FiBell,
      path: '/announcements',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Calendar',
      description: 'View campus events',
      icon: FiUsers,
      path: '/calendar',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  /**
   * Handle tool navigation
   * Requirement 4.4: Navigate to corresponding management page
   */
  const handleToolClick = (path) => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Teacher Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || user?.username}!
        </p>
        <div className="mt-2 text-sm text-gray-500">
          {user?.dept || user?.department} Department
          {user?.streak > 0 && (
            <span className="ml-3 text-orange-600 font-medium">
              🔥 {user.streak} day streak
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Pending OD Claims - Requirement 4.2 */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending OD Claims</p>
              <h3 className="text-4xl font-bold mt-2">{dashboardData.pendingODCount}</h3>
              <p className="text-sm mt-1 opacity-90">awaiting review</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FiAlertCircle size={32} />
            </div>
          </div>
        </div>

        {/* Total OD Claims */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total OD Claims</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.stats.totalODClaims}
              </h3>
              <p className="text-xs text-green-600 mt-1">
                {dashboardData.stats.approvedODClaims} approved
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiCheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Events Created */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Events Created</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.stats.eventsCreated}
              </h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FiCalendar size={24} className="text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Announcements</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.stats.announcementsCreated}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiBell size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Tools - Requirement 4.1 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrative Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminTools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => handleToolClick(tool.path)}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left relative"
            >
              {tool.badge > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {tool.badge}
                </span>
              )}
              <div className={`${tool.bgColor} p-3 rounded-lg inline-block mb-3`}>
                <tool.icon size={24} className={tool.textColor} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events - Requirement 4.3 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FiCalendar className="mr-2 text-indigo-600" />
                Your Upcoming Events
              </h2>
              <button
                onClick={() => navigate('/calendar')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/edit/${event._id}`);
                      }}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <FiEdit size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar size={48} className="mx-auto mb-3 opacity-50" />
                <p>No upcoming events</p>
                <button
                  onClick={() => navigate('/timetable')}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create Exam Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiBell className="mr-2 text-purple-600" />
              Recent Announcements
            </h2>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create
            </button>
          </div>
          
          {dashboardData.recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentAnnouncements.map((announcement, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/announcements')}
                >
                  <h3 className="font-medium text-gray-900 text-sm">{announcement.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {announcement.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{announcement.likes || 0} likes</span>
                    <span className="mx-2">•</span>
                    <span>{announcement.comments?.length || 0} comments</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiBell size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No announcements yet</p>
              <button
                onClick={() => navigate('/announcements')}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create Announcement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pending OD Claims Section */}
      {dashboardData.pendingODCount > 0 && (
        <div className="mt-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <FiAlertCircle size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {dashboardData.pendingODCount} OD Claim{dashboardData.pendingODCount !== 1 ? 's' : ''} Awaiting Review
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Students are waiting for your approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/od-claims')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Review Claims
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/timetable')}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center"
        >
          <FiCalendar size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-700">Create Exam Schedule</p>
        </button>
        
        <button
          onClick={() => navigate('/announcements')}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
        >
          <FiBell size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-700">Create Announcement</p>
        </button>
        
        <button
          onClick={() => navigate('/materials')}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 hover:bg-green-50 transition-all text-center"
        >
          <FiUsers size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-700">Create Materials</p>
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
