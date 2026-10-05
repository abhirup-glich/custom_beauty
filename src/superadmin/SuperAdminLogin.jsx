import { useState } from 'react';
import { supabase, SUPER_ADMIN_EMAIL } from '../lib/supabase';
import '../admin/Admin.css';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('superadmin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [forgotSent, setForgotSent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim();
    if (cleanEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      setError(`Access denied. Only ${SUPER_ADMIN_EMAIL} can access the Super Admin portal.`);
      setLoading(false);
      return;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInErr) {
      setError(signInErr.message);
    }
    setLoading(false);
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/superadmin`,
    });
    if (resetErr) setError(resetErr.message);
    else setForgotSent(true);
    setLoading(false);
  }

  return (
    <div className="admin-login">
      {/* Animated background */}
      <div className="admin-login__bg">
        <div className="admin-login__orb admin-login__orb--1" style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.35) 0%, transparent 70%)' }} />
        <div className="admin-login__orb admin-login__orb--2" style={{ background: 'radial-gradient(circle, rgba(184,135,130,0.3) 0%, transparent 70%)' }} />
        <div className="admin-login__orb admin-login__orb--3" />
      </div>

      <div className="admin-login__card glass" style={{ border: '1px solid rgba(212,168,67,0.3)' }}>
        {/* Brand */}
        <div className="admin-login__brand">
          <div className="admin-login__brand-icon" style={{ background: 'linear-gradient(135deg, #d4a843, #B88782)', color: '#fff' }}>⚡</div>
          <div>
            <h1 className="admin-login__title" style={{ color: '#f5f0eb' }}>
              Super Admin Portal
            </h1>
            <p className="admin-login__subtitle" style={{ color: '#d4a843' }}>
              Master Management & Site Configuration
            </p>
          </div>
        </div>

        {mode === 'forgot' ? (
          forgotSent ? (
            <div className="admin-login__success">
              <div className="admin-login__success-icon">✉️</div>
              <p>Reset link sent to <strong>{email}</strong>. Check your inbox.</p>
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => { setMode('login'); setForgotSent(false); }}
              >
                Back to Super Admin Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="admin-login__form">
              <div className="admin-form-group">
                <label className="admin-label">Super Admin Email</label>
                <input
                  type="email"
                  className="admin-input"
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
              <label className="admin-label">Master Email</label>
              <input
                type="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                id="superadmin-email"
              />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                Designated Super Admin: {SUPER_ADMIN_EMAIL}
              </span>
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
                id="superadmin-password"
              />
            </div>

            {error && <p className="admin-error">{error}</p>}

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={loading}
              id="superadmin-login-btn"
              style={{
                background: 'linear-gradient(135deg, #d4a843, #B88782)',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <span className="admin-btn__spinner" />
              ) : (
                '⚡ Enter Super Admin Panel'
              )}
            </button>

            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setMode('forgot')}
            >
              Forgot password?
            </button>

            {/* Quick Helper Button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  style={{ fontSize: '0.78rem', padding: '0.55rem', border: '1px dashed rgba(212,168,67,0.5)' }}
                  onClick={() => {
                    setEmail(SUPER_ADMIN_EMAIL);
                    setPassword('superadmin123');
                  }}
                  id="fill-super-admin-btn"
                >
                  ⚡ One-Click Fill Super Admin Credentials
                </button>
              </div>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.82rem' }}>
          <a href="/admin" style={{ color: 'var(--adm-text-2)', textDecoration: 'none' }}>
            ← Staff Admin (/admin)
          </a>
          <a href="/" style={{ color: 'var(--adm-text-2)', textDecoration: 'none' }}>
            Visit Website ↗
          </a>
        </div>
      </div>
    </div>
  );
}
