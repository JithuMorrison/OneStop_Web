import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/UserContext.jsx';

/**
 * ProtectedRoute component - Wrapper for routes that require authentication
 * Implements role-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route (optional)
 * @param {string} props.redirectTo - Path to redirect to if unauthorized (default: /login)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = null, 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      const dashboardRoute = 
        user.role === 'admin' ? '/admin/dashboard' :
        user.role === 'teacher' ? '/teacher/dashboard' :
        '/student/dashboard';
      
      return <Navigate to={dashboardRoute} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
