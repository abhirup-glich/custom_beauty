import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData } from '../../lib/salonData';
import { SaveBar } from '../AdminComponents';

export const THEME_PACKS = [
  {
    id: 'rose-champagne',
    name: 'Blush & Cashmere',
    subtitle: 'Warm Romantic Luxury',
    bestFor: 'Bridal Salons, Aesthetic Clinics & Skin Spas',
    icon: '🌸',
    theme: {
      background: '#FAF7F2',
      backgroundAlt: '#F3EDE4',
      navbarBg: '#FAF7F2',
      navbarText: '#241D1B',
      accent: '#B88782',
      accentDark: '#9A6D68',
      dark: '#241D1B',
      textBody: '#4A3F3C',
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
    },
    swatches: [
      { color: '#FAF7F2', label: 'Background' },
      { color: '#F3EDE4', label: 'Surface' },
      { color: '#B88782', label: 'Rose Accent' },
      { color: '#241D1B', label: 'Dark Text' },
    ],
  },
  {
    id: 'noir-gold',
    name: 'Noir & 24K Gold',
    subtitle: 'Opulent High-Fashion Dark',
    bestFor: 'Luxury Hair Studios, Celebrity Salons & VIP Lounges',
    icon: '✨',
    theme: {
      background: '#121110',
      backgroundAlt: '#1E1B19',
      navbarBg: '#121110',
      navbarText: '#F5F0EB',
      accent: '#D4AF37',
      accentDark: '#B89326',
      dark: '#FFFDF9',
      textBody: '#D1C6BA',
      headingFont: 'Cinzel',
      bodyFont: 'Outfit',
    },
    swatches: [
      { color: '#121110', label: 'Dark Onyx' },
      { color: '#1E1B19', label: 'Surface' },
      { color: '#D4AF37', label: '24K Gold' },
      { color: '#FFFDF9', label: 'Silk White' },
    ],
  },
  {
    id: 'emerald-sage',
    name: 'Royal Emerald & Sage',
    subtitle: 'Botanical Wellness & Spa',
    bestFor: 'Ayurvedic Centers, Organic Hair Care & Day Spas',
    icon: '🌿',
    theme: {
      background: '#F5F8F5',
      backgroundAlt: '#EBF2EB',
      navbarBg: '#F5F8F5',
      navbarText: '#152C1E',
      accent: '#2D6A4F',
      accentDark: '#1B4332',
      dark: '#112217',
      textBody: '#304738',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Plus Jakarta Sans',
    },
    swatches: [
      { color: '#F5F8F5', label: 'Mint Dew' },
      { color: '#EBF2EB', label: 'Surface' },
      { color: '#2D6A4F', label: 'Emerald' },
      { color: '#112217', label: 'Deep Forest' },
    ],
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    subtitle: 'Earthy Bohemian Glow',
    bestFor: 'Trendy Nail Bars, Tanning & Modern Beauty Studios',
    icon: '🏺',
    theme: {
      background: '#FCF8F5',
      backgroundAlt: '#F5ECE4',
      navbarBg: '#FCF8F5',
      navbarText: '#3B2017',
      accent: '#C86446',
      accentDark: '#A94F34',
      dark: '#351B12',
      textBody: '#593E35',
      headingFont: 'DM Serif Display',
      bodyFont: 'Inter',
    },
    swatches: [
      { color: '#FCF8F5', label: 'Sand Warm' },
      { color: '#F5ECE4', label: 'Surface' },
      { color: '#C86446', label: 'Terracotta' },
      { color: '#351B12', label: 'Chestnut' },
    ],
  },
  {
    id: 'amethyst-lilac',
    name: 'Amethyst & Lilac',
    subtitle: 'Chic Glamour & Modern Art',
    bestFor: 'Lash & Brow Bars, Makeup Artistry & Chic Salons',
    icon: '💜',
    theme: {
      background: '#FAF7FC',
      backgroundAlt: '#F1EBF8',
      navbarBg: '#FAF7FC',
      navbarText: '#281A38',
      accent: '#8B5CF6',
      accentDark: '#7C3AED',
      dark: '#221332',
      textBody: '#4E3C61',
      headingFont: 'Playfair Display',
      bodyFont: 'Poppins',
    },
    swatches: [
      { color: '#FAF7FC', label: 'Pale Lilac' },
      { color: '#F1EBF8', label: 'Surface' },
      { color: '#8B5CF6', label: 'Amethyst' },
      { color: '#221332', label: 'Plum Noir' },
    ],
  },
  {
    id: 'azure-ocean',
    name: 'Coastal Azure & Pearl',
    subtitle: 'Fresh Marine Serenity',
    bestFor: 'Hydra-Facial Clinics, Wellness Retreats & Medi-Spas',
    icon: '🌊',
    theme: {
      background: '#F3F7FA',
      backgroundAlt: '#E5EEF5',
      navbarBg: '#F3F7FA',
      navbarText: '#142938',
      accent: '#0284C7',
      accentDark: '#0369A1',
      dark: '#0F212E',
      textBody: '#2F4B5E',
      headingFont: 'Montserrat',
      bodyFont: 'Plus Jakarta Sans',
    },
    swatches: [
      { color: '#F3F7FA', label: 'Pearl Blue' },
      { color: '#E5EEF5', label: 'Surface' },
      { color: '#0284C7', label: 'Sky Azure' },
      { color: '#0F212E', label: 'Deep Ocean' },
    ],
  },
  {
    id: 'velvet-caramel',
    name: 'Velvet Cocoa & Caramel',
    subtitle: 'Rich Timeless Elegance',
    bestFor: 'Classic Hair Parlours, Blow Dry Bars & Unisex Salons',
    icon: '🍫',
    theme: {
      background: '#F9F6F0',
      backgroundAlt: '#F0E9DF',
      navbarBg: '#F9F6F0',
      navbarText: '#2B1D16',
      accent: '#A76543',
      accentDark: '#8C5134',
      dark: '#231711',
      textBody: '#4C3B32',
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
    },
    swatches: [
      { color: '#F9F6F0', label: 'Cream' },
      { color: '#F0E9DF', label: 'Surface' },
      { color: '#A76543', label: 'Caramel' },
      { color: '#231711', label: 'Espresso' },
    ],
  },
  {
    id: 'parisian-mono',
    name: 'Parisian Minimalist',
    subtitle: 'High-Fashion Monochrome',
    bestFor: 'Contemporary Hair Artists, Editorial Salons & Minimalist Studios',
    icon: '💎',
    theme: {
      background: '#FFFFFF',
      backgroundAlt: '#F4F4F6',
      navbarBg: '#FFFFFF',
      navbarText: '#111111',
      accent: '#18181B',
      accentDark: '#27272A',
      dark: '#09090B',
      textBody: '#52525B',
      headingFont: 'Montserrat',
      bodyFont: 'Inter',
    },
    swatches: [
      { color: '#FFFFFF', label: 'Studio White' },
      { color: '#F4F4F6', label: 'Surface' },
      { color: '#18181B', label: 'Carbon Black' },
      { color: '#52525B', label: 'Slate' },
    ],
  },
];

