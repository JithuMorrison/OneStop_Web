import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize Supabase client
  const supabase = createClient(
    'https://btnbpqgzczkopffydkms.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bmJwcWd6Y3prb3BmZnlka21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDE3MTIsImV4cCI6MjA0OTQ3NzcxMn0.ClI_obLsIuzQ7ks-ysopQ0cX2ZBUSwRanS1mRjQ3qUM'
  );

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        // Fetch users data
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const usersData = await usersResponse.json();
        const usersMap = new Map(usersData.users.map(user => [user._id, user]));

        // Fetch first 10 materials from MongoDB
        const response = await fetch('http://localhost:5000/api/materials', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        
        const mongoData = await response.json();
        const first10Materials = mongoData.files;
        console.log(first10Materials);

        // Fetch corresponding files from Supabase
        const materialsWithFiles = await Promise.all(
          first10Materials.map(async (material) => {
            const { data: fileData, error: fileError } = await supabase
              .storage
              .from('jithu')
              .createSignedUrl(material.fileUrl, 3600); // 1 hour expiry

            if (fileError) {
              console.error('Error fetching file:', fileError);
              return {
                ...material,
                downloadUrl: null
              };
            }

            const user = usersMap.get(material.userId);
            return {
              ...material,
              downloadUrl: fileData.signedUrl,
              userName: user ? user.name : 'Unknown'
            };
          })
        );

        setMaterials(materialsWithFiles);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#4A00E0',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        color: '#e53e3e',
        padding: '2rem'
      }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a202c'
          }}>Study Materials</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4A00E0',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Back to Dashboard
          </button>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {materials.map((material) => (
            <div
              key={material._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#4A00E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginRight: '1rem'
                }}>
                  {material.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1a202c',
                    marginBottom: '0.25rem'
                  }}>{material.title}</h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4a5568'
                  }}>by {material.userName}</p>
                </div>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: '#4a5568',
                marginBottom: '1rem'
              }}>{material.description}</p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#718096'
                }}>
                  {new Date(material.uploadDate).toLocaleDateString()}
                </span>
                {material.downloadUrl && (
                  <a
                    href={material.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#4A00E0',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Materials;