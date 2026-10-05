// Pulls the salon's public Google Business listing (name, address, phone, hours, rating,
// reviews, photos) via the Places API (New) and caches it in salon.google.json.
//
//   npm run fetch-google   → always re-fetches (fails loudly on errors)
//   npm run build          → runs this first; only fetches if there is no matching cache yet,
//                            and never fails the build (falls back to salon.json only)
//
// Needs GOOGLE_PLACES_API_KEY in the environment or in a local .env file.

import fs from 'node:fs';
import path from 'node:path';
import { readJson, googleSourceKey, SALON_FILE, GOOGLE_FILE } from './salon-data.mjs';
import { DAY_KEYS } from '../src/lib/hours.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_FILE = path.join(ROOT, GOOGLE_FILE);
const PHOTO_DIR = path.join(ROOT, 'public', 'google-photos');
const API = 'https://places.googleapis.com/v1';
const DETAIL_FIELDS = [
  'id', 'displayName', 'formattedAddress', 'addressComponents', 'internationalPhoneNumber',
  'nationalPhoneNumber', 'websiteUri', 'regularOpeningHours', 'timeZone', 'rating',
  'userRatingCount', 'reviews', 'photos', 'googleMapsUri', 'editorialSummary',
].join(',');

const refresh = process.argv.includes('--refresh');
const log = (msg) => console.log(`[google] ${msg}`);
const warn = (msg) => console.warn(`[google] ${msg}`);

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // No .env file — rely on the real environment (e.g. the hosting platform's settings).
}
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

async function api(pathname, { method = 'GET', body, fieldMask }) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    body: body && JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': fieldMask },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message || `${res.status} ${res.statusText}`);
  return json;
}

// Accepts full Google Maps URLs as well as short maps.app.goo.gl share links.
async function parseMapsUrl(url) {
  let finalUrl = url;
  if (!/google\.[a-z.]+\/maps/.test(url)) {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
    finalUrl = res.url;
  }
  let parsed = new URL(finalUrl);
  if (parsed.hostname.startsWith('consent.')) parsed = new URL(parsed.searchParams.get('continue') || finalUrl);
  const href = parsed.href;
  const placeName = /\/maps\/place\/([^/@]+)/.exec(href)?.[1];
  const coords = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(href) || /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(href);
  return {
    placeId: parsed.searchParams.get('query_place_id'),
    name: placeName ? decodeURIComponent(placeName.replace(/\+/g, ' ')) : parsed.searchParams.get('q') || parsed.searchParams.get('query'),
    lat: coords ? Number(coords[1]) : null,
    lng: coords ? Number(coords[2]) : null,
  };
}

async function resolvePlaceId(google, fallbackName) {
  if (google.placeId) return google.placeId;
  let query = google.search;
  let locationBias;
  if (google.mapsUrl) {
    const info = await parseMapsUrl(google.mapsUrl);
    if (info.placeId) return info.placeId;
    query = query || info.name;
    if (info.lat !== null) locationBias = { circle: { center: { latitude: info.lat, longitude: info.lng }, radius: 500 } };
  }
  query = query || fallbackName;
  if (!query) throw new Error('add "google.search" or "google.placeId" to salon.json so the listing can be found');

  const { places } = await api('/places:searchText', {
    method: 'POST',
    body: { textQuery: query, locationBias },
    fieldMask: 'places.id,places.displayName,places.formattedAddress',
  });
  const hit = places?.[0];
  if (!hit) throw new Error(`Google found no place for "${query}"`);
  log(`Matched "${hit.displayName?.text}" — ${hit.formattedAddress}`);
  log(`Tip: add  "placeId": "${hit.id}"  under "google" in salon.json to lock in this exact listing.`);
  return hit.id;
}

