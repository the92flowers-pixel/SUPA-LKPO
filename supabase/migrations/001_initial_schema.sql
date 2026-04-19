-- ============================================
-- ЖУРБА MUSIC - Supabase Migration
-- ============================================

-- 1. PROFILES (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  login TEXT UNIQUE NOT NULL,
  artist_name TEXT,
  role TEXT DEFAULT 'artist' CHECK (role IN ('admin', 'artist')),
  balance DECIMAL(10,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STATUSES (for release moderation)
CREATE TABLE IF NOT EXISTS public.statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'gray',
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FIELDS (dynamic form fields)
CREATE TABLE IF NOT EXISTS public.fields (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  required BOOLEAN DEFAULT false,
  section TEXT DEFAULT 'release',
  for_role TEXT DEFAULT 'artist',
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  options JSONB DEFAULT '[]',
  file_types TEXT,
  max_size TEXT DEFAULT '5',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RELEASES
CREATE TABLE IF NOT EXISTS public.releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  release_date DATE,
  cover_url TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'На модерації',
  streams INTEGER DEFAULT 0,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SMART LINKS
CREATE TABLE IF NOT EXISTS public.smart_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  artist TEXT,
  cover_url TEXT,
  platforms JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARTIST WEBSITES
CREATE TABLE IF NOT EXISTS public.artist_websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  stage_name TEXT,
  bio TEXT,
  photo_url TEXT,
  links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LABEL SOCIALS
CREATE TABLE IF NOT EXISTS public.label_socials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT DEFAULT 'deposit' CHECK (type IN ('deposit', 'withdrawal', 'admin_adjust')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WITHDRAWAL REQUESTS
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  contact_info TEXT,
  confirmation_agreed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUARTERLY REPORTS
CREATE TABLE IF NOT EXISTS public.quarterly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. APP CONFIG (single row for settings)
CREATE TABLE IF NOT EXISTS public.app_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB DEFAULT '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
  home_page JSONB DEFAULT '{"heroTitle": "Твоя музика. Твоя влада.", "heroSubtitle": "Дистрибуція нового покоління для незалежних артистів.", "buttonText": "Приєднатися", "primaryColor": "#ef4444"}',
  admin_panel JSONB DEFAULT '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
  login_page JSONB DEFAULT '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "socialIcons": ["Spotify", "Apple Music"]}',
  fields JSONB DEFAULT '[]',
  statuses JSONB DEFAULT '[]',
  label_socials JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON public.releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);
CREATE INDEX IF NOT EXISTS idx_smart_links_release_id ON public.smart_links(release_id);
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON public.smart_links(slug);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON public.artist_websites(slug);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_reports_user_id ON public.quarterly_reports(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- STATUSES POLICIES
CREATE POLICY "Statuses are viewable by everyone"
  ON public.statuses FOR SELECT USING (true);

CREATE POLICY "Admins can manage statuses"
  ON public.statuses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- FIELDS POLICIES
CREATE POLICY "Fields are viewable by everyone"
  ON public.fields FOR SELECT USING (true);

CREATE POLICY "Admins can manage fields"
  ON public.fields FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RELEASES POLICIES
CREATE POLICY "Published releases are viewable by everyone"
  ON public.releases FOR SELECT USING (status = 'Опубліковано' OR 
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert their own releases"
  ON public.releases FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own releases"
  ON public.releases FOR UPDATE USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete releases"
  ON public.releases FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SMART LINKS POLICIES
CREATE POLICY "Smart links are viewable by everyone"
  ON public.smart_links FOR SELECT USING (true);

CREATE POLICY "Users can manage their own smart links"
  ON public.smart_links FOR ALL USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ARTIST WEBSITES POLICIES
CREATE POLICY "Artist websites are viewable by everyone"
  ON public.artist_websites FOR SELECT USING (true);

CREATE POLICY "Users can manage their own artist websites"
  ON public.artist_websites FOR ALL USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LABEL SOCIALS POLICIES
CREATE POLICY "Label socials are viewable by everyone"
  ON public.label_socials FOR SELECT USING (true);

CREATE POLICY "Admins can manage label socials"
  ON public.label_socials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- TRANSACTIONS POLICIES
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage transactions"
  ON public.transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- WITHDRAWAL REQUESTS POLICIES
CREATE POLICY "Users can view their own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create withdrawal requests"
  ON public.withdrawal_requests FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage withdrawal requests"
  ON public.withdrawal_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- QUARTERLY REPORTS POLICIES
CREATE POLICY "Users can view their own reports"
  ON public.quarterly_reports FOR SELECT USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage reports"
  ON public.quarterly_reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- APP CONFIG POLICIES
CREATE POLICY "App config is viewable by everyone"
  ON public.app_config FOR SELECT USING (true);

CREATE POLICY "Admins can manage app config"
  ON public.app_config FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, login, role, artist_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    COALESCE(NEW.raw_user_meta_data->>'artist_name', NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default app config (only if not exists)
INSERT INTO public.app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert default statuses
INSERT INTO public.statuses (name, color, sort_order, is_default) 
VALUES 
  ('На модерації', 'yellow', 1, true),
  ('Опубліковано', 'green', 2, false),
  ('Відхилено', 'red', 3, false)
ON CONFLICT DO NOTHING;

-- Insert default fields
INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options) 
VALUES 
  ('title', 'Назва релізу', 'text', true, 'release', 1, true, '[]'),
  ('artist', 'Основний артист', 'text', true, 'release', 2, true, '[]'),
  ('genre', 'Жанр', 'select', true, 'release', 3, true, '["Hip-Hop", "Pop", "Electronic", "Rock", "Sad Rap"]'),
  ('release_date', 'Дата релізу', 'date', true, 'release', 4, true, '[]'),
  ('cover_url', 'Обкладинка (URL)', 'url', true, 'release', 5, true, '[]'),
  ('audio_url', 'Аудіофайл (URL)', 'url', true, 'release', 6, true, '[]'),
  ('bio', 'Біографія', 'textarea', false, 'profile', 1, true, '[]')
ON CONFLICT DO NOTHING;

-- Insert default label socials
INSERT INTO public.label_socials (name, url, sort_order) 
VALUES 
  ('Instagram', 'https://instagram.com/zhurba', 1),
  ('Telegram', 'https://t.me/zhurba', 2)
ON CONFLICT DO NOTHING;