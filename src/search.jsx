import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 style={{ fontSize: '24px', color: '#333' }}>Search Users</h1>
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
        <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or email"
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '8px 0 0 8px',
                border: '1px solid #ccc',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                backgroundColor: '#4A00E0',
                color: 'white',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        {results.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.map(user => (
              <li 
                key={user._id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{user.username}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>{user.email}</p>
                </div>
                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4A00E0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View Profile
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666', textAlign: 'center' }}>
            {query ? 'No users found' : 'Enter a search query to find users'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Search;