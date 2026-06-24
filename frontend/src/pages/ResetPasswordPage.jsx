import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrl } from '../apiBase';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

  const verifyToken = useCallback(async () => {
    if (!token || token.length < 8) {
      setVerifyError('Missing or invalid reset link.');
      setChecking(false);
      return;
    }
    setChecking(true);
    setVerifyError('');
    try {
      const response = await fetch(apiUrl(`/api/auth/reset/verify?token=${encodeURIComponent(token)}`));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setVerifyError(typeof data.detail === 'string' ? data.detail : 'This link is invalid or has expired.');
        setTokenValid(false);
      } else {
        setTokenValid(true);
        setAccountEmail(data.email || '');
      }
    } catch {
      setVerifyError('Cannot reach the server.');
      setTokenValid(false);
    }
    setChecking(false);
  }, [token]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleReset = async (e) => {
    e.preventDefault();
    setFormError('');
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(typeof data.detail === 'string' ? data.detail : 'Reset failed.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setFormError('Cannot reach the server.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', padding: '50px', backgroundColor: 'var(--bg-dark)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/signup_logo.png" alt="" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', maxWidth: '520px' }}>
        <h1 style={{ fontSize: '32px', color: 'white', fontWeight: 'bold' }}>Set new password</h1>

        {checking && (
          <p style={{ color: 'var(--text-sub)' }}>Verifying your reset link…</p>
        )}

        {!checking && !tokenValid && (
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--danger)',
            }}
          >
            <p style={{ color: 'var(--danger)', marginBottom: '12px' }}>{verifyError}</p>
            <a onClick={() => navigate('/forgot-password')} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              Request a new link
            </a>
          </div>
        )}

        {!checking && tokenValid && !done && (
          <>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>
              Verified for <strong style={{ color: 'white' }}>{accountEmail}</strong>. Choose a new password.
            </p>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-sub)', fontSize: '13px', marginBottom: '8px' }}>New password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-sub)', fontSize: '13px', marginBottom: '8px' }}>Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={submitting}
                  autoComplete="new-password"
                />
              </div>
              {formError && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{formError}</div>}
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
                {submitting ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}

        {done && (
          <div
            style={{
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--success)',
            }}
          >
            <p style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '10px' }}>Password updated</p>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '16px' }}>
              You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px 20px',
                borderRadius: '8px',
              }}
            >
              Go to sign in
            </button>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <a onClick={() => navigate('/')} style={{ color: 'var(--text-sub)', fontSize: '14px' }}>
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
