-- =====================================================
-- Supabase Setup SQL — Run this in Supabase SQL Editor
-- =====================================================

-- 1. Site settings table (super admin only)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL DEFAULT 'Parlor Name',
  logo_url TEXT,
  favicon_url TEXT DEFAULT '/favicon.svg',
  google_calendar_id TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  map_url TEXT,
  tagline TEXT,
  description TEXT,
  whatsapp TEXT,
  currency TEXT DEFAULT 'INR',
  locale TEXT DEFAULT 'en-IN',
  rating NUMERIC(3,1),
  review_count TEXT,
  instagram TEXT,
  facebook TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- 2. Hero settings table (admin)
CREATE TABLE IF NOT EXISTS hero_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  image_url TEXT,
  rotating_words TEXT[] DEFAULT ARRAY['Glow', 'Radiance', 'Elegance', 'Serenity', 'Confidence'],
  second_line TEXT DEFAULT 'Your Confidence.',
  subtext TEXT DEFAULT 'Professional beauty, hair & wellness services designed around you.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO hero_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- 3. About / experience settings (admin)
CREATE TABLE IF NOT EXISTS about_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  image_url TEXT,
  label TEXT DEFAULT 'Our Story',
  heading TEXT DEFAULT 'Where Beauty',
  second_line TEXT DEFAULT 'Meets Excellence.',
  text TEXT DEFAULT 'We are passionate about making every client feel their absolute best.',
  stats JSONB DEFAULT '[]'::JSONB,
  features JSONB DEFAULT '[]'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO about_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- 4. Services table (admin)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'Hair',
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT,
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Packages table (admin)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  duration TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT FALSE,
  price_note TEXT,
  savings_label TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Gallery table (admin)
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT,
  category TEXT DEFAULT 'General',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bookings table (appointments with Google Calendar integration)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_price NUMERIC DEFAULT 0,
  duration TEXT DEFAULT '60 min',
  professional_name TEXT DEFAULT 'Any Available',
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed' | 'pending' | 'completed' | 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read hero_settings" ON hero_settings FOR SELECT USING (true);
CREATE POLICY "Public read about_settings" ON about_settings FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);

-- Public can insert new bookings from the booking flow
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Authenticated write for admin sections
CREATE POLICY "Auth write hero_settings" ON hero_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write about_settings" ON about_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write packages" ON packages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth all bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');

-- Super admin only for site_settings
CREATE POLICY "Super admin write site_settings" ON site_settings FOR ALL USING (
  auth.jwt() ->> 'email' = 'abhirupsarkar2jp@gmail.com'
);

-- =====================================================
-- 7. Configured Parlor Admins (2 Accounts)
-- =====================================================
-- Admin 1:
--   ID: adm_7k9x2m41
--   Email: admin_7k9x@parlor.com
--   Password: P@ss!9x8K#2026
--
-- Admin 2:
--   ID: adm_3v8q1w95
--   Email: admin_3v8q@parlor.com
--   Password: W#7zL$2qM*2026
--
-- To add them in Supabase:
-- 1. Go to Supabase Dashboard -> Authentication -> Users -> Add User
-- 2. Enter Email and Password for each admin above.
-- (Note: In local mock mode, these 2 admins can log in immediately at /admin)

