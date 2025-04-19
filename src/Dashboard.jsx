import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: '#f5f7fa',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e1e5eb'
      }}>
        <h1 style={{ fontSize: '24px', color: '#333' }}>Dashboard</h1>
        <div>
          <button 
            onClick={() => navigate('/profile')}
            style={{
              padding: '8px 16px',
              marginRight: '1rem',
              backgroundColor: '#4A00E0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            My Profile
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e63946',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 3fr',
        gap: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#4A00E0' }}>Quick Actions</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <button 
                onClick={() => navigate('/search')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'background 0.2s ease'
                }}
              >
                Search Users
              </button>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <button 
                onClick={() => navigate('/profile')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'background 0.2s ease'
                }}
              >
                View Profile
              </button>
            </li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome, {user.username}!</h2>
          <p style={{ color: '#666' }}>This is your dashboard. Use the navigation to explore the platform.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;