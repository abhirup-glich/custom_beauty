import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Tab components
import BookingsEditor from './tabs/BookingsEditor';
import SiteEditor from './tabs/SiteEditor';
import ThemeEditor from './tabs/ThemeEditor';
import HeroEditor from './tabs/HeroEditor';
import ServicesEditor from './tabs/ServicesEditor';
import PackagesEditor from './tabs/PackagesEditor';
import AboutEditor from './tabs/AboutEditor';
import GalleryEditor from './tabs/GalleryEditor';

const TABS = [
  { id: 'bookings', label: 'Appointments & Calendar', icon: '📅', component: BookingsEditor },
  { id: 'site',     label: 'Site Details',  icon: '⚙️', component: SiteEditor },
  { id: 'theme',    label: 'Theme Packs',   icon: '🎨', component: ThemeEditor },
  { id: 'hero',     label: 'Home Photo',    icon: '🖼️', component: HeroEditor },
  { id: 'services', label: 'Services',        icon: '💅', component: ServicesEditor },
  { id: 'packages', label: 'Packages',        icon: '📦', component: PackagesEditor },
  { id: 'about',    label: 'About',           icon: '✨', component: AboutEditor },
  { id: 'gallery',  label: 'Gallery',         icon: '📷', component: GalleryEditor },
];

export default function AdminDashboard({ session }) {
  const email = session?.user?.email || 'admin@parlor.com';
  const [activeTab, setActiveTab] = useState('site');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || SiteEditor;

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-icon">✦</span>
          <div>
            <div className="admin-sidebar__brand-name">Admin Panel</div>
            <div className="admin-sidebar__brand-role">
              Salon Management
            </div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-sidebar__nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`admin-tab-${tab.id}`}
            >
              <span className="admin-sidebar__nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-avatar">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="admin-sidebar__user-info">
              <div className="admin-sidebar__user-email" title={email}>{email}</div>
              {session?.user?.id && (
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ID: {session.user.id}
                </div>
              )}
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} id="admin-logout-btn">
            Sign Out
          </button>
          <a href="/" className="admin-sidebar__visit-site">← Visit Website</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-main__header">
          <div>
            <h2 className="admin-main__title">{TABS.find(t => t.id === activeTab)?.label}</h2>
            <p className="admin-main__subtitle">
              {activeTab === 'bookings'
                ? 'Manage client bookings, sync with Google Calendar, and schedule appointments'
                : activeTab === 'theme'
                ? 'Choose from professionally curated luxury aesthetic palettes & typography'
                : activeTab === 'site'
                ? 'Manage salon name, phone, WhatsApp, Google Maps, branding and contact info'
                : 'Changes are saved to database and reflected live on the site'}
            </p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost admin-preview-btn">
            Preview Site ↗
          </a>
        </div>

        <div className="admin-main__content">
          {ActiveComponent && <ActiveComponent isSuperAdmin={true} />}
        </div>
      </main>
    </div>
  );
}
