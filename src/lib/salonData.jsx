import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabase';
import salonDefault from 'virtual:salon';

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert Google Drive links, Dropbox, local public folder paths, or public URLs
 * into working direct-image URLs.
 */
export function driveUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();

  // Strip wrapping quotes if user pasted with quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');

  // 1. If Windows or absolute file path containing public/images or images
  const winMatch = cleaned.match(/(?:public[\\/])?images[\\/]([^\r\n"']+)/i);
  if (winMatch && (cleaned.includes('\\') || cleaned.startsWith('C:') || cleaned.startsWith('/Users'))) {
    return `/images/${winMatch[1].replace(/\\/g, '/')}`;
  }

  // 2. If starts with public/images/... or /public/images/...
  if (cleaned.startsWith('/public/images/')) {
    return cleaned.slice(7); // -> /images/...
  }
  if (cleaned.startsWith('public/images/')) {
    return '/' + cleaned.slice(7); // -> /images/...
  }

  // 3. If starts with images/... (missing leading slash)
  if (cleaned.startsWith('images/')) {
    return '/' + cleaned; // -> /images/...
  }

  // 4. Localhost URL cleanup
  if (cleaned.includes('/public/images/')) {
    return cleaned.replace('/public/images/', '/images/');
  }

  // 5. Google Drive share link parsing
  // Matches: /file/d/ID, id=ID, /d/ID
  const driveMatch = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                     cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                     cleaned.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (driveMatch && (cleaned.includes('drive.google.com') || cleaned.includes('docs.google.com') || cleaned.includes('googleusercontent.com'))) {
    const fileId = driveMatch[1];
    // Modern direct Google CDN image URL
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 6. Dropbox: convert share link to raw image stream
  if (cleaned.includes('dropbox.com')) {
    if (cleaned.includes('dl=0')) return cleaned.replace('dl=0', 'raw=1');
    if (!cleaned.includes('raw=1')) return cleaned + (cleaned.includes('?') ? '&raw=1' : '?raw=1');
    return cleaned;
  }

  // 7. Imgur direct image resolution
  const imgurMatch = cleaned.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/);
  if (imgurMatch) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return cleaned;
}

export const normalizeImageUrl = driveUrl;

/**
 * Robust cross-browser favicon updater.
 * Completely replaces all <link rel="icon"> tags in the DOM with proper MIME types.
 */
export function applyFavicon(rawUrl) {
  if (!rawUrl || typeof document === 'undefined') return;
  const url = driveUrl(rawUrl) || rawUrl;

  // 1. Remove all existing icon links to force Chrome/Edge/Firefox to re-render tab icon
  const existing = document.querySelectorAll("link[rel*='icon']");
  existing.forEach(el => el.parentNode && el.parentNode.removeChild(el));

  // 2. Determine MIME type
  let type = 'image/svg+xml';
  if (url.endsWith('.png') || url.startsWith('data:image/png')) {
    type = 'image/png';
  } else if (url.endsWith('.ico') || url.endsWith('.cur') || url.startsWith('data:image/x-icon')) {
    type = 'image/x-icon';
  } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    type = 'image/jpeg';
  }

  // 3. Create fresh link with type and href
  const link = document.createElement('link');
  link.id = 'app-favicon';
  link.rel = 'icon';
  link.type = type;
  link.href = url;
  document.head.appendChild(link);
}

// ── context ───────────────────────────────────────────────────────────────────

const SalonDataContext = createContext(null);

function mergeSalonData(siteSettings, heroSettings, aboutSettings, services, packages, gallery) {
  const base = { ...salonDefault };

  // Site settings override
  if (siteSettings) {
    if (siteSettings.name)        base.name = siteSettings.name;
    if (siteSettings.tagline)     base.tagline = siteSettings.tagline;
    if (siteSettings.description) base.description = siteSettings.description;
    if (siteSettings.phone)       base.phone = siteSettings.phone;
    if (siteSettings.whatsapp)    base.whatsapp = siteSettings.whatsapp;
    if (siteSettings.email)       base.email = siteSettings.email;
    if (siteSettings.address)     base.address = { full: siteSettings.address, ...base.address };
    if (siteSettings.currency)    base.currency = siteSettings.currency;
    if (siteSettings.locale)      base.locale = siteSettings.locale;
    if (siteSettings.rating)      base.rating = siteSettings.rating;
    if (siteSettings.review_count) base.reviewCount = siteSettings.review_count;
    if (siteSettings.instagram || siteSettings.facebook) {
      base.social = {
        ...(siteSettings.instagram && { instagram: siteSettings.instagram }),
        ...(siteSettings.facebook  && { facebook:  siteSettings.facebook  }),
      };
    }
    if (siteSettings.map_url) base.google = { ...base.google, mapsUrl: siteSettings.map_url };
    if (siteSettings.logo_url) base.logo = driveUrl(siteSettings.logo_url);
    if (siteSettings.favicon_url) base.favicon = driveUrl(siteSettings.favicon_url);
    if (siteSettings.google_calendar_id !== undefined) base.googleCalendarId = siteSettings.google_calendar_id;
    if (siteSettings.theme) {
      base.theme = {
        ...(base.theme || {}),
        ...siteSettings.theme,
      };
    }
  }

  // Hero
  if (heroSettings) {
    base.hero = {
      ...base.hero,
      ...(heroSettings.image_url    && { image: driveUrl(heroSettings.image_url) }),
      ...(heroSettings.rotating_words && { rotatingWords: heroSettings.rotating_words }),
      ...(heroSettings.second_line  && { secondLine: heroSettings.second_line }),
      ...(heroSettings.subtext      && { subtext: heroSettings.subtext }),
    };
  }

  // About
  if (aboutSettings) {
    base.about = {
      ...base.about,
      ...(aboutSettings.image_url   && { image: driveUrl(aboutSettings.image_url) }),
      ...(aboutSettings.label       && { label: aboutSettings.label }),
      ...(aboutSettings.heading     && { heading: aboutSettings.heading }),
      ...(aboutSettings.second_line && { secondLine: aboutSettings.second_line }),
      ...(aboutSettings.text        && { text: aboutSettings.text }),
      ...(aboutSettings.stats?.length > 0 && { stats: aboutSettings.stats }),
      ...(aboutSettings.features?.length > 0 && { features: aboutSettings.features }),
    };
  }

  // Services
  if (services?.length > 0) {
    const mapped = services
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(s => ({
        id: s.id,
        category: s.category,
        name: s.name,
        price: Number(s.price),
        duration: s.duration,
        description: s.description,
        benefits: s.benefits || [],
        popular: s.popular,
        image: driveUrl(s.image_url) || base.hero?.image,
      }));
    base.services = mapped;
    const cats = ['All', ...new Set(mapped.map(s => s.category))];
    base.serviceCategories = cats;
  }

  // Packages
  if (packages?.length > 0) {
    base.packages = packages
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : null,
        duration: p.duration,
        description: p.description,
        features: p.features || [],
        popular: p.popular,
        priceNote: p.price_note,
        savingsLabel: p.savings_label,
      }));
  }

  // Gallery
  if (gallery?.length > 0) {
    const mapped = gallery
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(g => ({
        id: g.id,
        src: driveUrl(g.src),
        alt: g.alt,
        category: g.category,
      }));
    base.gallery = mapped;
    const cats = ['All', ...new Set(mapped.map(g => g.category))];
    base.galleryCategories = cats;
  }

  return base;
}

