import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Tab components
import BookingsEditor from './tabs/BookingsEditor';
import SiteEditor from './tabs/SiteEditor';
import HoursEditor from './tabs/HoursEditor';
import ThemeEditor from './tabs/ThemeEditor';
import HeroEditor from './tabs/HeroEditor';
import ServicesEditor from './tabs/ServicesEditor';
import PackagesEditor from './tabs/PackagesEditor';
import BridalEditor from './tabs/BridalEditor';
import TeamEditor from './tabs/TeamEditor';
import TransformationsEditor from './tabs/TransformationsEditor';
import AboutEditor from './tabs/AboutEditor';
import TestimonialsEditor from './tabs/TestimonialsEditor';
import GalleryEditor from './tabs/GalleryEditor';

const TABS = [
  { id: 'bookings',        label: 'Appointments & Calendar', icon: '📅', component: BookingsEditor },
  { id: 'site',            label: 'Site Details & Headings', icon: '⚙️', component: SiteEditor },
  { id: 'hours',           label: 'Hours & Rules',           icon: '⏰', component: HoursEditor },
  { id: 'theme',           label: 'Theme Packs',             icon: '🎨', component: ThemeEditor },
  { id: 'hero',            label: 'Home Photo',              icon: '🖼️', component: HeroEditor },
  { id: 'services',        label: 'Services Menu',           icon: '💅', component: ServicesEditor },
  { id: 'packages',        label: 'Packages',                icon: '📦', component: PackagesEditor },
  { id: 'bridal',          label: 'Bridal Studio',           icon: '💍', component: BridalEditor },
  { id: 'team',            label: 'Specialists & Team',      icon: '👥', component: TeamEditor },
  { id: 'transformations', label: 'Before & After',          icon: '✨', component: TransformationsEditor },
  { id: 'about',           label: 'About Sanctuary',         icon: '🌿', component: AboutEditor },
  { id: 'testimonials',    label: 'Client Reviews',          icon: '💬', component: TestimonialsEditor },
  { id: 'gallery',         label: 'Gallery Photos',          icon: '📷', component: GalleryEditor },
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
                : activeTab === 'hours'
                ? 'Set daily opening & closing times, booking rules, and cancellation policies'
                : activeTab === 'hero'
                ? 'Update your large homepage photo, headline words, and welcoming message'
                : activeTab === 'services'
                ? 'Add, edit, or reorder all beauty, hair, skin, and spa treatments'
                : activeTab === 'packages'
                ? 'Bundle multiple services together into special discount packages'
                : activeTab === 'bridal'
                ? 'Customize your bridal studio showcase, perks checklist, and WhatsApp inquiry form'
                : activeTab === 'team'
                ? 'Introduce your stylists, nail artists, and beauty specialists'
                : activeTab === 'transformations'
                ? 'Add interactive before & after sliding photo comparisons'
                : activeTab === 'testimonials'
                ? 'Showcase client reviews, star ratings, and real feedback'
                : activeTab === 'about'
                ? 'Tell your salon story, highlight key stats, and showcase interior features'
                : activeTab === 'gallery'
                ? 'Upload and manage your photo portfolio'
                : 'Changes are reflected live on your site immediately'}
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
