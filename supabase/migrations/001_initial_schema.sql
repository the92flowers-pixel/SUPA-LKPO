-- =============================================
-- ЖУРБА MUSIC - Database Schema (Fixed v2)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    artist_name TEXT,
    role TEXT DEFAULT 'artist' CHECK (role IN ('artist', 'admin')),
    balance NUMERIC DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, balance, is_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'artist_name', ''),
        'artist',
        0,
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STATUSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'gray',
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default statuses
INSERT INTO statuses (name, color, sort_order, is_default) VALUES
    ('На модерації', 'yellow', 1, TRUE),
    ('Опубліковано', 'green', 2, FALSE),
    ('Відхилено', 'red', 3, FALSE)
ON CONFLICT DO NOTHING;

-- =============================================
-- FIELDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS fields (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    required BOOLEAN DEFAULT FALSE,
    section TEXT DEFAULT 'release',
    sort_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    options TEXT,
    file_types TEXT,
    max_size TEXT DEFAULT '5',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default fields
INSERT INTO fields (name, label, type, required, section, sort_order, visible) VALUES
    ('composer', 'Композитор', 'text', FALSE, 'release', 1, TRUE),
    ('performer', 'Виконавець (ПІБ)', 'text', TRUE, 'release', 2, TRUE),
    ('label', 'Лейбл', 'text', FALSE, 'release', 3, TRUE),
    ('description', 'Опис', 'textarea', FALSE, 'release', 4, TRUE),
    ('isrc', 'ISRC', 'text', FALSE, 'release', 5, FALSE),
    ('explicit', 'Explicit', 'checkbox', FALSE, 'release', 6, FALSE),
    ('instagram', 'Instagram', 'text', FALSE, 'profile', 1, TRUE),
    ('telegram', 'Telegram', 'text', FALSE, 'profile', 2, TRUE),
    ('youtube', 'YouTube', 'text', FALSE, 'profile', 3, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- RELEASES TABLE (NO FK CONSTRAINT - avoid timing issues)
-- =============================================
DROP TABLE IF EXISTS releases CASCADE;
CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,  -- No FK constraint to avoid timing issues
    title TEXT NOT NULL,
    artist TEXT,
    genre TEXT DEFAULT 'Другое',
    release_date TEXT,
    cover_url TEXT,
    release_url TEXT,
    audio_url TEXT,
    status TEXT DEFAULT 'На модерації',
    streams INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]'::JSONB,
    composer TEXT,
    performer TEXT,
    label TEXT,
    description TEXT,
    explicit BOOLEAN DEFAULT FALSE,
    is_single BOOLEAN DEFAULT TRUE,
    isrc TEXT,
    tracks JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SMART LINKS TABLE
-- =============================================
DROP TABLE IF EXISTS smart_links CASCADE;
CREATE TABLE smart_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    release_id UUID,
    title TEXT,
    artist TEXT,
    cover_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    platforms JSONB DEFAULT '[]'::JSONB,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ARTIST WEBSITES TABLE
-- =============================================
DROP TABLE IF EXISTS artist_websites CASCADE;
CREATE TABLE artist_websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    title TEXT,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    photo_url TEXT,
    links JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'adjustment')),
    amount NUMERIC NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WITHDRAWAL REQUESTS TABLE
-- =============================================
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    contact_info TEXT,
    confirmation_agreed BOOLEAN DEFAULT FALSE,
    admin_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUARTERLY REPORTS TABLE
-- =============================================
DROP TABLE IF EXISTS quarterly_reports CASCADE;
CREATE TABLE quarterly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- APP CONFIG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB DEFAULT '{
        "siteName": "ЖУРБА MUSIC",
        "registrationEnabled": true,
        "contactEmail": "support@jurba.music"
    }'::JSONB,
    home_page JSONB DEFAULT '{
        "heroTitle": "Твоя музыка. Твоя власть.",
        "heroSubtitle": "Дистрибуция нового поколения.",
        "buttonText": "Присоединиться",
        "primaryColor": "#ef4444"
    }'::JSONB,
    admin_panel JSONB DEFAULT '{
        "logoText": "ЖУРБА",
        "accentColor": "#ef4444"
    }'::JSONB,
    login_page JSONB DEFAULT '{
        "logoText": "ЖУРБА MUSIC",
        "welcomeTitle": "Добро пожаловать",
        "welcomeSubtitle": "Войдите",
        "socialIcons": []
    }'::JSONB,
    label_socials JSONB DEFAULT '[]'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO app_config (id) VALUES (1) ON CONFLICT DO NOTHING;

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

-- Helper function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()) = TRUE);

-- Releases policies
CREATE POLICY "releases_select" ON releases FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "releases_insert" ON releases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "releases_update" ON releases FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "releases_delete" ON releases FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);

-- Smart links policies
CREATE POLICY "smart_links_select" ON smart_links FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "smart_links_insert" ON smart_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "smart_links_update" ON smart_links FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "smart_links_delete" ON smart_links FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);

-- Artist websites policies
CREATE POLICY "artist_websites_all" ON artist_websites FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "artist_websites_public" ON artist_websites FOR SELECT USING (TRUE);

-- Transactions policies
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (public.is_admin(auth.uid()) = TRUE);

-- Withdrawal requests policies
CREATE POLICY "withdrawal_requests_select" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "withdrawal_requests_insert" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "withdrawal_requests_update" ON withdrawal_requests FOR UPDATE USING (public.is_admin(auth.uid()) = TRUE);

-- Quarterly reports policies
CREATE POLICY "quarterly_reports_select" ON quarterly_reports FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "quarterly_reports_insert" ON quarterly_reports FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()) = TRUE);
CREATE POLICY "quarterly_reports_delete" ON quarterly_reports FOR DELETE USING (public.is_admin(auth.uid()) = TRUE);

-- Statuses and Fields (public read)
CREATE POLICY "statuses_read" ON statuses FOR SELECT USING (TRUE);
CREATE POLICY "fields_read" ON fields FOR SELECT USING (TRUE);

-- App config
CREATE POLICY "app_config_read" ON app_config FOR SELECT USING (TRUE);
CREATE POLICY "app_config_update" ON app_config FOR UPDATE USING (public.is_admin(auth.uid()) = TRUE);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON smart_links(slug);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON artist_websites(slug);