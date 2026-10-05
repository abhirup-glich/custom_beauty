// Reads salon.json (+ the optional salon.google.json cache written by fetch-google.mjs),
// validates it and resolves everything the site renders. Runs in Node at dev/build time;
// the browser only ever sees the resolved object via the `virtual:salon` module.

import fs from 'node:fs';
import path from 'node:path';
import { DAY_KEYS, groupHours } from '../src/lib/hours.js';

export const SALON_FILE = 'salon.json';
export const GOOGLE_FILE = 'salon.google.json';

const KNOWN_KEYS = [
  'name', 'tagline', 'description', 'siteUrl', 'google', 'phone', 'whatsapp', 'email', 'address',
  'hours', 'timezone', 'rating', 'reviewCount', 'social', 'currency', 'locale', 'theme', 'hero',
  'about', 'services', 'packages', 'team', 'testimonials', 'gallery', 'transformations', 'bridal',
  'cancellationPolicy', 'booking', 'seo', 'admins', 'favicon', 'googleCalendarId',
];

// Maps friendly theme names in salon.json to the CSS custom properties in src/index.css.
const THEME_VARS = {
  accent: '--color-rose',
  accentDark: '--color-rose-dark',
  dark: '--color-espresso',
  background: '--color-ivory',
  backgroundAlt: '--color-ivory-dark',
  soft: '--color-blush',
  gold: '--color-champagne',
};

// Stock images in public/images, used when a service has no photo of its own.
const CATEGORY_IMAGES = [
  [/hair|keratin|scalp/i, '/images/service-hair.jpg'],
  [/skin|facial|clean/i, '/images/service-facial.jpg'],
  [/nail|mani|pedi/i, '/images/service-nails.jpg'],
  [/makeup|bridal|party/i, '/images/service-bridal.jpg'],
  [/spa|massage|body|wax/i, '/images/service-spa.jpg'],
];
const DEFAULT_HERO = '/images/hero.jpg';
const DEFAULT_INTERIOR = '/images/salon-interior.jpg';

export class SalonConfigError extends Error {}

function fail(message) {
  throw new SalonConfigError(`salon.json → ${message}`);
}

export function readJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new SalonConfigError(`${path.basename(file)} is not valid JSON: ${err.message}`);
  }
}

// Identifies which Google listing a cache file belongs to, so switching salon.json to a
// new client never shows the previous client's Google data.
export function googleSourceKey(google) {
  if (!google?.placeId && !google?.mapsUrl && !google?.search) return null;
  return JSON.stringify([google.placeId || '', google.mapsUrl || '', google.search || '']);
}

export function loadSalon(root) {
  const manual = readJson(path.join(root, SALON_FILE));
  const googleFile = path.join(root, GOOGLE_FILE);
  const source = googleSourceKey(manual.google);
  let google = null;
  if (source && fs.existsSync(googleFile)) {
    const cached = readJson(googleFile);
    if (cached.source === source) google = cached;
    else console.warn(`[salon] ${GOOGLE_FILE} belongs to a different Google listing; ignoring it. Run "npm run fetch-google".`);
  }
  return resolveSalon(manual, google);
}

const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== '');
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const digits = (s) => String(s ?? '').replace(/\D/g, '');

function list(value, label) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail(`"${label}" must be a list: [ ... ]`);
  return value;
}

function requireString(obj, key, where) {
  if (typeof obj[key] !== 'string' || !obj[key].trim()) fail(`${where} needs a "${key}"`);
  return obj[key].trim();
}

function requireNumber(obj, key, where) {
  if (typeof obj[key] !== 'number' || !Number.isFinite(obj[key])) {
    fail(`${where} needs "${key}" as a plain number (e.g. 799, not "₹799")`);
  }
  return obj[key];
}

function uniqueIds(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) fail(`two entries in "${label}" share the id "${item.id}" — give them different names or ids`);
    seen.add(item.id);
  }
  return items;
}

// ── Opening hours: { "monday": "closed", "tuesday": "10:00-20:00", "saturday": "10:00-13:00, 14:00-20:00" }

function parseTime(text, where) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  const h = m && Number(m[1]);
  const min = m && Number(m[2]);
  if (!m || h > 24 || min > 59 || (h === 24 && min > 0)) {
    fail(`${where}: "${text.trim()}" is not a 24-hour time like "09:30" or "20:00"`);
  }
  return h * 60 + min;
}

