-- =============================================
-- ЖУРБА MUSIC - Complete Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE (User accounts)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'artist' CHECK (role IN ('admin', 'artist')),
  balance DECIMAL(12, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  bio TEXT,
  artist_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RELEASES TABLE
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  genre TEXT DEFAULT 'Другое',
  release_date TEXT DEFAULT CURRENT_DATE,
  cover_url TEXT DEFAULT '',
  audio_url TEXT DEFAULT '',
  release_url TEXT DEFAULT '',
  status TEXT DEFAULT 'На модерації',
  streams INTEGER DEFAULT 0,
  history JSONB DEFAULT '[]',
  composer TEXT DEFAULT '',
  performer TEXT DEFAULT '',
  label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  explicit BOOLEAN DEFAULT false,
  is_single BOOLEAN DEFAULT true,
  isrc TEXT DEFAULT '',
  tracks JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SMART LINKS TABLE
CREATE TABLE IF NOT EXISTS smart_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  title TEXT DEFAULT '',
  artist TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  platforms JSONB DEFAULT '[]',
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ARTIST WEBSITES TABLE
CREATE TABLE IF NOT EXISTS artist_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  links JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'adjustment')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. WITHDRAWAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  contact_info TEXT DEFAULT '',
  confirmation_agreed BOOLEAN DEFAULT false,
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. QUARTERLY REPORTS TABLE
CREATE TABLE IF NOT EXISTS quarterly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year INTEGER NOT NULL,
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. STATUSES TABLE
CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'gray',
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false
);

-- 9. FIELDS TABLE
CREATE TABLE IF NOT EXISTS fields (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  required BOOLEAN DEFAULT false,
  section TEXT DEFAULT 'release',
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  options TEXT DEFAULT '',
  file_types TEXT DEFAULT '',
  max_size TEXT DEFAULT '5'
);

-- 10. APP CONFIG TABLE
CREATE TABLE IF NOT EXISTS app_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB DEFAULT '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
  home_page JSONB DEFAULT '{"heroTitle": "Твоя музыка. Твоя власть.", "heroSubtitle": "Дистрибуция нового поколения.", "buttonText": "Присоединиться", "primaryColor": "#ef4444"}',
  admin_panel JSONB DEFAULT '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
  login_page JSONB DEFAULT '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Добро пожаловать", "welcomeSubtitle": "Войдите", "socialIcons": ["Spotify", "Apple Music"]}',
  label_socials JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. LABEL SOCIALS TABLE (alternative structure)
CREATE TABLE IF NOT EXISTS label_socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_links_user_id ON smart_links(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON smart_links(slug);
CREATE INDEX IF NOT EXISTS idx_artist_websites_user_id ON artist_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON artist_websites(slug);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_reports_user_id ON quarterly_reports(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_socials ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RELEASES POLICIES
CREATE POLICY "Users can view own releases" ON releases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own releases" ON releases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own releases" ON releases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own releases" ON releases
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all releases" ON releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all releases" ON releases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all releases" ON releases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- SMART LINKS POLICIES
CREATE POLICY "Users can view own smart links" ON smart_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own smart links" ON smart_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smart links" ON smart_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own smart links" ON smart_links
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view smart links by slug" ON smart_links
  FOR SELECT USING (slug IS NOT NULL);

CREATE POLICY "Admins can manage all smart links" ON smart_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ARTIST WEBSITES POLICIES
CREATE POLICY "Users can view own websites" ON artist_websites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own websites" ON artist_websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites" ON artist_websites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites" ON artist_websites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view websites by slug" ON artist_websites
  FOR SELECT USING (slug IS NOT NULL);

CREATE POLICY "Admins can manage all websites" ON artist_websites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- TRANSACTIONS POLICIES
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert transactions" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- WITHDRAWAL REQUESTS POLICIES
CREATE POLICY "Users can view own withdrawal requests" ON withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests" ON withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests" ON withdrawal_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update withdrawal requests" ON withdrawal_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- QUARTERLY REPORTS POLICIES
CREATE POLICY "Users can view own reports" ON quarterly_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON quarterly_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON quarterly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert reports" ON quarterly_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete reports" ON quarterly_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- STATUSES POLICIES (public read, admin write)
CREATE POLICY "Anyone can view statuses" ON statuses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage statuses" ON statuses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- FIELDS POLICIES (public read, admin write)
CREATE POLICY "Anyone can view fields" ON fields
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage fields" ON fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- APP CONFIG POLICIES (public read, admin write)
CREATE POLICY "Anyone can view app config" ON app_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage app config" ON app_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- LABEL SOCIALS POLICIES (public read, admin write)
CREATE POLICY "Anyone can view label socials" ON label_socials
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage label socials" ON label_socials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, balance, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'artist_name', ''),
    'artist',
    0,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default statuses
INSERT INTO statuses (name, color, sort_order, is_default) VALUES
  ('На модерації', 'yellow', 1, true),
  ('Опубліковано', 'green', 2, false),
  ('Відхилено', 'red', 3, false)
ON CONFLICT DO NOTHING;

-- Insert default fields for releases
INSERT INTO fields (name, label, type, required, section, sort_order, visible) VALUES
  ('composer', 'Композитор', 'text', false, 'release', 1, true),
  ('performer', 'Виконавець', 'text', true, 'release', 2, true),
  ('label', 'Лейбл', 'text', false, 'release', 3, true),
  ('description', 'Опис', 'textarea', false, 'release', 4, true),
  ('explicit', 'Explicit', 'checkbox', false, 'release', 5, true)
ON CONFLICT DO NOTHING;

-- Insert app config
INSERT INTO app_config (id, settings, home_page, admin_panel, login_page, label_socials) VALUES
  (1, 
   '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
   '{"heroTitle": "Твоя музыка. Твоя власть.", "heroSubtitle": "Дистрибуция нового поколения.", "buttonText": "Присоединиться", "primaryColor": "#ef4444"}',
   '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
   '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Добро пожаловать", "welcomeSubtitle": "Войдите", "socialIcons": ["Spotify", "Apple Music"]}',
   '[]'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- COMPLETE SQL END
-- =============================================