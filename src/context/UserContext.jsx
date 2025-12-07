import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService.jsx';

/**
 * UserContext provides global user state and authentication status
 * Handles JWT token persistence and validation across page refreshes
 */
const UserContext = createContext(null);

/**
 * UserProvider component wraps the app to provide user context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize user state from localStorage and validate JWT token
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Validate token and get current user
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear state
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user and update context state
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User object
   */
  const login = async (email, password) => {
    try {
      const { user: loggedInUser } = await authService.login(email, password);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      // Dispatch custom event for other components/tabs
      window.dispatchEvent(new Event('login'));
      
      return loggedInUser;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user and update context state
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user object
   */
  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Dispatch custom event for other components/tabs
      window.dispatchEvent(new Event('login'));
      
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user and clear context state
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      // Dispatch custom event for other components/tabs
      window.dispatchEvent(new Event('logout'));
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  /**
   * Update user data in context
   * @param {Object} updatedUser - Updated user object
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    // Update localStorage as well
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Custom hook to access user context
 * @returns {Object} - User context value
 * @throws {Error} - If used outside UserProvider
 */
export const useAuth = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  
  return context;
};

export default UserContext;