function parseDay(value, where) {
  if (value === undefined || value === null || value === '') return [];
  if (typeof value !== 'string') fail(`${where} must be text like "10:00-20:00" or "closed"`);
  if (/^closed$/i.test(value.trim())) return [];
  return value.split(',').map((range) => {
    const parts = range.split('-');
    if (parts.length !== 2) fail(`${where}: "${range.trim()}" should look like "10:00-20:00"`);
    const start = parseTime(parts[0], where);
    const end = parseTime(parts[1], where);
    if (end <= start) fail(`${where}: closing time must be after opening time in "${range.trim()}"`);
    return [start, end];
  });
}

function parseHours(hours, label) {
  if (!hours) return null;
  if (typeof hours !== 'object' || Array.isArray(hours)) fail(`"${label}" must be an object with keys monday … sunday`);
  const byDay = {};
  for (const [key, value] of Object.entries(hours)) {
    if (key.startsWith('_')) continue;
    if (!DAY_KEYS.includes(key.toLowerCase())) fail(`"${label}" has an unknown day "${key}" (use monday, tuesday, …)`);
    byDay[key.toLowerCase()] = value;
  }
  return DAY_KEYS.map((day) => parseDay(byDay[day], `${label}.${day}`));
}

// ── Main resolver

export function resolveSalon(manual, google) {
  if (!manual || typeof manual !== 'object' || Array.isArray(manual)) fail('the file must contain a single { ... } object');
  for (const key of Object.keys(manual)) {
    if (!key.startsWith('_') && !KNOWN_KEYS.includes(key)) {
      console.warn(`[salon] Unknown key "${key}" in salon.json — check the spelling (it is being ignored).`);
    }
  }

  const g = google || {};
  const locale = manual.locale || 'en-IN';
  const currency = manual.currency || 'INR';
  try {
    new Intl.NumberFormat(locale, { style: 'currency', currency });
  } catch {
    fail(`"currency" (${currency}) or "locale" (${locale}) is not recognised — use codes like "INR" and "en-IN"`);
  }

  const name = pick(manual.name, g.name);
  if (!name) fail('add a "name", or a "google" listing so the name can be fetched');

  // Contact
  const phone = pick(manual.phone, g.phone);
  const whatsapp = digits(pick(manual.whatsapp, phone));
  if (!whatsapp) fail('add "whatsapp" (or "phone") — bookings and enquiries are sent to this number');
  if (whatsapp.length < 11 || whatsapp.length > 15) {
    fail(`"whatsapp" must include the country code, e.g. "919876543210" for an Indian number (got "${whatsapp}")`);
  }

  // Address
  const ma = manual.address || {};
  const ga = g.address || {};
  const address = {
    street: pick(ma.street, ga.street) || '',
    city: pick(ma.city, ga.city) || '',
    state: pick(ma.state, ga.state) || '',
    postalCode: pick(ma.postalCode, ga.postalCode) || '',
    country: pick(ma.country, ga.country) || '',
  };
  const builtFull = [address.street, address.city].filter(Boolean).join(', ') + (address.postalCode ? ` – ${address.postalCode}` : '');
  address.full = pick(ma.full, ma.street || ma.city ? builtFull : undefined, ga.full, builtFull) || '';

  // Google / maps links
  const placeId = pick(g.placeId, manual.google?.placeId) || null;
  const mapsQuery = encodeURIComponent([name, address.full].filter(Boolean).join(', '));
  const mapsUrl = pick(
    g.mapsUrl,
    manual.google?.mapsUrl,
    placeId ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}` : undefined,
    `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
  );
  const reviewUrl = placeId ? `https://search.google.com/local/writereview?placeid=${placeId}` : null;

  // Hours
  const hours = parseHours(manual.hours, 'hours') ?? parseHours(g.hours, 'google hours');
  const timezone = pick(manual.timezone, g.timezone) || null;
  if (timezone) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    } catch {
      fail(`"timezone" "${timezone}" is not a valid time zone (e.g. "Asia/Kolkata")`);
    }
  }

  // Rating
  const ratingSource = manual.rating != null ? 'manual' : g.rating != null ? 'google' : null;
  const rating = ratingSource === 'manual' ? Number(manual.rating) : ratingSource === 'google' ? g.rating : null;
  if (rating !== null && !(rating > 0 && rating <= 5)) fail('"rating" must be a number between 1 and 5');
  const rawReviewCount = manual.rating != null ? manual.reviewCount : pick(manual.reviewCount, g.reviewCount);
  const reviewCount = typeof rawReviewCount === 'number' ? rawReviewCount.toLocaleString(locale) : rawReviewCount || null;

  // Services
  const services = uniqueIds(list(manual.services, 'services').map((s, i) => {
    const where = `services[${i}]`;
    const serviceName = requireString(s, 'name', where);
    const category = (s.category || 'Other').trim();
    const fallbackImage = CATEGORY_IMAGES.find(([re]) => re.test(`${category} ${serviceName}`))?.[1] || DEFAULT_HERO;
    return {
      id: s.id || slug(serviceName),
      name: serviceName,
      category,
      description: s.description || '',
      price: requireNumber(s, 'price', where),
      duration: s.duration || '',
      image: s.image || fallbackImage,
      benefits: list(s.benefits, `${where}.benefits`),
      popular: Boolean(s.popular),
    };
  }), 'services');
  if (!services.length) fail('add at least one entry to "services" — customers pick one when booking');

  const packages = uniqueIds(list(manual.packages, 'packages').map((p, i) => {
    const where = `packages[${i}]`;
    const packageName = requireString(p, 'name', where);
    return {
      id: p.id || slug(packageName),
      name: packageName,
      price: requireNumber(p, 'price', where),
      originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : null,
      priceNote: p.priceNote || '',
      savingsLabel: p.savingsLabel || '',
      description: p.description || '',
      duration: p.duration || '',
      features: list(p.features, `${where}.features`),
      popular: Boolean(p.popular),
    };
  }), 'packages');

  const team = [];
  const testimonials = [];
  const testimonialsSource = null;

  // Gallery: your own list wins; otherwise photos downloaded from the Google listing.
  const manualGallery = list(manual.gallery, 'gallery').map((img, i) => ({
    src: requireString(img, 'src', `gallery[${i}]`),
    alt: img.alt || name,
    category: img.category || 'Salon',
    credit: img.credit || null,
  }));
  const googlePhotos = (g.photos || []).map((p) => ({ src: p.src, alt: `${name}`, category: 'Salon', credit: p.credit ? `${p.credit} via Google` : 'Google' }));
  const gallery = manualGallery.length ? manualGallery : googlePhotos;

  const transformationItems = list(manual.transformations, 'transformations').map((t, i) => {
    const where = `transformations[${i}]`;
    return {
      id: `t-${i}`,
      category: t.category || 'Results',
      label: t.label || '',
      before: requireString(t, 'before', where),
      after: requireString(t, 'after', where),
      beforeAlt: t.beforeAlt || `Before: ${t.label || ''}`.trim(),
      afterAlt: t.afterAlt || `After: ${t.label || ''}`.trim(),
    };
  });

  const bridalInput = manual.bridal === true ? {} : manual.bridal;
  const bridal = bridalInput && typeof bridalInput === 'object' ? {
    image: bridalInput.image || '/images/service-bridal.jpg',
    heading: bridalInput.heading || 'Your big day deserves',
    secondLine: bridalInput.secondLine || 'your best version.',
    text: bridalInput.text || "From skin prep trials to the final look — we're with you every step of the journey to your most beautiful self.",
    points: list(bridalInput.points, 'bridal.points').length ? bridalInput.points : ['Bridal Makeup', 'Hair Styling', 'Skin Prep', 'Trial Session'],
    eventTypes: list(bridalInput.eventTypes, 'bridal.eventTypes').length ? bridalInput.eventTypes : ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Sangeet'],
    budgetOptions: list(bridalInput.budgetOptions, 'bridal.budgetOptions'),
  } : null;

  const heroImage = pick(manual.hero?.image, googlePhotos[0]?.src, DEFAULT_HERO);
  const hero = {
    image: heroImage,
    rotatingWords: list(manual.hero?.rotatingWords, 'hero.rotatingWords').length
      ? manual.hero.rotatingWords
      : ['Glow', 'Radiance', 'Elegance', 'Serenity', 'Confidence'],
    secondLine: manual.hero?.secondLine || 'Your Confidence.',
    subtext: manual.hero?.subtext || 'Professional beauty, hair & wellness services designed around you.',
  };

  const aboutIn = manual.about || {};
  const defaultStats = [
    { value: services.length, suffix: '', label: 'Expert Services' },
    typeof rawReviewCount === 'number' && { value: rawReviewCount, suffix: '+', label: ratingSource === 'google' ? 'Google Reviews' : 'Happy Reviews' },
    rating && { value: rating, suffix: '★', label: ratingSource === 'google' ? 'Google Rating' : 'Average Rating' },
  ].filter(Boolean);
  const about = {
    image: pick(aboutIn.image, googlePhotos[1]?.src, DEFAULT_INTERIOR),
    label: aboutIn.label || `The ${name} Experience`,
    heading: aboutIn.heading || 'More than a salon.',
    secondLine: aboutIn.secondLine || "It's your time.",
    text: aboutIn.text || 'Step away from the noise and into a space designed entirely around you.',
    stats: list(aboutIn.stats, 'about.stats').length
      ? aboutIn.stats.map((s, i) => ({ value: requireNumber(s, 'value', `about.stats[${i}]`), suffix: s.suffix || '', label: s.label || '' }))
      : defaultStats,
    features: list(aboutIn.features, 'about.features').length ? aboutIn.features : [
      { title: 'Personalized Consultation', desc: 'Every visit begins with understanding your unique beauty goals and lifestyle.' },
      { title: 'Premium Products', desc: 'We use only the finest professional-grade skincare, haircare and cosmetics.' },
      { title: 'Expert Professionals', desc: 'Our certified specialists bring years of training and a genuine passion for their craft.' },
      { title: 'Relaxing Sanctuary', desc: 'Step into a space designed for calm, comfort, and total confidence.' },
    ],
  };

  const theme = {};
  for (const [key, value] of Object.entries(manual.theme || {})) {
    if (key.startsWith('_')) continue;
    if (!THEME_VARS[key]) fail(`"theme.${key}" is not supported — use one of: ${Object.keys(THEME_VARS).join(', ')}`);
    if (typeof value !== 'string' || /[;{}<>]/.test(value)) fail(`"theme.${key}" must be a colour like "#B88782"`);
    theme[THEME_VARS[key]] = value;
  }

  const social = {};
  for (const [key, value] of Object.entries(manual.social || {})) {
    if (value && !key.startsWith('_')) social[key] = value;
  }

  const description = pick(manual.description, g.description) ||
    `${name} — beauty, hair & wellness services${address.city ? ` in ${address.city}` : ''}.`;
  const siteUrl = (manual.siteUrl || '').replace(/\/+$/, '');

  return {
    name,
    tagline: manual.tagline || 'Beauty that feels like you.',
    description,
    siteUrl,
    phone: phone || `+${whatsapp}`,
    whatsapp,
    email: manual.email || '',
    address,
    placeId,
    mapsUrl,
    reviewUrl,
    hours,
    hoursDisplay: hours ? groupHours(hours) : [],
    timezone,
    rating,
    reviewCount,
    reviewCountNumber: typeof rawReviewCount === 'number' ? rawReviewCount : null,
    ratingSource,
    social,
    currency,
    locale,
    theme,
    hero,
    about,
    services,
    serviceCategories: ['All', ...new Set(services.map((s) => s.category))],
    packages,
    team,
    testimonials,
    testimonialsSource,
    gallery,
    galleryCategories: ['All', ...new Set(gallery.map((img) => img.category))],
    transformations: {
      categories: [...new Set(transformationItems.map((t) => t.category))],
      items: transformationItems,
    },
    bridal,
    admins: manual.admins || [],
    favicon: manual.favicon || '/favicon.svg',
    googleCalendarId: manual.googleCalendarId || '',
    cancellationPolicy: manual.cancellationPolicy || '',
    booking: {
      daysAhead: manual.booking?.daysAhead ?? 14,
      slotMinutes: manual.booking?.slotMinutes ?? 60,
    },
    seo: {
      title: manual.seo?.title || `${name} — Beauty Salon${address.city ? ` in ${address.city}` : ''}`,
      description: manual.seo?.description || description,
      keywords: manual.seo?.keywords || ['beauty salon', 'beauty parlour', 'hair', 'facial', 'makeup', address.city].filter(Boolean).join(', '),
      image: heroImage,
    },
  };
}
