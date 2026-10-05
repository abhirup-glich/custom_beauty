# Beauty Salon Website Template

A ready-to-sell website for beauty parlours and salons. Everything about the salon is set in **one file**, `salon.json`. Change that file, push to GitHub, and Vercel, Netlify or Cloudflare Pages builds the site. There is no admin panel, database or server.

- Bookings and bridal enquiries go to the salon's **WhatsApp** as a pre-filled message.
- If you add the salon's **Google listing**, its name, address, phone, hours, rating, reviews and photos are pulled from Google automatically.
- Team section has been removed per request.

## Admin & Super Admin Panel

Access the management panel at `/admin` or `/superadmin` (e.g. `http://localhost:5173/admin`).

### Unified Admin Capabilities
Anyone who logs in gets full access to all parlor controls:
- **Appointments & Google Calendar:** View all client bookings, filter by status (Confirmed, Pending, Completed, Cancelled), add walk-in appointments, 1-click sync/open in Google Calendar, and live embedded salon Google Calendar schedule view.
- **Site Details:** Parlor name, logo, custom browser favicon, phone, WhatsApp number, email, address, Google Maps embed, currency, ratings, and social links.
- **Theme & Colors:** Customize page background, navbar background, navbar text, buttons, body text, heading colors, and typography fonts with instant live preview and 1-click luxury palettes.
- **Home Screen Photo:** Change hero image, update headlines and rotating words.
- **Services:** Add, edit, remove services, prices, durations, categories, benefits, popular tags.
- **Packages:** Add, edit, remove service packages, pricing, durations, features.
- **About Section:** Change story image, headings, description, and stats.
- **Gallery:** Add, remove, categorize salon gallery images.

### 3. Google Drive as Database for Media
To use photos or logos hosted on Google Drive:
1. Upload your photo or logo to your Google Drive.
2. Right click → **Share** → under General access, select **"Anyone with the link"**.
3. Copy the link (e.g., `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`).
4. Paste it directly into any image field in the Admin panel. The system automatically converts it to a direct viewing image stream.

### 4. Supabase Setup (Free Tier)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `supabase-setup.sql`, then click **Run**.
3. In Supabase, go to **Authentication** → **Users** → **Add user** to create your logins:
   - For Super Admin: Create a user with email `abhirupsarkar2jp@gmail.com`.
   - For Parlor Admin 1: `admin_7k9x@parlor.com` (ID: `adm_7k9x2m41`, Pass: `P@ss!9x8K#2026`).
   - For Parlor Admin 2: `admin_3v8q@parlor.com` (ID: `adm_3v8q1w95`, Pass: `W#7zL$2qM*2026`).
