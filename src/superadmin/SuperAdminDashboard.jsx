import { useState } from 'react';
import { supabase, SUPER_ADMIN_EMAIL, isSupabaseConfigured } from '../lib/supabase';
import '../admin/Admin.css';

// Admin Tabs
import BookingsEditor from '../admin/tabs/BookingsEditor';
import SiteEditor from '../admin/tabs/SiteEditor';
import HeroEditor from '../admin/tabs/HeroEditor';
import ServicesEditor from '../admin/tabs/ServicesEditor';
import PackagesEditor from '../admin/tabs/PackagesEditor';
import AboutEditor from '../admin/tabs/AboutEditor';
import GalleryEditor from '../admin/tabs/GalleryEditor';

const TABS = [
  { id: 'bookings', label: 'Appointments & Calendar', icon: '📅', component: BookingsEditor },
  { id: 'site',     label: 'Site Details', icon: '⚙️', component: SiteEditor, isCore: true },
  { id: 'hero',     label: 'Home Photo',   icon: '🖼️', component: HeroEditor },
  { id: 'services', label: 'Services',     icon: '💅', component: ServicesEditor },
  { id: 'packages', label: 'Packages',     icon: '📦', component: PackagesEditor },
  { id: 'about',    label: 'About',        icon: '✨', component: AboutEditor },
  { id: 'gallery',  label: 'Gallery',      icon: '🎨', component: GalleryEditor },
];

export default function SuperAdminDashboard({ session }) {
  const email = session?.user?.email || SUPER_ADMIN_EMAIL;
  const [activeTab, setActiveTab] = useState('site');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || SiteEditor;

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ borderRight: '1px solid rgba(212,168,67,0.2)' }}>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-icon" style={{ background: 'linear-gradient(135deg, #d4a843, #B88782)', color: '#fff' }}>
            ⚡
          </span>
          <div>
            <div className="admin-sidebar__brand-name">Super Admin</div>
            <div className="admin-sidebar__brand-role" style={{ color: '#d4a843' }}>
              Master Control
            </div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <div style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
            Super Admin Controls
          </div>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-sidebar__nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`superadmin-tab-${tab.id}`}
              style={tab.isCore && activeTab === tab.id ? { borderColor: '#d4a843' } : {}}
            >
              <span className="admin-sidebar__nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.isCore && (
                <span className="admin-sidebar__super-badge" style={{ background: '#d4a843', color: '#111' }}>
                  CORE
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Status card */}
        <div style={{ margin: '0.75rem 1rem', padding: '0.65rem 0.85rem', background: 'rgba(212,168,67,0.08)', borderRadius: '8px', border: '1px solid rgba(212,168,67,0.2)', fontSize: '0.75rem' }}>
          <div style={{ color: '#d4a843', fontWeight: 600, marginBottom: '2px' }}>Database Status</div>
          <div style={{ color: 'var(--adm-text-2)' }}>
            {isSupabaseConfigured ? '🟢 Supabase Connected' : '🟡 Local Storage Engine'}
          </div>
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-avatar" style={{ background: 'linear-gradient(135deg, #d4a843, #B88782)' }}>
              SA
            </div>
            <div className="admin-sidebar__user-info">
              <div className="admin-sidebar__user-email" title={email}>{email}</div>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} id="superadmin-logout-btn">
            Sign Out
          </button>
          <a href="/admin" className="admin-sidebar__visit-site" style={{ color: 'var(--adm-text-2)' }}>
            ↔ Go to Parlor Admin (/admin)
          </a>
          <a href="/" className="admin-sidebar__visit-site">
            ← Visit Website
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-main__header" style={{ borderBottom: '1px solid rgba(212,168,67,0.18)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(212,168,67,0.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.3)', fontWeight: 600 }}>
                ⚡ SUPER ADMIN
              </span>
              <h2 className="admin-main__title">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
            <p className="admin-main__subtitle">
              {activeTab === 'site'
                ? 'Master site configuration — salon name, phone, WhatsApp, Google Maps, branding'
                : 'Super Admin override mode — edits apply directly across the salon system'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/admin" className="admin-btn admin-btn--ghost">
              Switch to /admin
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost admin-preview-btn">
              Preview Site ↗
            </a>
          </div>
        </div>

        <div className="admin-main__content">
          <ActiveComponent isSuperAdmin={true} />
        </div>
      </main>
    </div>
  );
}
