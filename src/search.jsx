import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

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
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to start chat');
      
      const chat = await response.json();
      setActiveChat(chat);
      loadMessages(chat._id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load messages');
      
      const chat = await response.json();
      setChatMessages(chat.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${activeChat._id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: message })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const chat = await response.json();
      setChatMessages(chat.messages || []);
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(p => p._id !== currentUser.id);
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
        <h1 style={{ fontSize: '24px', color: '#333' }}>
          {activeChat ? `Chat with ${getOtherParticipant(activeChat)?.username}` : 'Search Users'}
        </h1>
        <button 
          onClick={() => activeChat ? setActiveChat(null) : navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4A00E0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {activeChat ? 'Back to Search' : 'Back to Dashboard'}
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
        {!activeChat ? (
          <>
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
                    <div>
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4A00E0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => startChat(user._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#2E7D32',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Message
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>
                {query ? 'No users found' : 'Enter a search query to find users'}
              </p>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    style={{
                      marginBottom: '1rem',
                      textAlign: msg.sender._id === currentUser.id ? 'right' : 'left'
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: msg.sender._id === currentUser.id ? 
                        '12px 12px 0 12px' : '12px 12px 12px 0',
                      backgroundColor: msg.sender._id === currentUser.id ? 
                        '#4A00E0' : '#e0e0e0',
                      color: msg.sender._id === currentUser.id ? 'white' : '#333'
                    }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        {msg.sender.username}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', textAlign: 'center' }}>No messages yet</p>
              )}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '8px 0 0 8px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#4A00E0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0 8px 8px 0',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;