4. In your project, copy `.env.example` to `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart your dev server (`npm run dev`). All changes made in `/admin` will now sync live with your Supabase database and update the customer-facing website!
*(Note: A local demo storage fallback is included automatically with the 2 admin accounts pre-configured and 1-click fill buttons at `/admin`).*

## Setting up a new client

1. Copy this repo for the client. The easiest way is to mark it as a **Template repository** on GitHub and click *Use this template*.
2. Edit `salon.json`. At minimum it needs `name`, `whatsapp` and one service. The name can also come from Google.
3. Put the client's photos in `public/images/` and reference them as `/images/<file>.jpg`.
4. Check it locally with `npm install` and then `npm run dev`.
5. Push to GitHub and import the repo on your host:
   - Build command: `npm run build`
   - Output directory: `dist`

If `salon.json` has a mistake, the build stops with a plain message saying what to fix, for example:
`salon.json → services[3] needs "price" as a plain number (e.g. 799, not "₹799")`.

## Pulling data from Google

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Places API (New)** and create an API key.
2. Tell `salon.json` which listing to use. Any one of these works:
   ```json
   "google": { "placeId": "ChIJ..." }
   "google": { "mapsUrl": "https://maps.app.goo.gl/xxxx" }
   "google": { "search": "Glow Studio FC Road Pune" }
   ```
   A Google Maps share link from the salon's profile is the easiest.
3. Copy `.env.example` to `.env` and paste the key, then run:
   ```
   npm run fetch-google
   ```
   This saves the data to `salon.google.json` and the photos to `public/google-photos/`. **Commit both.** Deploys then don't need the key, and you don't use API quota on every build. The script also prints the matched `placeId`. Paste it into `salon.json` so the site always uses that exact listing.

**Which value wins:** anything you write in `salon.json` overrides Google. Leave a field out and Google's value is used.

- If you don't provide `testimonials`, the salon's 4★+ Google reviews are shown instead.
- If you don't provide a `gallery`, the Google photos are used.
- The first Google photo also becomes the hero image when `hero.image` isn't set.

`npm run build` runs the fetch step first, but only fetches when there's no saved data for the listing yet. It never fails the build because of Google.

## `salon.json` reference

Keys starting with `_` are treated as comments. Unknown keys print a warning, which catches typos.

| Field | Notes |
|---|---|
| `name`, `tagline`, `description` | `description` is also used for SEO. |
| `siteUrl` | e.g. `https://glowstudio.in`. Enables the canonical link and full share-image URLs. |
| `favicon` | Custom browser favicon image URL or local path (e.g. `/favicon.svg`). Can also be changed via `/admin`. |
| `google` | `placeId` / `mapsUrl` / `search`, plus `maxPhotos` (default 8, `0` = none). See above. |
| `phone` | Shown on the site. |
| `whatsapp` | Digits **with country code**, e.g. `919876543210`. Defaults to `phone`. Bookings go here. |
| `email` | Optional. |
| `address` | `street`, `city`, `state`, `postalCode`, `country`, and optionally `full` to override the one-line version. |
| `hours` | `"monday": "closed"`, `"tuesday": "10:00-20:00"`, split shifts as `"10:00-13:00, 14:00-20:00"`. A missing day counts as closed. These drive the Open/Closed badge and the dates and time slots offered in booking. |
| `timezone` | e.g. `Asia/Kolkata`, so "Open now" is right for visitors in other time zones. |
| `rating`, `reviewCount` | Only set these by hand if you're not using Google. When they come from Google, the site labels them "Google rating". |
| `social` | `instagram`, `facebook`. Only the ones you fill in are shown. |
| `currency`, `locale` | Defaults are `INR` and `en-IN`. Used to format all prices. |
| `theme` | Brand colours: `accent`, `accentDark`, `dark`, `background`, `backgroundAlt`, `soft`, `gold`. |
| `hero` | `image`, `rotatingWords`, `secondLine`, `subtext`. |
| `about` | `image`, `label`, `heading`, `secondLine`, `text`, `stats` (`[{ value, suffix, label }]`), `features` (`[{ title, desc }]`). All optional. |
| `services` | **Required.** `[{ name, category, price, duration, description, benefits[], popular, image }]`. `price` is a plain number. Without an `image`, a stock photo matching the category is used. |
| `packages` | `[{ name, price, originalPrice, priceNote, savingsLabel, duration, description, features[], popular }]` |
| `team` | `[{ name, role, specialization, experience, bio, image }]`. Without an image, their initials are shown. |
| `testimonials` | `[{ name, role, rating, text }]` |
| `gallery` | `[{ src, alt, category }]` |
| `transformations` | Before/after sliders: `[{ category, label, before, after }]`. Only use real client photos. |
| `bridal` | `true` for defaults, or `{ image, heading, secondLine, text, points[], eventTypes[], budgetOptions[] }`. Leave it out to hide the section. |
| `cancellationPolicy` | Shown on service details and the booking confirmation. |
| `booking` | `daysAhead` (default 14), `slotMinutes` (default 60). |
| `seo` | Optional `title`, `description`, `keywords`. Sensible defaults are generated. |

The `salon.json` in this repo is a complete demo salon. Use it as the starting template.

## Project layout

```
salon.json               ← the only file you edit per client
salon.google.json        ← generated by `npm run fetch-google` (commit it)
public/images/           ← salon photos
scripts/salon-data.mjs   ← validates salon.json and merges in Google data
scripts/fetch-google.mjs ← Google Places fetcher
vite.config.js           ← feeds the data to the app + generates title/SEO/structured data
src/                     ← React site (sections/, components/)
```
