import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [forgotSent, setForgotSent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });
    if (error) setError(error.message);
    else setForgotSent(true);
    setLoading(false);
  }

  return (
    <div className="admin-login">
      {/* Animated background */}
      <div className="admin-login__bg">
        <div className="admin-login__orb admin-login__orb--1" />
        <div className="admin-login__orb admin-login__orb--2" />
        <div className="admin-login__orb admin-login__orb--3" />
      </div>

      <div className="admin-login__card glass">
        {/* Brand */}
        <div className="admin-login__brand">
          <div className="admin-login__brand-icon">✦</div>
          <div>
            <h1 className="admin-login__title">Admin Panel</h1>
            <p className="admin-login__subtitle">Parlor Management System</p>
          </div>
        </div>

        {mode === 'forgot' ? (
          forgotSent ? (
            <div className="admin-login__success">
              <div className="admin-login__success-icon">✉️</div>
              <p>Reset link sent to <strong>{email}</strong>. Check your inbox.</p>
              <button className="admin-btn admin-btn--ghost" onClick={() => { setMode('login'); setForgotSent(false); }}>
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="admin-login__form">
              <div className="admin-form-group">
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  className="admin-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && <p className="admin-error">{error}</p>}
              <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setMode('login')}>
                Back to Login
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="admin-login__form">
            <div className="admin-form-group">
              <label className="admin-label">Email</label>
              <input
                type="text"
                className="admin-input"
                placeholder="admin@parlor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                id="admin-email"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="admin-password"
              />
            </div>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading} id="admin-login-btn">
              {loading ? (
                <span className="admin-btn__spinner" />
              ) : (
                '→ Sign In'
              )}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setMode('forgot')}>
              Forgot password?
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/" className="admin-login__back">← Back to Website</a>
        </div>
      </div>
    </div>
  );
}
