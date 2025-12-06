import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import CGPACalculator from './pages/shared/CGPACalculator.jsx';
import FileUpload from './FileUpload';
import Materials from './pages/shared/Materials.jsx'
import Timetable from './timetable';
import { useAuth } from './context/UserContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import NotFound from './pages/NotFound.jsx';
import Layout from './components/layout/Layout.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';
import LoadingPage from './components/shared/LoadingPage.jsx';

// New role-based dashboard components
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import TeacherDashboard from './pages/dashboard/TeacherDashboard.jsx';
import AdminDashboardNew from './pages/dashboard/AdminDashboard.jsx';

// Shared pages
import Clubs from './pages/shared/Clubs.jsx';
import Announcements from './pages/shared/Announcements.jsx';
import Posts from './pages/shared/Posts.jsx';
import Profile from './pages/shared/Profile.jsx';
import ODClaim from './pages/shared/ODClaim.jsx';
import CalendarEvents from './pages/shared/CalendarEvents.jsx';
import PortalsTools from './pages/shared/PortalsTools.jsx';
import Query from './pages/shared/Query.jsx';

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
    return <LoadingPage message="Loading SSN Connect..." />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <NotificationProvider userId={user?._id || user?.id}>
            <Routes>
          {/* Public Routes - Auth (No Layout) */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Register />} 
          />

          {/* Protected Routes with Layout */}
          <Route element={
            <ProtectedRoute>
              <Layout showChat={false} />
            </ProtectedRoute>
          }>
            {/* Role-based Dashboard Routes with Role Guards */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedRoute allowedRoles="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles="admin">
                  <AdminDashboardNew />
                </ProtectedRoute>
              } 
            />

            {/* Legacy dashboard route - redirect to role-based */}
            <Route 
              path="/dashboard" 
              element={<Navigate to={getDashboardRoute()} replace />} 
            />

            {/* Shared Routes - All authenticated users */}
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/portals-tools" element={<PortalsTools />} />
            <Route path="/queries" element={<Query />} />
            <Route path="/timetable" element={<Timetable />} />

            {/* Student-only Routes */}
            <Route 
              path="/cgpa" 
              element={
                <ProtectedRoute allowedRoles="student">
                  <CGPACalculator />
                </ProtectedRoute>
              } 
            />

            {/* Student and Teacher Routes */}
            <Route 
              path="/clubs" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Clubs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/announcements" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Announcements />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/posts" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Posts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/od-claims" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <ODClaim />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <CalendarEvents />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Profile Routes with Layout and Chat */}
          <Route element={
            <ProtectedRoute>
              <Layout showChat={true} />
            </ProtectedRoute>
          }>
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>

          {/* Root Route */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? getDashboardRoute() : "/login"} replace />} 
          />

          {/* 404 Not Found - Must be last */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;