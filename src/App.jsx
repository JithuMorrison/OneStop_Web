import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './profile';
import Search from './search';
import CgpaCalc from './cgpacalc';
import AdminDashboard from './admindash';
import FileUpload from './FileUpload';
import Materials from './Materials';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(user && user.id === 'admin001');
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setIsAdmin(user.id === 'admin001');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
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
          path="/" 
          element={<Navigate to={isAuthenticated ? 
            (isAdmin ? "/admin/dashboard" : "/dashboard") : 
            "/login"} />
          } 
        />
        <Route path='/cgpa' element={<CgpaCalc />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/upload' element={isAuthenticated ? <FileUpload /> : <Navigate to="/login" />} />
        <Route path='/materials' element={isAuthenticated ? <Materials /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;