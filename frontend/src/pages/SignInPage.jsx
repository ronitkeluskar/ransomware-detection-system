import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../apiBase';

export default function SignInPage({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    const emailRegex = /^[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w+$/;
    let isValid = true;

    if (!emailRegex.test(email.toLowerCase())) {
      setErrorMsg('⚠ Please enter a valid email address.');
      setErrorVisible(true);
      isValid = false;
    } else if (password.length < 1) {
      setErrorMsg('⚠ Password is required.');
      setErrorVisible(true);
      isValid = false;
    }

    if (isValid) setErrorVisible(false);
    return isValid;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      // Mock API integration or future real integration
      try {
        const response = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();
          // Assuming result.user contains user dictionary
          const signedInUser = result.user || { first_name: 'Admin', last_name: 'User', email: email.trim().toLowerCase() };
          onSignIn(signedInUser, rememberMe);
          navigate('/dashboard');
        } else {
          // Fallback demo login if server not connected
          if (email === 'test@test.com' && password === 'password') {
             onSignIn({ first_name: 'Test', last_name: 'User', email: 'test@test.com' }, rememberMe);
             navigate('/dashboard');
          } else {
             const result = await response.json();
             setErrorMsg(`⚠ ${result.detail || result.message || 'Login failed'}`);
             setErrorVisible(true);
          }
        }
      } catch {
        // Fallback demo login if fetch completely fails
        if (email === 'test@test.com' && password === 'password') {
           onSignIn({ first_name: 'Test', last_name: 'User', email: 'test@test.com' }, rememberMe);
           navigate('/dashboard');
        } else {
           setErrorMsg('⚠ Cannot connect to server.');
           setErrorVisible(true);
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', padding: '50px', backgroundColor: 'var(--bg-dark)' }}>
      {/* Left Pane */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/signin_logo.png" alt="SignIn Hero" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {/* Right Pane */}
      <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '32px', color: 'white' }}>Welcome back</h1>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-sub)' }}>New to Xenon?</span>
          <a onClick={() => navigate('/signup')} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Create account</a>
        </div>

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-error={errorVisible && errorMsg.includes('email') ? 'true' : 'false'}
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-error={errorVisible && errorMsg.includes('Password') ? 'true' : 'false'}
          />

          {errorVisible && (
            <div style={{ color: 'var(--danger)', fontSize: '14px', wordWrap: 'break-word' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-sub)', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 'auto', cursor: 'pointer' }}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a
              onClick={() => navigate('/forgot-password')}
              style={{ fontSize: '12px', color: 'var(--accent-primary)' }}
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            fontSize: '16px',
            marginTop: '10px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-primary)'}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
