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
    const fetchProfileData = async () => {
      try {
        // Fetch the profile data
        const profileResponse = await fetch(`http://localhost:5000/api/user/${id || currentUser?.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const profileData = await profileResponse.json();
        setProfile(profileData);
        setIsOwnProfile(profileData._id === currentUser?.id);

        // Fetch current user's following list if viewing another profile
        if (!isOwnProfile && currentUser?.id) {
          const followResponse = await fetch(`http://localhost:5000/api/user/${currentUser.id}/following`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (followResponse.ok) {
            const followingData = await followResponse.json();
            setIsFollowing(followingData.some(user => user === profileData._id));
          }
        }
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    fetchProfileData();
  }, [id, currentUser?.id, navigate]);

  const handleFollow = async () => {
    try {
      const endpoint = isFollowing 
        ? `http://localhost:5000/api/unfollow/${profile._id}`
        : `http://localhost:5000/api/follow/${profile._id}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
      
      // Optimistically update UI
      setProfile(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }));
      setIsFollowing(!isFollowing);

      // Update localStorage follow data if available
      const followData = JSON.parse(localStorage.getItem('followData')) || { following: [] };
      let updatedFollowing;
      
      if (isFollowing) {
        updatedFollowing = followData.following.filter(userId => userId !== profile._id);
      } else {
        updatedFollowing = [...followData.following, profile._id];
      }
      
      localStorage.setItem('followData', JSON.stringify({
        ...followData,
        following: updatedFollowing
      }));
      
    } catch (err) {
      console.error(err);
      // Revert UI changes if the operation failed
      setProfile(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers + 1 : prev.followers - 1
      }));
      setIsFollowing(isFollowing);
    }
  };

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <div>Loading profile...</div>
      </div>
    );
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
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            ':hover': {
              backgroundColor: '#3a00c0'
            }
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
            marginRight: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '0.5rem', color: '#333' }}>{profile.name}</h2>
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
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: isFollowing ? '#d62839' : '#3a00c0'
                  }
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
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#4A00E0', marginBottom: '0.5rem', fontSize: '16px' }}>Followers</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{profile.followers}</p>
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#4A00E0', marginBottom: '0.5rem', fontSize: '16px' }}>Following</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{profile.following.length}</p>
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#4A00E0', marginBottom: '0.5rem', fontSize: '16px' }}>Credits</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{profile.credit}</p>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333', fontSize: '20px' }}>Contact Information</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ marginBottom: '0.75rem', color: '#555' }}><strong style={{ color: '#333' }}>Email:</strong> {profile.email}</p>
            {profile.phone_number && (
              <p style={{ color: '#555' }}><strong style={{ color: '#333' }}>Phone:</strong> {profile.phone_number}</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#333', fontSize: '20px' }}>Academic Information</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ marginBottom: '0.75rem', color: '#555' }}><strong style={{ color: '#333' }}>Department:</strong> {profile.dept}</p>
            <p style={{ marginBottom: '0.75rem', color: '#555' }}><strong style={{ color: '#333' }}>Section:</strong> {profile.section}</p>
            <p style={{ color: '#555' }}><strong style={{ color: '#333' }}>Year:</strong> {profile.year}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;