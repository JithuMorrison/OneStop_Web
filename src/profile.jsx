import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/${id || currentUser?.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
        setIsFollowing(data.following.includes(currentUser?.id));
        setIsOwnProfile(data._id === currentUser?.id);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    fetchProfile();
  }, [id, currentUser?.id, navigate]);

  const handleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/follow/${profile._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
      
      // Update local state
      if (isFollowing) {
        setProfile(prev => ({
          ...prev,
          followers: prev.followers - 1
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          followers: prev.followers + 1
        }));
      }
      
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) {
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
        <h1 style={{ fontSize: '24px', color: '#333' }}>Profile</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4A00E0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </header>
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            color: '#555',
            marginRight: '2rem'
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '0.5rem' }}>{profile.name}</h2>
            <p style={{ color: '#666', marginBottom: '0.25rem' }}>@{profile.username}</p>
            <p style={{ color: '#666', marginBottom: '1rem' }}>{profile.dept} - {profile.year} Year</p>
            
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isFollowing ? '#e63946' : '#4A00E0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4A00E0', marginBottom: '0.5rem' }}>Followers</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.followers}</p>
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4A00E0', marginBottom: '0.5rem' }}>Following</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.following.length}</p>
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4A00E0', marginBottom: '0.5rem' }}>Credits</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.credit}</p>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Contact Information</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {profile.email}</p>
            {profile.phone_number && <p><strong>Phone:</strong> {profile.phone_number}</p>}
          </div>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Academic Information</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <p style={{ marginBottom: '0.5rem' }}><strong>Department:</strong> {profile.dept}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Section:</strong> {profile.section}</p>
            <p><strong>Year:</strong> {profile.year}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;