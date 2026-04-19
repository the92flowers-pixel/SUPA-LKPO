-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  artist_name TEXT,
  role TEXT DEFAULT 'artist',
  balance DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create releases table
CREATE TABLE IF NOT EXISTS releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  release_date DATE NOT NULL,
  cover_url TEXT NOT NULL,
  composer TEXT,
  performer TEXT,
  label TEXT DEFAULT 'ЖУРБА MUSIC',
  description TEXT,
  explicit BOOLEAN DEFAULT FALSE,
  is_single BOOLEAN DEFAULT TRUE,
  isrc TEXT,
  upc TEXT,
  release_url TEXT,
  copyrights TEXT,
  copyright_confirmed BOOLEAN DEFAULT FALSE,
  tracks JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'На модерації',
  streams BIGINT DEFAULT 0,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create smart_links table
CREATE TABLE IF NOT EXISTS smart_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  platforms JSONB DEFAULT '[]'::jsonb,
  clicks BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create artist_websites table
CREATE TABLE IF NOT EXISTS artist_websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  contact_info TEXT,
  confirmation_agreed BOOLEAN DEFAULT FALSE,
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create quarterly_reports table
CREATE TABLE IF NOT EXISTS quarterly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create app_config table
CREATE TABLE IF NOT EXISTS app_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB DEFAULT '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}'::jsonb,
  home_page JSONB DEFAULT '{"heroTitle": "Твоя музика. Твоя влада.", "heroSubtitle": "Дистрибуція нового покоління.", "buttonText": "Приєднатися", "primaryColor": "#ef4444"}'::jsonb,
  admin_panel JSONB DEFAULT '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}'::jsonb,
  login_page JSONB DEFAULT '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "socialIcons": []}'::jsonb,
  label_socials JSONB DEFAULT '[]'::jsonb
);

-- Create statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE
);

-- Create fields table
CREATE TABLE IF NOT EXISTS fields (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  section TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  options TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Allow all for now to ensure functionality, can be restricted later)
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all on releases" ON releases FOR ALL USING (true);
CREATE POLICY "Allow all on smart_links" ON smart_links FOR ALL USING (true);
CREATE POLICY "Allow all on artist_websites" ON artist_websites FOR ALL USING (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all on withdrawal_requests" ON withdrawal_requests FOR ALL USING (true);
CREATE POLICY "Allow all on quarterly_reports" ON quarterly_reports FOR ALL USING (true);
CREATE POLICY "Allow all on app_config" ON app_config FOR ALL USING (true);
CREATE POLICY "Allow all on statuses" ON statuses FOR ALL USING (true);
CREATE POLICY "Allow all on fields" ON fields FOR ALL USING (true);