import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../apiBase';

export default function SignUpPage() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    const emailRegex = /^[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w+$/;
    let isValid = true;
    let errText = '';

    if (!fname.trim() || !lname.trim()) {
      errText = 'Full name is required.';
      isValid = false;
    } else if (!emailRegex.test(email.toLowerCase())) {
      errText = 'Invalid email format.';
      isValid = false;
    } else if (password.length < 8) {
      errText = 'Password must be at least 8 characters.';
      isValid = false;
    } else if (!terms) {
      errText = 'You must accept the terms.';
      isValid = false;
    }

    if (!isValid) {
      setErrorMsg(`⚠ ${errText}`);
      setErrorVisible(true);
    } else {
      setErrorVisible(false);
    }

    return isValid;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      // Mock API
      try {
        const response = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ first_name: fname, last_name: lname, email, password }),
        });

        if (response.ok) {
          navigate('/');
        } else {
          const result = await response.json();
          setErrorMsg(`⚠ ${result.detail || result.message || 'Signup failed'}`);
          setErrorVisible(true);
        }
      } catch (err) {
        setErrorMsg('⚠ Cannot connect to server. Check if backend is running.');
        setErrorVisible(true);
      }
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', padding: '50px', backgroundColor: 'var(--bg-dark)' }}>
      {/* Left Pane */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/signup_logo.png" alt="SignUp Hero" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {/* Right Pane */}
      <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '32px', color: 'white' }}>Create an account</h1>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-sub)' }}>Already have an account?</span>
          <a onClick={() => navigate('/')} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Log in</a>
        </div>

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="First name" 
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              data-error={errorVisible && errorMsg.includes('name') ? 'true' : 'false'}
            />
            <input 
              type="text" 
              placeholder="Last name" 
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              data-error={errorVisible && errorMsg.includes('name') ? 'true' : 'false'}
            />
          </div>

          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-error={errorVisible && errorMsg.includes('email') ? 'true' : 'false'}
          />
          <input 
            type="password" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-error={errorVisible && errorMsg.includes('Password') ? 'true' : 'false'}
          />

          {errorVisible && (
            <div style={{ color: 'var(--danger)', fontSize: '14px', wordWrap: 'break-word' }}>
              {errorMsg}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-sub)', fontSize: '14px' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={terms} onChange={(e) => setTerms(e.target.checked)} /> 
            I agree to the Terms & Conditions
          </label>

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
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
