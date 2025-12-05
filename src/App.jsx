import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Dashboard from './Dashboard';
import Profile from './profile';
import Search from './search';
import CgpaCalc from './cgpacalc';
import AdminDashboard from './admindash';
import FileUpload from './FileUpload';
import Materials from './Materials';
import FeedPage from './feed';
import Networking from './Networking';
import { useAuth } from './context/UserContext.jsx';

// New role-based dashboard components
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import TeacherDashboard from './pages/dashboard/TeacherDashboard.jsx';
import AdminDashboardNew from './pages/dashboard/AdminDashboard.jsx';

const App = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Role-based dashboard redirect
  const getDashboardRoute = () => {
    if (!user) return '/login';
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Register />} 
        />

        {/* Role-based Dashboard Routes */}
        <Route 
          path="/student/dashboard" 
          element={isAuthenticated && user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/teacher/dashboard" 
          element={isAuthenticated && user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={isAuthenticated && user?.role === 'admin' ? <AdminDashboardNew /> : <Navigate to="/login" />} 
        />

        {/* Legacy dashboard route - redirect to role-based */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile/:id" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/search" 
          element={isAuthenticated ? <Search /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cgpa" 
          element={isAuthenticated ? <CgpaCalc /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/upload" 
          element={isAuthenticated ? <FileUpload /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/materials" 
          element={isAuthenticated ? <Materials /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/feed" 
          element={isAuthenticated ? <FeedPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/networking" 
          element={isAuthenticated ? <Networking /> : <Navigate to="/login" />}
        >
          <Route path="feed" element={<FeedPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<Search />} />
        </Route>

        {/* Root Route */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? getDashboardRoute() : "/login"} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;