export default function ThemeEditor() {
  const { salonData, setSalonData } = useSalonData();
  const [selectedPackId, setSelectedPackId] = useState(THEME_PACKS[0].id);
  const [activeTheme, setActiveTheme] = useState(THEME_PACKS[0].theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
        if (data?.theme && typeof data.theme === 'object' && Object.keys(data.theme).length > 0) {
          setActiveTheme(data.theme);
          // Match selected pack if background & accent match
          const matched = THEME_PACKS.find(
            p => p.theme.background?.toLowerCase() === data.theme.background?.toLowerCase() &&
                 p.theme.accent?.toLowerCase() === data.theme.accent?.toLowerCase()
          );
          if (matched) setSelectedPackId(matched.id);
        } else if (salonData?.theme && typeof salonData.theme === 'object') {
          setActiveTheme(salonData.theme);
        }
      } catch (err) {
        console.error('Failed to load theme:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
  }, []);

  const selectPack = (pack) => {
    setSelectedPackId(pack.id);
    setActiveTheme(pack.theme);
  };

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('site_settings').upsert({
      id: 'main',
      theme: activeTheme,
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      setSaved(true);
      if (setSalonData) {
        setSalonData(prev => ({
          ...prev,
          theme: { ...(prev.theme || {}), ...activeTheme },
        }));
      }
      setTimeout(() => setSaved(false), 2500);
    } else {
      console.error('Failed to save theme pack:', error.message);
    }
    setSaving(false);
  }

  if (loading) return <div className="admin-tab-loading">Loading theme packs…</div>;

  const currentPack = THEME_PACKS.find(p => p.id === selectedPackId) || THEME_PACKS[0];

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ background: 'rgba(184,135,130,0.15)', borderColor: 'rgba(184,135,130,0.3)', color: 'var(--adm-text)' }}>
        🎨 Designer Theme Packs — 1-click curated color schemes & typography calibrated for luxury beauty parlours
      </div>

      {/* Live Simulation Preview */}
      <div className="admin-section-card" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 className="admin-section-title">
              👁️ Selected Theme Preview: <span style={{ color: 'var(--adm-accent)' }}>{currentPack.name}</span>
            </h3>
            <p className="admin-section-hint">
              Pairing: <strong>{activeTheme.headingFont}</strong> (Titles) + <strong>{activeTheme.bodyFont}</strong> (Body Text)
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={save}
            disabled={saving}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            {saving ? 'Applying…' : '✓ Apply This Theme Pack'}
          </button>
        </div>

        {/* Browser Mockup */}
        <div
          style={{
            marginTop: '14px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: activeTheme.background,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            transition: 'background-color 0.35s ease',
          }}
        >
          {/* Mock Navbar */}
          <div
            style={{
              padding: '14px 22px',
              backgroundColor: activeTheme.navbarBg,
              color: activeTheme.navbarText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: activeTheme.accent, fontSize: '18px' }}>{currentPack.icon}</span>
              <span
                style={{
                  fontFamily: `'${activeTheme.headingFont}', serif`,
                  fontWeight: 700,
                  fontSize: '17px',
                  letterSpacing: '-0.01em',
                }}
              >
                {salonData?.name || 'Auréa Beauty'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: `'${activeTheme.bodyFont}', sans-serif`,
              }}
            >
              <span>Services</span>
              <span>Packages</span>
              <span>About</span>
              <span
                style={{
                  backgroundColor: activeTheme.accent,
                  color: activeTheme.background?.toLowerCase() === '#121110' ? '#111' : '#FFFFFF',
                  padding: '7px 16px',
                  borderRadius: '24px',
                  fontSize: '11px',
                  fontWeight: 600,
                  boxShadow: `0 3px 12px ${activeTheme.accent}33`,
                }}
              >
                Book Appointment
              </span>
            </div>
          </div>

          {/* Mock Hero Showcase */}
          <div style={{ padding: '34px 24px', textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '30px',
                backgroundColor: activeTheme.backgroundAlt,
                color: activeTheme.accent,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {currentPack.icon} {currentPack.subtitle}
            </span>

            <h2
              style={{
                fontFamily: `'${activeTheme.headingFont}', serif`,
                color: activeTheme.dark,
                fontSize: '26px',
                fontWeight: 700,
                margin: '0 0 10px 0',
                lineHeight: 1.25,
              }}
            >
              Where Beauty Meets Pure Confidence
            </h2>

            <p
              style={{
                fontFamily: `'${activeTheme.bodyFont}', sans-serif`,
                color: activeTheme.textBody,
                fontSize: '13px',
                maxWidth: '460px',
                margin: '0 auto 20px auto',
                lineHeight: 1.6,
              }}
            >
              Indulge in signature hair spa, luxury skincare rituals, and personalized bridal transformations.
            </p>

            {/* Mock Card Preview */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: activeTheme.backgroundAlt,
                padding: '12px 20px',
                borderRadius: '14px',
                border: '1px solid rgba(0,0,0,0.05)',
                margin: '0 auto 16px auto',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: activeTheme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>
                ✦
              </div>
              <div>
                <div style={{ fontFamily: `'${activeTheme.headingFont}', serif`, fontSize: '13px', fontWeight: 600, color: activeTheme.dark }}>
                  Sample Service Card
                </div>
                <div style={{ fontFamily: `'${activeTheme.bodyFont}', sans-serif`, fontSize: '11px', color: activeTheme.textBody }}>
                  Demonstrating surface & card contrast
                </div>
              </div>
              <span style={{ fontFamily: `'${activeTheme.bodyFont}', sans-serif`, fontWeight: 700, color: activeTheme.accent, fontSize: '13px' }}>
                ₹1,499
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Theme Packs */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📦 Choose a Theme Pack</h3>
        <p className="admin-section-hint">
          Click any theme pack below to preview it. Click "Apply This Theme Pack" to save your selection.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            marginTop: '12px',
          }}
        >
          {THEME_PACKS.map(pack => {
            const isSelected = selectedPackId === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => selectPack(pack)}
                style={{
                  position: 'relative',
                  padding: '20px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  background: 'var(--adm-surface-2)',
                  border: isSelected
                    ? '2px solid var(--adm-accent)'
                    : '1px solid var(--adm-border)',
                  boxShadow: isSelected ? '0 0 20px var(--adm-accent-glow)' : 'none',
                  transition: 'all 0.22s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{pack.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--adm-text)', margin: 0 }}>
                        {pack.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--adm-accent)', margin: '2px 0 0 0', fontWeight: 500 }}>
                        {pack.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'var(--adm-accent)',
                        color: '#fff',
                      }}
                    >
                      ✓ Selected
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--adm-text-3)',
                        border: '1px solid var(--adm-border)',
                      }}
                    >
                      Select
                    </span>
                  )}
                </div>

                {/* Best For Tag */}
                <div style={{ fontSize: '11px', color: 'var(--adm-text-2)', background: 'var(--adm-surface-3)', padding: '6px 10px', borderRadius: '6px', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--adm-text)' }}>Ideal for:</strong> {pack.bestFor}
                </div>

                {/* Color Swatch Bar */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--adm-text-3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Color Palette
                  </div>
                  <div style={{ display: 'flex', height: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {pack.swatches.map((swatch, idx) => (
                      <div
                        key={idx}
                        title={`${swatch.label}: ${swatch.color}`}
                        style={{
                          flex: 1,
                          backgroundColor: swatch.color,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--adm-text-3)', paddingTop: '6px', borderTop: '1px solid var(--adm-border)' }}>
                  <span>Heading: <strong style={{ color: 'var(--adm-text)' }}>{pack.theme.headingFont}</strong></span>
                  <span>Body: <strong style={{ color: 'var(--adm-text)' }}>{pack.theme.bodyFont}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SaveBar
        onSave={save}
        saving={saving}
        saved={saved}
        label={`Apply "${currentPack.name}" Pack to Website`}
      />
    </div>
  );
}
