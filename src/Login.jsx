import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
    } else {
      setError('');
      // Perform login logic here
      console.log('Logging in with:', { email, password });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to right, #74ebd5, #9face6)',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '420px',
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#333'
        }}>Welcome Back</h2>
        {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Email</label>
            <input
              type="email"
              id="email"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Password</label>
            <input
              type="password"
              id="password"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4A00E0',
              backgroundImage: 'linear-gradient(to right, #8E2DE2, #4A00E0)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              transition: 'background 0.3s ease'
            }}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
