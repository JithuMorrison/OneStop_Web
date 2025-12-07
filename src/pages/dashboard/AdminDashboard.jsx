import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/UserContext.jsx';
import {
  FiUsers,
  FiUserPlus,
  FiTool,
  FiExternalLink,
  FiMessageCircle,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSettings
} from 'react-icons/fi';
import { FaChalkboardTeacher, FaUserGraduate, FaUserShield } from 'react-icons/fa';

/**
 * AdminDashboard component
 * Displays system management tools and statistics for administrators
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userCounts: {
      students: 0,
      teachers: 0,
      admins: 0,
      total: 0
    },
    pendingQueriesCount: 0,
    recentQueries: [],
    systemStats: {
      clubs: 0,
      portals: 0,
      tools: 0,
      announcements: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  /**
   * Fetch all dashboard data
   * Requirement 5.2: Show total user counts by role
   * Requirement 5.3: Display pending queries count
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch user counts by role
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const users = usersData.users || [];
        
        const userCounts = {
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          admins: users.filter(u => u.role === 'admin').length,
          total: users.length
        };

        // Fetch pending queries count
        const queriesResponse = await fetch('http://localhost:5000/api/queries?status=pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }));
        
        const queries = queriesResponse.ok ? await queriesResponse.json() : [];
        const pendingQueriesCount = Array.isArray(queries) ? queries.length : 0;

        // Fetch recent queries
        const recentQueriesResponse = await fetch('http://localhost:5000/api/queries', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }));
        
        const allQueries = recentQueriesResponse.ok ? await recentQueriesResponse.json() : [];

        // Fetch system stats
        const clubsResponse = await fetch('http://localhost:5000/api/clubs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }));
        
        const clubs = clubsResponse.ok ? await clubsResponse.json() : [];

        const portalsResponse = await fetch('http://localhost:5000/api/portals', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }));
        
        const portals = portalsResponse.ok ? await portalsResponse.json() : [];

        const toolsResponse = await fetch('http://localhost:5000/api/tools', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }));
        
        const tools = toolsResponse.ok ? await toolsResponse.json() : [];

        const announcementsResponse = await fetch('http://localhost:5000/api/announcements', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }));
        
        const announcements = announcementsResponse.ok ? await announcementsResponse.json() : [];

        setDashboardData({
          userCounts,
          pendingQueriesCount,
          recentQueries: Array.isArray(allQueries) ? allQueries.slice(0, 5) : [],
          systemStats: {
            clubs: Array.isArray(clubs) ? clubs.length : 0,
            portals: Array.isArray(portals) ? portals.length : 0,
            tools: Array.isArray(tools) ? tools.length : 0,
            announcements: Array.isArray(announcements) ? announcements.length : 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * System management tools for admin
   * Requirement 5.1: Display system management tools
   */
  const managementTools = [
    {
      name: 'Manage Clubs',
      description: 'Create and manage campus clubs',
      icon: FiUsers,
      path: '/clubs',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      count: dashboardData.systemStats.clubs
    },
    {
      name: 'Manage Portals',
      description: 'Add and configure portals',
      icon: FiExternalLink,
      path: '/admin/portals',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      count: dashboardData.systemStats.portals
    },
    {
      name: 'Manage Tools',
      description: 'Add and configure tools',
      icon: FiTool,
      path: '/admin/tools',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      count: dashboardData.systemStats.tools
    },
    {
      name: 'User Roles',
      description: 'Manage user roles and permissions',
      icon: FiSettings,
      path: '/admin/users',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      count: dashboardData.userCounts.total
    },
    {
      name: 'Queries',
      description: 'View and respond to user queries',
      icon: FiMessageCircle,
      path: '/admin/queries',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      badge: dashboardData.pendingQueriesCount
    },
    {
      name: 'Create Teacher',
      description: 'Add new teacher accounts',
      icon: FiUserPlus,
      path: '/admin/create-teacher',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    }
  ];

  /**
   * Handle tool navigation
   * Requirement 5.4: Navigate to corresponding administration page
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
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          System overview and management tools
        </p>
      </div>

      {/* User Statistics - Requirement 5.2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <h3 className="text-4xl font-bold mt-2">{dashboardData.userCounts.total}</h3>
              <p className="text-sm mt-1 opacity-90">registered</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FiUsers size={32} />
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.userCounts.students}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserGraduate size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teachers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.userCounts.teachers}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaChalkboardTeacher size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrators</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.userCounts.admins}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUserShield size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Queries Alert - Requirement 5.3 */}
      {dashboardData.pendingQueriesCount > 0 && (
        <div className="mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <FiAlertCircle size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {dashboardData.pendingQueriesCount} Pending Quer{dashboardData.pendingQueriesCount !== 1 ? 'ies' : 'y'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Users are waiting for your response
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/queries')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Review Queries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Management Tools - Requirement 5.1 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementTools.map((tool) => (
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
              <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
              {tool.count !== undefined && (
                <p className="text-xs text-gray-500">
                  {tool.count} {tool.name.toLowerCase()}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Content Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Content Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Announcements</span>
              <span className="font-semibold text-gray-900">{dashboardData.systemStats.announcements}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Clubs</span>
              <span className="font-semibold text-gray-900">{dashboardData.systemStats.clubs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Portals</span>
              <span className="font-semibold text-gray-900">{dashboardData.systemStats.portals}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Tools</span>
              <span className="font-semibold text-gray-900">{dashboardData.systemStats.tools}</span>
            </div>
          </div>
        </div>

        {/* Recent Queries */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <FiMessageCircle className="mr-2 text-orange-600" />
              Recent Queries
            </h3>
            <button
              onClick={() => navigate('/admin/queries')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          {dashboardData.recentQueries.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/queries')}
                >
                  <div className={`p-2 rounded-lg mr-4 ${
                    query.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    {query.status === 'pending' ? (
                      <FiClock className="text-orange-600" size={20} />
                    ) : (
                      <FiCheckCircle className="text-green-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{query.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        query.status === 'pending' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {query.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {query.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      From: {query.submitter_role} • {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiMessageCircle size={48} className="mx-auto mb-3 opacity-50" />
              <p>No queries yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/admin/clubs/create')}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
        >
          <FiUsers size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-700">Create Club</p>
        </button>
        
        <button
          onClick={() => navigate('/admin/portals/create')}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
        >
          <FiExternalLink size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-700">Add Portal</p>
        </button>
        
        <button
          onClick={() => navigate('/admin/tools/create')}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 hover:bg-green-50 transition-all text-center"
        >
          <FiTool size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-700">Add Tool</p>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
