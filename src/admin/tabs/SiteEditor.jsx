import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData, driveUrl, applyFavicon } from '../../lib/salonData';
import { ImagePreview, SaveBar } from '../AdminComponents';

const DEFAULT = {
  name: '',
  logo_url: '',
  favicon_url: '/favicon.svg',
  phone: '',
  email: '',
  address: '',
  map_url: '',
  tagline: '',
  description: '',
  whatsapp: '',
  currency: 'INR',
  locale: 'en-IN',
  rating: '',
  review_count: '',
  instagram: '',
  facebook: '',
};

export default function SiteEditor({ isSuperAdmin }) {
  const { setSalonData } = useSalonData();
  const [data, setData] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 'main').single()
      .then(({ data }) => {
        if (data) {
          setData({ ...DEFAULT, ...data });
          if (data.favicon_url) {
            applyFavicon(data.favicon_url);
          }
        }
        setLoading(false);
      });
  }, []);

  function handleFaviconChange(newUrl) {
    setData(d => ({ ...d, favicon_url: newUrl }));
    applyFavicon(newUrl);
  }

  function handleFaviconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      handleFaviconChange(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    const cleanedLogo = driveUrl(data.logo_url);
    const cleanedFavicon = driveUrl(data.favicon_url);
    const payload = {
      ...data,
      logo_url: cleanedLogo,
      favicon_url: cleanedFavicon,
      rating: data.rating ? Number(data.rating) : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('site_settings').upsert({
      id: 'main',
      ...payload,
    });

    if (!error) {
      setSaved(true);
      if (cleanedFavicon) {
        applyFavicon(cleanedFavicon);
      }
      if (setSalonData) {
        setSalonData(prev => ({
          ...prev,
          name: data.name || prev.name,
          logo: cleanedLogo || prev.logo,
          favicon: cleanedFavicon || prev.favicon,
          tagline: data.tagline || prev.tagline,
          description: data.description || prev.description,
          phone: data.phone || prev.phone,
          whatsapp: data.whatsapp || prev.whatsapp,
          email: data.email || prev.email,
          currency: data.currency || prev.currency,
          locale: data.locale || prev.locale,
          address: { ...(prev.address || {}), full: data.address },
          rating: data.rating ? Number(data.rating) : prev.rating,
          reviewCount: data.review_count || prev.reviewCount,
          google: {
            ...(prev.google || {}),
            mapsUrl: data.map_url || prev.google?.mapsUrl,
          },
          social: {
            ...(prev.social || {}),
            ...(data.instagram && { instagram: data.instagram }),
            ...(data.facebook && { facebook: data.facebook }),
          },
        }));
      }
      setTimeout(() => setSaved(false), 2500);
    } else {
      console.error('Save error:', error.message);
    }
    setSaving(false);
  }

  const set = (key) => (e) => setData(d => ({ ...d, [key]: e.target.value }));

  if (loading) return <div className="admin-tab-loading">Loading site settings…</div>;

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ background: 'rgba(184,135,130,0.15)', borderColor: 'rgba(184,135,130,0.3)', color: 'var(--adm-text)' }}>
        ⚙️ Core Site Settings — Changes are reflected live across your website
      </div>

      {/* Identity */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">🏪 Parlor Identity</h3>
        <div className="admin-form-row">
          <div className="admin-form-group" style={{ flex: 2 }}>
            <label className="admin-label">Parlor / Site Name *</label>
            <input className="admin-input" value={data.name || ''} onChange={set('name')} placeholder="My Beautiful Parlor" id="site-name" />
          </div>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-label">Currency</label>
            <input className="admin-input" value={data.currency || 'INR'} onChange={set('currency')} placeholder="INR" />
          </div>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-label">Locale</label>
            <input className="admin-input" value={data.locale || 'en-IN'} onChange={set('locale')} placeholder="en-IN" />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Tagline</label>
            <input className="admin-input" value={data.tagline || ''} onChange={set('tagline')} placeholder="Beauty that feels like you." />
          </div>
        </div>
        <div className="admin-form-group">
          <label className="admin-label">Description (SEO)</label>
          <textarea className="admin-input admin-textarea" rows={3} value={data.description || ''} onChange={set('description')} placeholder="Personalized beauty treatments designed to make you feel your absolute best." />
        </div>
      </div>

      {/* Logo */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">🖼️ Logo</h3>
        <p className="admin-section-hint">Paste Google Drive link, public image URL, or local path (e.g. <code>/images/logo.png</code>)</p>
        <div className="admin-form-group">
          <label className="admin-label">Logo URL or Local Path</label>
          <input className="admin-input" type="text" value={data.logo_url || ''} onChange={set('logo_url')} placeholder="https://drive.google.com/... or /images/logo.png" id="site-logo-url" />
        </div>
        {data.logo_url && <ImagePreview src={driveUrl(data.logo_url)} label="Logo Preview" small />}
      </div>

      {/* Favicon */}
      <div className="admin-section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <h3 className="admin-section-title" style={{ margin: 0 }}>✨ Browser Favicon</h3>
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(212,168,67,0.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.3)', fontWeight: 600 }}>
            Tab Icon
          </span>
        </div>
        <p className="admin-section-hint">
          The icon shown on browser tabs and bookmarks. Paste an image URL, Google Drive link, local path (e.g. <code>/favicon.svg</code>), or pick a luxury preset below.
        </p>

        <div className="admin-form-group">
          <label className="admin-label">Favicon URL, Local Path, or Image File</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="admin-input"
              type="text"
              value={data.favicon_url || ''}
              onChange={(e) => handleFaviconChange(e.target.value)}
              placeholder="/favicon.svg, https://... or paste image data URL"
              id="site-favicon-url"
              style={{ flex: 1 }}
            />
            <label
              className="admin-btn admin-btn--secondary"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                padding: '0 0.85rem',
              }}
              title="Upload image from computer"
            >
              📁 Upload Icon
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
                style={{ display: 'none' }}
                onChange={handleFaviconUpload}
                id="site-favicon-file-input"
              />
            </label>
          </div>
        </div>

        {/* Preset quick picker */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--adm-text-2, rgba(255,255,255,0.7))', marginBottom: '0.5rem' }}>
            Instant Luxury Presets (Click to preview live in tab):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              {
                label: '✦ Gold Sparkle',
                url: '/favicon.svg',
              },
              {
                label: '🌸 Rose Pink',
                url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI0I4ODc4MiIvPjxwYXRoIGQ9Ik01MCAxOCBMNTQgNDQgTDgwIDUwIEw1NCA1NiBMNTAgODIgTDQ2IDU2IEwyMCA1MCBMNDYgNDQgWiIgZmlsbD0iI0ZBRjdGMiIvPjwvc3ZnPg==",
              },
              {
                label: '👑 Royal Crown',
                url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzI0MUQxQiIvPjxwYXRoIGQ9Ik0yNSA2NSBMMjggNDIgTDQyIDU0IEw1MCAzMiBMNTggNTQgTDcyIDQyIEw3NSA2NSBaIiBmaWxsPSIjZDRhODQzIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI2OSIgcj0iMyIgZmlsbD0iI2Q0YTg0MyIvPjwvc3ZnPg==",
              },
              {
                label: '💎 Diamond Glow',
                url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzkxN0Q2OCIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMjAgNzgsNDggNTAsODAgMjIsNDgiIGZpbGw9IiNGQUY3RjIiLz48cG9seWdvbiBwb2ludHM9IjUwLDIwIDY0LDQ4IDUwLDgwIDM2LDQ4IiBmaWxsPSIjZDRhODQzIi8+PC9zdmc+",
              },
              {
                label: '🌿 Botanical Spa',
                url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzJDM0UyRCIvPjxwYXRoIGQ9Ik01MCAyMCBDNjYgMjAgNzYgMzYgNzYgNTQgQzc2IDcyIDYyIDc4IDUwIDc4IEMzOCA3OCAyNCA3MiAyNCA1NCBDMjQgMzYgMzQgMjAgNTAgMjAgWiIgZmlsbD0iI0ZBRjdGMiIvPjxwYXRoIGQ9Ik01MCAyNiBMMTUwIDc0IiBzdHJva2U9IiMyQzNFMkQiIHN0cm9rZS13aWR0aD0iMy41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=",
              },
            ].map(preset => (
              <button
                key={preset.label}
                type="button"
                className="admin-btn admin-btn--secondary"
                style={{
                  fontSize: '0.74rem',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: data.favicon_url === preset.url ? 'rgba(212,168,67,0.22)' : 'rgba(255,255,255,0.06)',
                  borderColor: data.favicon_url === preset.url ? '#d4a843' : 'rgba(255,255,255,0.12)',
                }}
                onClick={() => handleFaviconChange(preset.url)}
                id={`favicon-preset-${preset.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <img src={driveUrl(preset.url)} alt="" style={{ width: 16, height: 16, borderRadius: '3px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Browser Tab Preview */}
        <div style={{ marginTop: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.35)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Browser Tab Simulation
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '7px 16px', borderRadius: '8px 8px 0 0', borderBottom: '2px solid var(--accent, #B88782)', maxWidth: '300px' }}>
            <img
              src={driveUrl(data.favicon_url) || '/favicon.svg'}
              alt="Favicon Preview"
              style={{ width: 16, height: 16, objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/favicon.svg'; }}
            />
            <span style={{ fontSize: '0.78rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.name || 'Auréa Beauty'} — Salon
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>×</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📞 Contact Details</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Phone</label>
            <input className="admin-input" value={data.phone || ''} onChange={set('phone')} placeholder="+91 98765 43210" id="site-phone" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">WhatsApp (number only)</label>
            <input className="admin-input" value={data.whatsapp || ''} onChange={set('whatsapp')} placeholder="919876543210" id="site-whatsapp" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input className="admin-input" type="email" value={data.email || ''} onChange={set('email')} placeholder="hello@parlor.com" id="site-email" />
          </div>
        </div>
      </div>

      {/* Address & Map */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📍 Address & Map</h3>
        <div className="admin-form-group">
          <label className="admin-label">Full Address</label>
          <textarea className="admin-input admin-textarea" rows={2} value={data.address || ''} onChange={set('address')} placeholder="42, Rose Lane, Bandra West, Mumbai - 400050" id="site-address" />
        </div>
        <div className="admin-form-group">
          <label className="admin-label">Google Maps Embed URL</label>
          <input className="admin-input" type="url" value={data.map_url || ''} onChange={set('map_url')} placeholder="https://maps.google.com/maps?q=..." id="site-map-url" />
          <p className="admin-section-hint">
            Go to Google Maps → find your location → Share → Embed a map → copy the <em>src</em> URL from the iframe code
          </p>
        </div>
        {data.map_url && (
          <div className="admin-map-preview">
            <iframe src={data.map_url} title="Map Preview" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">⭐ Rating</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Rating (e.g. 4.9)</label>
            <input className="admin-input" type="number" step="0.1" min="0" max="5" value={data.rating || ''} onChange={set('rating')} placeholder="4.9" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Review Count (text)</label>
            <input className="admin-input" value={data.review_count || ''} onChange={set('review_count')} placeholder="500+" />
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📱 Social Media</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Instagram URL</label>
            <input className="admin-input" type="url" value={data.instagram || ''} onChange={set('instagram')} placeholder="https://instagram.com/yourparlor" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Facebook URL</label>
            <input className="admin-input" type="url" value={data.facebook || ''} onChange={set('facebook')} placeholder="https://facebook.com/yourparlor" />
          </div>
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} saved={saved} label="Save Site Settings" />
    </div>
  );
}
