import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/UserContext.jsx';
import NotificationBell from '../shared/NotificationBell.jsx';

/**
 * Navbar component with logo, search bar, notification bell, and profile menu
 * Implements responsive design that collapses on mobile
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  /**
   * Handle search submission
   * @param {Event} e - Form submit event
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Navigate to profile
   */
  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  };

  /**
   * Get dashboard route based on user role
   */
  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
      default:
        return '/student/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              to={getDashboardRoute()} 
              className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 active:text-blue-800 transition-colors touch-manipulation"
              aria-label="SSN Connect Home"
            >
              <span className="hidden sm:inline">SSN Connect</span>
              <span className="sm:hidden">SSN</span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users and content..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  aria-label="Search"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg touch-manipulation"
                aria-label="Profile menu"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <FaUser className="text-lg" aria-hidden="true" />
                <span className="text-sm font-medium hidden lg:inline">{user?.name}</span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  {/* Backdrop for closing dropdown */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfileMenu(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-slide-down">
                    <div className="p-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
                      >
                        Settings
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 rounded-md transition-colors touch-manipulation"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Actions - Notification + Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification Bell */}
            <NotificationBell />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md touch-manipulation"
              aria-label="Toggle mobile menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-3 animate-slide-down">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users and content..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  aria-label="Search"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
              </div>
            </form>

            {/* User Info */}
            <div className="px-4 py-2 mb-2 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>

            {/* Mobile Actions */}
            <div className="space-y-1">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
              >
                <FaUser className="mr-3 text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium">View Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
              >
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-md transition-colors touch-manipulation"
              >
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
