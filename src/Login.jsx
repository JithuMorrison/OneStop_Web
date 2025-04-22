import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dept, setDept] = useState('');
  const [section, setSection] = useState('');
  const [year, setYear] = useState('');
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Hardcoded admin login (remove this in production)
    if(email === 'jithus2004@gmail.com' && password === 'HelloWorld') {
      // Create admin user object
      const adminUser = {
        id: 'admin001',
        email: email,
        role: 'admin',
        name: 'Admin User'
      };
      
      // Store admin details in localStorage
      localStorage.setItem('token', 'admin-token');
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard');
      return;
    }

    try {
      const endpoint = isRegistering ? 'http://localhost:5000/api/register' : 'http://localhost:5000/api/login';
      const body = isRegistering ? { 
        username, 
        name,
        email, 
        password,
        phone_number: phoneNumber,
        dept,
        section,
        year,
        role: 'student' // Default role for registration
      } : { email, password };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Notify parent component
      onLogin(data.user);
      
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!forgotEmail) {
      setError('Please enter your email');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
  
      setError('OTP sent to your email');
      setForgotPasswordStep(2); // Move to OTP step
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          newPassword
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
  
      setError('Password reset successfully');
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.message);
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
        }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Username*</label>
                <input
                  type="text"
                  id="username"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Full Name*</label>
                <input
                  type="text"
                  id="name"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="dept" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Department*</label>
                <select
                  id="dept"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="MECH">Mechanical</option>
                  <option value="CIVIL">Civil</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="section" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Section*</label>
                <input
                  type="text"
                  id="section"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="year" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Year*</label>
                <select
                  id="year"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '1010px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Email*</label>
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
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Password*</label>
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
              transition: 'background 0.3s ease',
              marginBottom: '1rem'
            }}
          >
            {isRegistering ? 'Register' : 'Log In'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              color: '#4A00E0',
              border: '1px solid #4A00E0',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isRegistering ? 'Already have an account? Log In' : 'Need an account? Register'}
          </button>
          {!isRegistering && !showForgotPassword && (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              color: '#4A00E0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem'
            }}
          >
            Forgot Password?
          </button>
        )}

        {showForgotPassword && (
          <div style={{ marginTop: '1rem' }}>
            {forgotPasswordStep === 1 && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="forgotEmail" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Enter your email</label>
                  <input
                    type="email"
                    id="forgotEmail"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
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
                    transition: 'background 0.3s ease',
                    marginBottom: '1rem'
                  }}
                >
                  Send OTP
                </button>
              </>
            )}

            {forgotPasswordStep === 2 && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="otp" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#4A00E0',
                    backgroundImage: 'linear-gradient(to right, ',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                    transition: 'background 0.3s ease',
                    marginBottom: '1rem'
                  }}
                >
                  Reset Password
                </button>
              </>
            )}
          </div>
        )}
        </form>
      </div>
    </div>
  );
};

export default Login;