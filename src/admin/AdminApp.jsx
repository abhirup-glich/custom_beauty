import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './Admin.css';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (supabase?.auth?.getSession) {
          const { data } = await supabase.auth.getSession();
          if (mounted) setSession(data?.session || null);
        }
      } catch (err) {
        console.warn('Auth session check:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    let subscription = null;
    try {
      if (supabase?.auth?.onAuthStateChange) {
        const subRes = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (mounted) setSession(newSession);
        });
        subscription = subRes?.data?.subscription;
      }
    } catch (err) {
      console.warn('Auth listener setup:', err);
    }

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        <p>Loading admin panel…</p>
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  return <AdminDashboard session={session} />;
}

