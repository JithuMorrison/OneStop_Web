import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMessageSquare, FiUser, FiArrowLeft, FiSend } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Fetch user's chats when component mounts
  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch chats');
        
        const chats = await response.json();
        setUserChats(chats);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserChats();
  }, [activeChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

    console.log(chatMessages);
    
    // Optimistically update UI
    const tempMessage = {
      _id: currentUser._id, // temporary ID
      content: message,
      sender: { username: currentUser.name, _id: currentUser.id},
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, tempMessage]);
    setMessage('');
    
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
    } catch (err) {
      console.error(err);
      // Revert optimistic update if failed
      setChatMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(p => p._id !== currentUser.id);
  };

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      padding: '2rem',
      background: '#f8f9fa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 4rem)',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: 'white'
        }}>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#212529',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {activeChat ? (
              <>
                <button 
                  onClick={() => setActiveChat(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#495057',
                    transition: 'all 0.2s',
                    ':hover': {
                      backgroundColor: '#f1f3f5',
                      color: '#212529'
                    }
                  }}
                >
                  <FiArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#495057'
                  }}>
                    <FiUser size={18} />
                  </div>
                  <span>{getOtherParticipant(activeChat)?.username || 'Chat'}</span>
                </div>
              </>
            ) : (
              <>
                <FiSearch size={20} />
                <span>Search Users</span>
              </>
            )}
          </h1>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              color: '#495057',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              ':hover': {
                backgroundColor: '#e9ecef'
              }
            }}
          >
            Back to Dashboard
          </button>
        </div>
        
        {/* Main Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {!activeChat ? (
            <div style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto'
            }}>
              <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex',
                  position: 'relative',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username or email..."
                    style={{
                      flex: 1,
                      padding: '12px 16px 12px 44px',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                      ':focus': {
                        borderColor: '#4dabf7',
                        boxShadow: '0 0 0 3px rgba(77, 171, 247, 0.2)'
                      }
                    }}
                  />
                  <FiSearch 
                    size={20} 
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#adb5bd'
                    }} 
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '8px 16px',
                      backgroundColor: '#4dabf7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      ':hover': {
                        backgroundColor: '#339af0'
                      },
                      ':disabled': {
                        backgroundColor: '#adb5bd',
                        cursor: 'not-allowed'
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              
              {results.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ 
                    marginBottom: '1.5rem', 
                    color: '#495057',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    Search Results
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px'
                  }}>
                    {results.map(user => (
                      <div 
                        key={user._id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          ':hover': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#e9ecef',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#495057',
                            flexShrink: 0
                          }}>
                            <FiUser size={24} />
                          </div>
                          <div>
                            <h3 style={{ 
                              margin: 0,
                              fontWeight: '600',
                              color: '#212529'
                            }}>
                              {user.username}
                            </h3>
                            <p style={{ 
                              color: '#868e96', 
                              fontSize: '14px',
                              margin: 0
                            }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            onClick={() => navigate(`/profile/${user._id}`)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'transparent',
                              color: '#495057',
                              border: '1px solid #e9ecef',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              ':hover': {
                                backgroundColor: '#f8f9fa'
                              }
                            }}
                          >
                            <FiUser size={16} />
                            Profile
                          </button>
                          <button
                            onClick={() => startChat(user._id)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#4dabf7',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              ':hover': {
                                backgroundColor: '#339af0'
                              }
                            }}
                          >
                            <FiMessageSquare size={16} />
                            Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {userChats.length > 0 && (
                <div>
                  <h3 style={{ 
                    marginBottom: '1.5rem', 
                    color: '#495057',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    Your Conversations
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {userChats.map(chat => {
                      const otherUser = getOtherParticipant(chat);
                      if (!otherUser) return null;
                      
                      const lastMessage = chat.messages.length > 0 ? 
                        chat.messages[chat.messages.length - 1] : null;
                      
                      return (
                        <div
                          key={chat._id}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e9ecef',
                            transition: 'all 0.2s',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            ':hover': {
                              backgroundColor: '#f8f9fa'
                            }
                          }}
                          onClick={() => {
                            setActiveChat(chat);
                            loadMessages(chat._id);
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px'
                          }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#495057',
                              flexShrink: 0
                            }}>
                              <FiUser size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px'
                              }}>
                                <h3 style={{ 
                                  margin: 0,
                                  fontWeight: '600',
                                  color: '#212529'
                                }}>
                                  {otherUser.username}
                                </h3>
                                {lastMessage && (
                                  <span style={{ 
                                    color: '#868e96', 
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                )}
                              </div>
                              <p style={{ 
                                color: '#868e96', 
                                fontSize: '14px',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {lastMessage ? 
                                  (lastMessage.sender._id === currentUser.id ? 
                                    `You: ${lastMessage.content}` : 
                                    lastMessage.content) : 
                                  'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.length === 0 && userChats.length === 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4rem 2rem',
                  color: '#868e96',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#f1f3f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <FiSearch size={32} color="#adb5bd" />
                  </div>
                  <h3 style={{ 
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    color: '#495057'
                  }}>
                    {query ? 'No users found' : 'Search for users'}
                  </h3>
                  <p style={{ 
                    margin: 0,
                    fontSize: '14px',
                    maxWidth: '400px'
                  }}>
                    {query ? 
                      'Try a different search term' : 
                      'Enter a username or email to find people to chat with'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              flex: 1
            }}>
              {/* Chat Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid #e9ecef',
                backgroundColor: 'white'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#495057'
                  }}>
                    <FiUser size={20} />
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0,
                      fontWeight: '600',
                      color: '#212529'
                    }}>
                      {getOtherParticipant(activeChat)?.username}
                    </h3>
                    <p style={{ 
                      color: '#868e96', 
                      fontSize: '12px',
                      margin: 0
                    }}>
                      {chatMessages.length > 0 ? 
                        `Last seen ${new Date(chatMessages[chatMessages.length - 1].timestamp).toLocaleTimeString()}` : 
                        'No messages yet'}
                    </p>
                  </div>
                </div>
                <button style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#495057',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#f1f3f5'
                  }
                }}>
                  <BsThreeDotsVertical size={18} />
                </button>
              </div>
              
              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, index) => {
                    const isCurrentUser = msg.sender._id === currentUser.id;
                    const showAvatar = index === 0 || 
                      chatMessages[index - 1].sender._id !== msg.sender._id;
                    
                    return (
                      <div 
                        key={msg._id}
                        style={{
                          marginBottom: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '8px',
                          maxWidth: '80%'
                        }}>
                          {!isCurrentUser && showAvatar && (
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#495057',
                              flexShrink: 0,
                              marginBottom: '4px'
                            }}>
                              <FiUser size={16} />
                            </div>
                          )}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                            gap: '4px'
                          }}>
                            {!isCurrentUser && showAvatar && (
                              <span style={{ 
                                fontSize: '12px',
                                color: '#495057',
                                fontWeight: '500'
                              }}>
                                {msg.sender.username}
                              </span>
                            )}
                            <div style={{
                              padding: '12px 16px',
                              borderRadius: isCurrentUser ? 
                                '18px 4px 18px 18px' : '4px 18px 18px 18px',
                              backgroundColor: isCurrentUser ? 
                                '#4dabf7' : '#e9ecef',
                              color: isCurrentUser ? 'white' : '#212529',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                              wordBreak: 'break-word'
                            }}>
                              {msg.content}
                            </div>
                            <span style={{ 
                              fontSize: '11px',
                              color: '#868e96'
                            }}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#868e96',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f3f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <FiMessageSquare size={32} color="#adb5bd" />
                    </div>
                    <h3 style={{ 
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      color: '#495057'
                    }}>
                      No messages yet
                    </h3>
                    <p style={{ 
                      margin: 0,
                      fontSize: '14px',
                      maxWidth: '300px'
                    }}>
                      Start the conversation with {getOtherParticipant(activeChat)?.username}
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div style={{ 
                padding: '16px 24px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: 'white'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '24px',
                      border: '1px solid #e9ecef',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: '#f8f9fa',
                      ':focus': {
                        borderColor: '#4dabf7',
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(77, 171, 247, 0.2)'
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#4dabf7',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: '#339af0',
                        transform: 'translateY(-2px)'
                      },
                      ':disabled': {
                        backgroundColor: '#e9ecef',
                        color: '#adb5bd',
                        cursor: 'not-allowed',
                        transform: 'none'
                      }
                    }}
                    disabled={!message.trim()}
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;