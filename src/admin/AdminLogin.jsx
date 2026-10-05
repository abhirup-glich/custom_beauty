import { useState } from 'react';
import { supabase, ADMIN_USERS } from '../lib/supabase';

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
              <label className="admin-label">Email or Admin ID</label>
              <input
                type="text"
                className="admin-input"
                placeholder="adm_... or email@parlor.com"
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

            {/* Quick-fill credentials for the 2 Admin Accounts */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Configured Admins (2 Accounts)
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>
                  Click to auto-fill
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ADMIN_USERS.map((admin, idx) => (
                  <button
                    key={admin.id}
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.6rem 0.75rem',
                      textAlign: 'left',
                      fontSize: '0.76rem',
                      lineHeight: '1.35',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      setEmail(admin.email);
                      setPassword(admin.password);
                    }}
                    id={`quick-fill-admin-${idx + 1}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '2px' }}>
                      <strong style={{ color: '#fff', fontSize: '0.8rem' }}>
                        {admin.name || `Admin ${idx + 1}`}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent, #B88782)', fontWeight: 600 }}>
                        Auto-fill ↗
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                      ID: <span style={{ color: '#E8C5C8' }}>{admin.id}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
                      Email: <span>{admin.email}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: '2px' }}>
                      Password: <code style={{ color: '#d4a843', background: 'rgba(0,0,0,0.25)', padding: '1px 4px', borderRadius: '3px' }}>{admin.password}</code>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/" className="admin-login__back">← Back to Website</a>
        </div>
      </div>
    </div>
  );
}