async function downloadPhotos(photos, max) {
  fs.rmSync(PHOTO_DIR, { recursive: true, force: true });
  if (!max || !photos.length) return [];
  fs.mkdirSync(PHOTO_DIR, { recursive: true });
  const saved = [];
  for (const photo of photos.slice(0, max)) {
    const res = await fetch(`${API}/${photo.name}/media?maxWidthPx=1600&key=${apiKey}`);
    if (!res.ok) {
      warn(`Skipped a photo (${res.status})`);
      continue;
    }
    const ext = (res.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg';
    const file = `photo-${saved.length + 1}.${ext}`;
    fs.writeFileSync(path.join(PHOTO_DIR, file), Buffer.from(await res.arrayBuffer()));
    saved.push({ src: `/google-photos/${file}`, credit: photo.authorAttributions?.[0]?.displayName || null });
  }
  return saved;
}

// Converts Google's periods into the same "10:00-20:00" text format salon.json uses.
function periodsToHours(periods) {
  if (!periods?.length) return null;
  if (periods.length === 1 && !periods[0].close) {
    return Object.fromEntries(DAY_KEYS.map((day) => [day, '00:00-24:00']));
  }
  const hhmm = (h = 0, m = 0) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const byDay = DAY_KEYS.map(() => []);
  for (const { open, close } of periods) {
    const day = open.day ?? 0;
    const end = close && (close.day ?? 0) === day ? hhmm(close.hour, close.minute) : '24:00';
    byDay[day].push(`${hhmm(open.hour, open.minute)}-${end}`);
  }
  return Object.fromEntries(DAY_KEYS.map((day, i) => [day, byDay[i].length ? byDay[i].join(', ') : 'closed']));
}

function toSalonData(place, photos) {
  const part = (type, key = 'longText') => place.addressComponents?.find((c) => c.types?.includes(type))?.[key];
  const streetParts = ['premise', 'street_number', 'route', 'sublocality_level_2', 'sublocality_level_1'].map((t) => part(t));
  return {
    placeId: place.id,
    name: place.displayName?.text,
    phone: place.internationalPhoneNumber || place.nationalPhoneNumber,
    website: place.websiteUri,
    description: place.editorialSummary?.text,
    address: {
      street: [...new Set(streetParts.filter(Boolean))].join(', '),
      city: part('locality') || part('administrative_area_level_2'),
      state: part('administrative_area_level_1'),
      postalCode: part('postal_code'),
      country: part('country', 'shortText'),
      full: place.formattedAddress,
    },
    hours: periodsToHours(place.regularOpeningHours?.periods),
    timezone: place.timeZone?.id,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    mapsUrl: place.googleMapsUri,
    reviews: (place.reviews || []).map((r) => ({
      name: r.authorAttribution?.displayName,
      rating: r.rating,
      text: r.text?.text || r.originalText?.text,
      when: r.relativePublishTimeDescription,
    })),
    photos,
  };
}

async function main() {
  const salon = readJson(path.join(ROOT, SALON_FILE));
  const source = googleSourceKey(salon.google);
  if (!source) {
    log('No "google" listing in salon.json — skipping.');
    return;
  }
  const cached = fs.existsSync(CACHE_FILE) ? readJson(CACHE_FILE) : null;
  const cacheMatches = cached?.source === source;
  if (cacheMatches && !refresh) {
    log(`Using saved Google data from ${cached.fetchedAt}. Run "npm run fetch-google" to refresh it.`);
    return;
  }
  if (!apiKey) {
    const msg = 'GOOGLE_PLACES_API_KEY is not set, so nothing was fetched from Google.';
    if (refresh) throw new Error(msg);
    warn(`${msg} The site will use ${cacheMatches ? 'the saved Google data' : 'only what is in salon.json'}.`);
    return;
  }

  const placeId = await resolvePlaceId(salon.google, salon.name);
  const place = await api(`/places/${encodeURIComponent(placeId)}`, { fieldMask: DETAIL_FIELDS });
  const photos = await downloadPhotos(place.photos || [], salon.google.maxPhotos ?? 8);
  const data = { source, fetchedAt: new Date().toISOString(), ...toSalonData(place, photos) };
  fs.writeFileSync(CACHE_FILE, `${JSON.stringify(data, null, 2)}\n`);
  log(`Saved "${data.name}" (${data.reviews.length} reviews, ${photos.length} photos) to ${GOOGLE_FILE}.`);
}

main().catch((err) => {
  warn(`Could not fetch Google data: ${err.message}`);
  if (refresh) process.exitCode = 1;
  else warn('Continuing the build with the existing data.');
});
