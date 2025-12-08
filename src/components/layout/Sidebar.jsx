import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaBullhorn, 
  FaNewspaper, 
  FaBook, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaTools, 
  FaQuestionCircle,
  FaCalculator,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { useAuth } from '../../context/UserContext.jsx';

/**
 * Sidebar component with role-based navigation links
 * Implements collapsible behavior for mobile and active link highlighting
 * @param {Object} props - Component props
 * @param {boolean} props.isCollapsed - Whether sidebar is collapsed (optional)
 * @param {Function} props.onToggle - Callback when sidebar is toggled (optional)
 */
const Sidebar = ({ isCollapsed: controlledCollapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use controlled or internal collapsed state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const handleToggle = onToggle || (() => setInternalCollapsed(!internalCollapsed));

  /**
   * Check if a link is active
   * @param {string} path - Path to check
   * @returns {boolean} - True if active
   */
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * Get navigation links based on user role
   * @returns {Array} - Array of navigation link objects
   */
  const getNavigationLinks = () => {
    const commonLinks = [
      {
        path: user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard',
        icon: FaHome,
        label: 'Dashboard',
        roles: ['student', 'teacher', 'admin']
      },
      {
        path: '/profile',
        icon: FaUsers,
        label: 'Profile',
        roles: ['student', 'teacher', 'admin']
      },
    ];

    const studentTeacherLinks = [
      {
        path: '/clubs',
        icon: FaUsers,
        label: 'Clubs',
        roles: ['student', 'teacher']
      },
      {
        path: '/announcements',
        icon: FaBullhorn,
        label: 'Announcements',
        roles: ['student', 'teacher']
      },
      {
        path: '/events',
        icon: FaCalendarAlt,
        label: 'Events',
        roles: ['student', 'teacher']
      },
      {
        path: '/posts',
        icon: FaNewspaper,
        label: 'Posts',
        roles: ['student', 'teacher']
      },
      {
        path: '/group-chat',
        icon: FaUsers,
        label: 'Group Chat',
        roles: ['student', 'teacher']
      },
      {
        path: '/materials',
        icon: FaBook,
        label: 'Materials',
        roles: ['student', 'teacher']
      },
      {
        path: '/calendar',
        icon: FaCalendarAlt,
        label: 'Calendar',
        roles: ['student', 'teacher']
      },
      {
        path: '/od-claims',
        icon: FaFileAlt,
        label: 'OD Claims',
        roles: ['student', 'teacher']
      },
    ];

    const studentLinks = [
      {
        path: '/cgpa',
        icon: FaCalculator,
        label: 'CGPA Calculator',
        roles: ['student']
      },
      {
        path: '/timetable',
        icon: FaClock,
        label: 'Timetable',
        roles: ['student']
      },
      {
        path: '/portals-tools',
        icon: FaTools,
        label: 'Portals & Tools',
        roles: ['student']
      },
      {
        path: '/queries',
        icon: FaQuestionCircle,
        label: 'Submit Query',
        roles: ['student']
      },
    ];

    const teacherLinks = [
      {
        path: '/timetable',
        icon: FaClock,
        label: 'Timetable',
        roles: ['teacher']
      },
      {
        path: '/portals-tools',
        icon: FaTools,
        label: 'Portals & Tools',
        roles: ['teacher']
      },
      {
        path: '/queries',
        icon: FaQuestionCircle,
        label: 'Submit Query',
        roles: ['teacher']
      },
    ];

    const adminLinks = [
      {
        path: '/clubs',
        icon: FaUsers,
        label: 'Manage Clubs',
        roles: ['admin']
      },
      {
        path: '/events',
        icon: FaCalendarAlt,
        label: 'Events',
        roles: ['admin']
      },
      {
        path: '/portals-tools',
        icon: FaTools,
        label: 'Portals & Tools',
        roles: ['admin']
      },
      {
        path: '/admin/users',
        icon: FaUserShield,
        label: 'Manage Users',
        roles: ['admin']
      },
      {
        path: '/queries',
        icon: FaQuestionCircle,
        label: 'View Queries',
        roles: ['admin']
      },
    ];

    // Combine links based on role
    let allLinks = [...commonLinks];

    if (user?.role === 'student') {
      allLinks = [...allLinks, ...studentTeacherLinks, ...studentLinks];
    } else if (user?.role === 'teacher') {
      allLinks = [...allLinks, ...studentTeacherLinks, ...teacherLinks];
    } else if (user?.role === 'admin') {
      allLinks = [...allLinks, ...adminLinks];
    }

    // Filter links by role
    return allLinks.filter(link => link.roles.includes(user?.role));
  };

  const navigationLinks = getNavigationLinks();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Main navigation"
      >
        {/* Toggle Button */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={handleToggle}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <FaChevronRight aria-hidden="true" /> : <FaChevronLeft aria-hidden="true" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3" role="list">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-3 py-3 rounded-lg transition-all group ${
                      active
                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200'
                    }`}
                    title={isCollapsed ? link.label : ''}
                    aria-label={link.label}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon 
                      className={`text-xl flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${
                        active ? '' : 'group-hover:scale-110 transition-transform'
                      }`} 
                      aria-hidden="true"
                    />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{link.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Role Badge */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {user?.role === 'admin' && <FaUserShield className="text-purple-600" aria-hidden="true" />}
              {user?.role === 'teacher' && <FaChalkboardTeacher className="text-green-600" aria-hidden="true" />}
              {user?.role === 'student' && <FaUsers className="text-blue-600" aria-hidden="true" />}
              <span className="capitalize font-medium">{user?.role}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar (Bottom Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom">
        <nav className="flex justify-around items-center py-1 px-2">
          {navigationLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center px-2 py-2 rounded-lg transition-all touch-manipulation min-w-[60px] ${
                  active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
                aria-label={link.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="text-xl sm:text-2xl mb-1" aria-hidden="true" />
                <span className="text-xs font-medium truncate max-w-full">
                  {link.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
