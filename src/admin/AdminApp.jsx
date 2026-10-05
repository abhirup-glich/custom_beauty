import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './Admin.css';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        <p>Loading admin panel…</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="admin-error-screen">
        <div className="admin-error-card">
          <div className="admin-error-icon">⚙️</div>
          <h2>Supabase Not Configured</h2>
          <p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file and restart the dev server.</p>
          <a href="/" className="admin-btn admin-btn--primary">← Back to Site</a>
        </div>
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  return <AdminDashboard session={session} />;
}

