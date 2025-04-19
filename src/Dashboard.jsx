import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut, FiBook, FiHome, FiAward, FiMessageSquare } from 'react-icons/fi';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
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
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          borderTopColor: '#fff',
          animation: 'spin 1s ease-in-out infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc'
    }}>
      {/* Sidebar */}
      <div style={{
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '2rem 1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#6366f1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.username.charAt(0).toUpperCase()}
              </span>
              {user.username}
            </h1>
            <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{user.email}</p>
          </div>

          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setActiveTab('home');
                    navigate('/dashboard');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    backgroundColor: activeTab === 'home' ? '#4338ca' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    ':hover': {
                      backgroundColor: '#4338ca'
                    }
                  }}
                >
                  <FiHome size={18} />
                  Dashboard
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setActiveTab('search');
                    navigate('/search');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    backgroundColor: activeTab === 'search' ? '#4338ca' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    ':hover': {
                      backgroundColor: '#4338ca'
                    }
                  }}
                >
                  <FiSearch size={18} />
                  Search Users
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setActiveTab('cgpa');
                    navigate('/cgpa');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    backgroundColor: activeTab === 'cgpa' ? '#4338ca' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    ':hover': {
                      backgroundColor: '#4338ca'
                    }
                  }}
                >
                  <FiAward size={18} />
                  CGPA Calculator
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    navigate('/profile');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    backgroundColor: activeTab === 'profile' ? '#4338ca' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    ':hover': {
                      backgroundColor: '#4338ca'
                    }
                  }}
                >
                  <FiUser size={18} />
                  My Profile
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setActiveTab('messages');
                    navigate('/search');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    backgroundColor: activeTab === 'messages' ? '#4338ca' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    ':hover': {
                      backgroundColor: '#4338ca'
                    }
                  }}
                >
                  <FiMessageSquare size={18} />
                  Messages
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                ':hover': {
                  backgroundColor: '#4338ca'
                }
              }}
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>Welcome back, {user.username}!</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Here's what's happening with your account today.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #10b981'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>Department</h3>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>{user.dept || 'Not specified'}</p>
            </div>
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #3b82f6'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>Year</h3>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>{user.year || 'Not specified'}</p>
            </div>
            <div style={{
              backgroundColor: '#fef2f2',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #ef4444'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>Section</h3>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>{user.section || 'Not specified'}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>Quick Actions</h2>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button 
                onClick={() => navigate('/search')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#4338ca'
                  }
                }}
              >
                <FiSearch size={18} />
                Search Users
              </button>
              <button 
                onClick={() => navigate('/cgpa')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <FiAward size={18} />
                CGPA Calculator
              </button>
              <button 
                onClick={() => navigate('/profile')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <FiUser size={18} />
                View Profile
              </button>
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>Recent Activity</h2>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#e0e7ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5'
                }}>
                  <FiBook size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: '500', color: '#1e293b' }}>You logged in to your account</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Just now</p>
                </div>
              </div>
              <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <FiUser size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: '500', color: '#1e293b' }}>Welcome to your new dashboard</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;