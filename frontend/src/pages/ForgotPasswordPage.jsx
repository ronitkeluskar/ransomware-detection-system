import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../apiBase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const validateEmail = () => {
    const emailRegex = /^[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const response = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrorMsg(data.detail || 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setErrorMsg('Cannot reach the server. Is the backend running?');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', padding: '50px', backgroundColor: 'var(--bg-dark)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/signin_logo.png" alt="" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'center', maxWidth: '520px' }}>
        <h1 style={{ fontSize: '32px', color: 'white', fontWeight: 'bold' }}>Forgot password</h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '15px', lineHeight: 1.5 }}>
          Enter the email you used to register. We will send a verification link so you can choose a new password.
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-sub)', fontSize: '13px', marginBottom: '8px' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                autoComplete="email"
                data-error={errorMsg ? 'true' : 'false'}
              />
            </div>
            {errorMsg && (
              <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{errorMsg}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 'bold',
                padding: '14px',
                fontSize: '16px',
                borderRadius: '8px',
                marginTop: '8px',
              }}
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <div
            style={{
              marginTop: '16px',
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--success)',
            }}
          >
            <div style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>Check your inbox</div>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', lineHeight: 1.55 }}>
              If an account exists for <strong style={{ color: 'white' }}>{email.trim()}</strong>, we sent instructions to that address.
              The link expires in one hour. If you do not see the email, check spam or confirm SMTP settings on the server.
            </p>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a onClick={() => navigate('/')} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            Back to sign in
          </a>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <a onClick={() => navigate('/signup')} style={{ color: 'var(--text-sub)' }}>
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
