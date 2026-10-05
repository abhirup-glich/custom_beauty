import { createClient } from '@supabase/supabase-js';
import salonDefault from 'virtual:salon';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const SUPER_ADMIN_EMAIL = 'abhirupsarkar2jp@gmail.com';

// ── Mock Storage Engine (Used when Supabase is not configured) ─────────────
const STORAGE_PREFIX = 'aurea_salon_';

function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

function initMockData() {
  if (!getStorage('initialized', false)) {
    const defaultSite = {
      id: 'main',
      name: salonDefault.name || 'Auréa Beauty',
      tagline: salonDefault.tagline || 'Beauty that feels like you.',
      description: salonDefault.description || 'Personalized beauty treatments designed to make you feel your absolute best.',
      phone: salonDefault.phone || '+91 98765 43210',
      whatsapp: salonDefault.whatsapp || '919876543210',
      email: salonDefault.email || 'hello@aureabeauty.com',
      address: salonDefault.address?.full || '42, Rose Lane, Bandra West, Mumbai - 400050',
      map_url: salonDefault.google?.mapsUrl || '',
      logo_url: salonDefault.logo || '',
      favicon_url: salonDefault.favicon || '/favicon.svg',
      google_calendar_id: salonDefault.googleCalendarId || '',
      currency: salonDefault.currency || 'INR',
      locale: salonDefault.locale || 'en-IN',
      rating: salonDefault.rating || 4.9,
      review_count: salonDefault.reviewCount || '500+',
      instagram: salonDefault.social?.instagram || '',
      facebook: salonDefault.social?.facebook || '',
    };

    const defaultHero = {
      id: 'main',
      image_url: salonDefault.hero?.image || '/images/hero.jpg',
      rotating_words: salonDefault.hero?.rotatingWords || ['Glow', 'Radiance', 'Elegance', 'Serenity', 'Confidence'],
      second_line: salonDefault.hero?.secondLine || 'Your Confidence.',
      subtext: salonDefault.hero?.subtext || 'Professional beauty, hair & wellness services designed around you.',
    };

    const defaultAbout = {
      id: 'main',
      image_url: salonDefault.about?.image || '/images/salon-interior.jpg',
      label: 'Our Story',
      heading: 'Where Beauty',
      second_line: 'Meets Excellence.',
      text: salonDefault.description || 'We are passionate about making every client feel their absolute best.',
      stats: salonDefault.about?.stats || [],
      features: [],
    };

    const defaultServices = (salonDefault.services || []).map((s, idx) => ({
      id: 'srv-' + (idx + 1),
      category: s.category || 'Hair',
      name: s.name,
      price: s.price,
      duration: s.duration,
      description: s.description,
      benefits: s.benefits || [],
      popular: Boolean(s.popular),
      image_url: s.image || '',
      sort_order: idx,
    }));

    const defaultPackages = (salonDefault.packages || []).map((p, idx) => ({
      id: 'pkg-' + (idx + 1),
      name: p.name,
      price: p.price,
      original_price: p.originalPrice || null,
      duration: p.duration,
      description: p.description,
      features: p.features || [],
      popular: Boolean(p.popular),
      price_note: p.priceNote || '',
      savings_label: p.savingsLabel || '',
      sort_order: idx,
    }));

    const defaultGallery = (salonDefault.gallery || []).map((g, idx) => ({
      id: 'gal-' + (idx + 1),
      src: g.src,
      alt: g.alt,
      category: g.category || 'General',
      sort_order: idx,
    }));

    setStorage('site_settings', [defaultSite]);
    setStorage('hero_settings', [defaultHero]);
    setStorage('about_settings', [defaultAbout]);
    setStorage('services', defaultServices);
    setStorage('packages', defaultPackages);
    setStorage('gallery', defaultGallery);
    setStorage('initialized', true);
  }

  // Ensure bookings table exists in mock storage
  if (!getStorage('bookings', null)) {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const makeDate = (daysAhead) => {
      const d = new Date(today);
      d.setDate(today.getDate() + daysAhead);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const initialBookings = [
      {
        id: 'bkg-1',
        service_name: 'Signature Facial',
        service_price: 1499,
        duration: '60 min',
        professional_name: 'Priya Menon',
        booking_date: makeDate(1),
        booking_time: '11:00',
        customer_name: 'Ananya Sharma',
        customer_phone: '+91 98201 12345',
        customer_email: 'ananya@example.com',
        notes: 'First visit. Interested in skin hydration and glow treatments.',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
      {
        id: 'bkg-2',
        service_name: 'Precision Haircut & Blow Dry',
        service_price: 799,
        duration: '45 min',
        professional_name: 'Aarohi Sharma',
        booking_date: makeDate(2),
        booking_time: '14:30',
        customer_name: 'Rohan Mehta',
        customer_phone: '+91 98190 67890',
        customer_email: 'rohan.mehta@example.com',
        notes: 'Needs haircut and styling.',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
      {
        id: 'bkg-3',
        service_name: 'Bridal Makeup Consultation',
        service_price: 8999,
        duration: '150 min',
        professional_name: 'Kavya Nair',
        booking_date: makeDate(3),
        booking_time: '16:00',
        customer_name: 'Meera Kapoor',
        customer_phone: '+91 99300 54321',
        customer_email: 'meera.k@example.com',
        notes: 'Wedding next month, discussing bridal makeover package.',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];
    setStorage('bookings', initialBookings);
  }
}

export const ADMIN_USERS = (salonDefault.admins && salonDefault.admins.length > 0)
  ? salonDefault.admins
  : [
      {
        id: 'adm_7k9x2m41',
        email: 'admin_7k9x@parlor.com',
        password: 'P@ss!9x8K#2026',
        name: 'Admin 1',
        role: 'Salon Administrator',
      },
      {
        id: 'adm_3v8q1w95',
        email: 'admin_3v8q@parlor.com',
        password: 'W#7zL$2qM*2026',
        name: 'Admin 2',
        role: 'Salon Administrator',
      },
    ];

// Listeners for auth changes
const authListeners = new Set();

function createMockClient() {
  initMockData();

  return {
    isMock: true,

    auth: {
      async getSession() {
        const session = getStorage('mock_session', null);
        return { data: { session } };
      },
      async signInWithPassword({ email, password }) {
        if (!email) return { error: { message: 'Email or Admin ID is required' } };
        const cleanInput = email.trim().toLowerCase();
        const matchedAdmin = ADMIN_USERS.find(
          a => a.email.toLowerCase() === cleanInput || a.id.toLowerCase() === cleanInput
        );

        if (matchedAdmin) {
          if (password && password !== matchedAdmin.password) {
            return { error: { message: 'Incorrect password for this admin account.' } };
          }
        }

        const user = {
          id: matchedAdmin ? matchedAdmin.id : 'user-' + Date.now(),
          email: matchedAdmin ? matchedAdmin.email : email.trim(),
          name: matchedAdmin ? matchedAdmin.name : 'Salon Staff',
          role: matchedAdmin ? matchedAdmin.role : 'Salon Admin',
        };
        const session = {
          user,
          access_token: 'mock-token-' + Date.now(),
        };
        setStorage('mock_session', session);
        authListeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { session }, error: null };
      },
      async signOut() {
        setStorage('mock_session', null);
        authListeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      },
      onAuthStateChange(callback) {
        authListeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe() {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      async resetPasswordForEmail() {
        return { error: null };
      },
    },

    from(table) {
      let records = getStorage(table, []);
      let filterFn = null;
      let orderCol = null;
      let isAsc = true;
      let isSingle = false;

      const builder = {
        select(cols = '*') {
          return builder;
        },
        eq(col, val) {
          const prev = filterFn;
          filterFn = item => (prev ? prev(item) : true) && String(item[col]) === String(val);
          return builder;
        },
        order(col, opts = { ascending: true }) {
          orderCol = col;
          isAsc = opts.ascending !== false;
          return builder;
        },
        single() {
          isSingle = true;
          return builder;
        },
        then(resolve, reject) {
          const promise = new Promise((resFn, rejFn) => {
            try {
              let res = [...records];
              if (filterFn) res = res.filter(filterFn);
              if (orderCol) {
                res.sort((a, b) => {
                  const valA = a[orderCol] ?? 0;
                  const valB = b[orderCol] ?? 0;
                  return isAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
                });
              }
              if (isSingle) {
                resFn({ data: res[0] || null, error: null });
              } else {
                resFn({ data: res, error: null });
              }
            } catch (e) {
              rejFn(e);
            }
          });
          return promise.then(resolve, reject);
        },
        catch(reject) {
          return this.then(null, reject);
        },

        async insert(rowOrRows) {
          records = getStorage(table, []);
          const items = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
          const created = items.map(item => ({
            id: item.id || (table.slice(0, 3) + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
            created_at: new Date().toISOString(),
            ...item,
          }));
          records = [...records, ...created];
          setStorage(table, records);
          return { data: Array.isArray(rowOrRows) ? created : created[0], error: null };
        },

        async upsert(rowOrRows) {
          records = getStorage(table, []);
          const items = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
          items.forEach(item => {
            const idx = records.findIndex(r => r.id === item.id);
            if (idx >= 0) {
              records[idx] = { ...records[idx], ...item };
            } else {
              records.push({
                id: item.id || (table.slice(0, 3) + '-' + Date.now()),
                ...item,
              });
            }
          });
          setStorage(table, records);
          return { data: items, error: null };
        },

        update(fields) {
          return {
            async eq(col, val) {
              records = getStorage(table, []);
              records = records.map(r => String(r[col]) === String(val) ? { ...r, ...fields } : r);
              setStorage(table, records);
              return { error: null };
            },
          };
        },

        delete() {
          return {
            async eq(col, val) {
              records = getStorage(table, []);
              records = records.filter(r => String(r[col]) !== String(val));
              setStorage(table, records);
              return { error: null };
            },
          };
        },
      };

      return builder;
    },
  };
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();