export function SalonDataProvider({ children }) {
  const [salonData, setSalonData] = useState(salonDefault);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function fetchAll() {
      try {
        const [
          { data: site },
          { data: hero },
          { data: about },
          { data: services },
          { data: packages },
          { data: gallery },
        ] = await Promise.all([
          supabase.from('site_settings').select('*').eq('id', 'main').single(),
          supabase.from('hero_settings').select('*').eq('id', 'main').single(),
          supabase.from('about_settings').select('*').eq('id', 'main').single(),
          supabase.from('services').select('*').order('sort_order'),
          supabase.from('packages').select('*').order('sort_order'),
          supabase.from('gallery').select('*').order('sort_order'),
        ]);

        setSalonData(mergeSalonData(site, hero, about, services, packages, gallery));
      } catch (err) {
        console.error('Failed to load Supabase data, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // Dynamically apply custom theme colors, navbar styles, and typography
  useEffect(() => {
    if (!salonData?.theme) return;
    const t = salonData.theme;
    const root = document.documentElement;

    if (t.background) root.style.setProperty('--color-ivory', t.background);
    if (t.backgroundAlt) root.style.setProperty('--color-ivory-dark', t.backgroundAlt);
    if (t.accent) root.style.setProperty('--color-rose', t.accent);
    if (t.accentDark) root.style.setProperty('--color-rose-dark', t.accentDark);
    if (t.dark) root.style.setProperty('--color-espresso', t.dark);
    if (t.textBody) root.style.setProperty('--color-text-body', t.textBody);
    if (t.navbarBg) root.style.setProperty('--color-navbar-bg', t.navbarBg);
    if (t.navbarText) root.style.setProperty('--color-navbar-text', t.navbarText);
    if (t.headingFont) root.style.setProperty('--font-serif', `'${t.headingFont}', Georgia, serif`);
    if (t.bodyFont) root.style.setProperty('--font-sans', `'${t.bodyFont}', system-ui, sans-serif`);
  }, [salonData?.theme]);

  // Dynamically apply custom favicon in browser tab
  useEffect(() => {
    if (salonData?.favicon) {
      applyFavicon(salonData.favicon);
    }
  }, [salonData?.favicon]);

  return (
    <SalonDataContext.Provider value={{ salonData, loading, setSalonData }}>
      {children}
    </SalonDataContext.Provider>
  );
}

export function useSalonData() {
  const ctx = useContext(SalonDataContext);
  if (!ctx) throw new Error('useSalonData must be used within SalonDataProvider');
  return ctx;
}
