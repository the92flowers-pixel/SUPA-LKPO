-- ============================================
-- ЖУРБА MUSIC - Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'artist' CHECK (role IN ('admin', 'artist')),
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    artist_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    avatar_local TEXT
);

-- ============================================
-- 2. RELEASES TABLE
-- ============================================
CREATE TABLE public.releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL DEFAULT 'Other',
    release_date DATE,
    cover_url TEXT,
    cover_image_local TEXT,
    composer TEXT,
    performer TEXT,
    label TEXT,
    description TEXT,
    explicit BOOLEAN DEFAULT false,
    is_single BOOLEAN DEFAULT false,
    isrc TEXT,
    upc TEXT,
    release_url TEXT,
    copyrights TEXT,
    copyright_confirmed BOOLEAN NOT NULL DEFAULT false,
    tracks JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'На модерації',
    streams INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]',
    distributor TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. SMART LINKS TABLE
-- ============================================
CREATE TABLE public.smart_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    release_id UUID REFERENCES public.releases(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_url TEXT,
    avatar_local TEXT,
    slug TEXT UNIQUE NOT NULL,
    platforms JSONB DEFAULT '[]',
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. ARTIST WEBSITES TABLE
-- ============================================
CREATE TABLE public.artist_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    photo_url TEXT,
    site_avatar_local TEXT,
    links JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payout')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. WITHDRAWAL REQUESTS TABLE
-- ============================================
CREATE TABLE public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    contact_info TEXT NOT NULL,
    confirmation_agreed BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    admin_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. QUARTERLY REPORTS TABLE
-- ============================================
CREATE TABLE public.quarterly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. STATUSES TABLE
-- ============================================
CREATE TABLE public.statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6b7280',
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false
);

-- ============================================
-- 9. FIELDS TABLE
-- ============================================
CREATE TABLE public.fields (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'checkbox', 'select', 'file', 'date')),
    required BOOLEAN DEFAULT false,
    section TEXT DEFAULT 'release' CHECK (section IN ('release', 'profile', 'artist_website', 'smart_link')),
    sort_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    options TEXT,
    file_types TEXT,
    max_size TEXT DEFAULT '5'
);

-- ============================================
-- 10. APP CONFIG TABLE
-- ============================================
CREATE TABLE public.app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB DEFAULT '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
    home_page JSONB DEFAULT '{"heroTitle": "Твоя музика. Скрізь.", "heroSubtitle": "Дистрибуція на 150+ платформ.", "buttonText": "Почати", "primaryColor": "#ef4444"}',
    admin_panel JSONB DEFAULT '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
    login_page JSONB DEFAULT '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "socialIcons": []}',
    label_socials JSONB DEFAULT '[]'
);

-- ============================================
-- 11. TASKS TABLE
-- ============================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 12. ADMIN LINKS TABLE
-- ============================================
CREATE TABLE public.admin_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- 13. REVENUE STREAMS TABLE
-- ============================================
CREATE TABLE public.revenue_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    release_id UUID REFERENCES public.releases(id) ON DELETE SET NULL,
    release_title TEXT,
    release_artist TEXT,
    release_cover TEXT,
    platform TEXT NOT NULL,
    country TEXT,
    streams INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    period TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 14. PLATFORM LINKS TABLE
-- ============================================
CREATE TABLE public.platform_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    release_id UUID REFERENCES public.releases(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_releases_user_id ON public.releases(user_id);
CREATE INDEX idx_releases_status ON public.releases(status);
CREATE INDEX idx_releases_created_at ON public.releases(created_at DESC);
CREATE INDEX idx_releases_genre ON public.releases(genre);

CREATE INDEX idx_smart_links_user_id ON public.smart_links(user_id);
CREATE INDEX idx_smart_links_slug ON public.smart_links(slug);

CREATE INDEX idx_artist_websites_user_id ON public.artist_websites(user_id);
CREATE INDEX idx_artist_websites_slug ON public.artist_websites(slug);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);

CREATE INDEX idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

CREATE INDEX idx_revenue_streams_user_id ON public.revenue_streams(user_id);
CREATE INDEX idx_revenue_streams_release_id ON public.revenue_streams(release_id);
CREATE INDEX idx_revenue_streams_platform ON public.revenue_streams(platform);
CREATE INDEX idx_revenue_streams_period ON public.revenue_streams(period);

CREATE INDEX idx_platform_links_user_id ON public.platform_links(user_id);
CREATE INDEX idx_platform_links_release_id ON public.platform_links(release_id);

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, balance, is_verified, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
        0,
        false,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RELEASES POLICIES
DROP POLICY IF EXISTS "releases_select" ON public.releases;
CREATE POLICY "releases_select" ON public.releases FOR SELECT USING (true);

DROP POLICY IF EXISTS "releases_insert" ON public.releases;
CREATE POLICY "releases_insert" ON public.releases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "releases_update_own" ON public.releases;
CREATE POLICY "releases_update_own" ON public.releases FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "releases_delete_own" ON public.releases;
CREATE POLICY "releases_delete_own" ON public.releases FOR DELETE USING (auth.uid() = user_id);

-- SMART LINKS POLICIES
DROP POLICY IF EXISTS "smart_links_select" ON public.smart_links;
CREATE POLICY "smart_links_select" ON public.smart_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "smart_links_insert" ON public.smart_links;
CREATE POLICY "smart_links_insert" ON public.smart_links FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "smart_links_update_own" ON public.smart_links;
CREATE POLICY "smart_links_update_own" ON public.smart_links FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "smart_links_delete_own" ON public.smart_links;
CREATE POLICY "smart_links_delete_own" ON public.smart_links FOR DELETE USING (auth.uid() = user_id);

-- ARTIST WEBSITES POLICIES
DROP POLICY IF EXISTS "artist_websites_select" ON public.artist_websites;
CREATE POLICY "artist_websites_select" ON public.artist_websites FOR SELECT USING (true);

DROP POLICY IF EXISTS "artist_websites_insert" ON public.artist_websites;
CREATE POLICY "artist_websites_insert" ON public.artist_websites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "artist_websites_update_own" ON public.artist_websites;
CREATE POLICY "artist_websites_update_own" ON public.artist_websites FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "artist_websites_delete_own" ON public.artist_websites;
CREATE POLICY "artist_websites_delete_own" ON public.artist_websites FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WITHDRAWAL REQUESTS POLICIES
DROP POLICY IF EXISTS "withdrawal_requests_select" ON public.withdrawal_requests;
CREATE POLICY "withdrawal_requests_select" ON public.withdrawal_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "withdrawal_requests_insert" ON public.withdrawal_requests;
CREATE POLICY "withdrawal_requests_insert" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawal_requests_update_own" ON public.withdrawal_requests;
CREATE POLICY "withdrawal_requests_update_own" ON public.withdrawal_requests FOR UPDATE USING (auth.uid() = user_id);

-- QUARTERLY REPORTS POLICIES
DROP POLICY IF EXISTS "quarterly_reports_select" ON public.quarterly_reports;
CREATE POLICY "quarterly_reports_select" ON public.quarterly_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "quarterly_reports_insert" ON public.quarterly_reports;
CREATE POLICY "quarterly_reports_insert" ON public.quarterly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quarterly_reports_update_own" ON public.quarterly_reports;
CREATE POLICY "quarterly_reports_update_own" ON public.quarterly_reports FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quarterly_reports_delete_own" ON public.quarterly_reports;
CREATE POLICY "quarterly_reports_delete_own" ON public.quarterly_reports FOR DELETE USING (auth.uid() = user_id);

-- TASKS POLICIES
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (true);

-- ADMIN LINKS POLICIES
DROP POLICY IF EXISTS "admin_links_select" ON public.admin_links;
CREATE POLICY "admin_links_select" ON public.admin_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_links_insert" ON public.admin_links;
CREATE POLICY "admin_links_insert" ON public.admin_links FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin_links_update" ON public.admin_links;
CREATE POLICY "admin_links_update" ON public.admin_links FOR UPDATE USING (true);

DROP POLICY IF EXISTS "admin_links_delete" ON public.admin_links;
CREATE POLICY "admin_links_delete" ON public.admin_links FOR DELETE USING (true);

-- REVENUE STREAMS POLICIES
DROP POLICY IF EXISTS "revenue_streams_select" ON public.revenue_streams;
CREATE POLICY "revenue_streams_select" ON public.revenue_streams FOR SELECT USING (true);

DROP POLICY IF EXISTS "revenue_streams_insert" ON public.revenue_streams;
CREATE POLICY "revenue_streams_insert" ON public.revenue_streams FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "revenue_streams_update" ON public.revenue_streams;
CREATE POLICY "revenue_streams_update" ON public.revenue_streams FOR UPDATE USING (auth.uid() = user_id);

-- PLATFORM LINKS POLICIES
DROP POLICY IF EXISTS "platform_links_select" ON public.platform_links;
CREATE POLICY "platform_links_select" ON public.platform_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "platform_links_insert" ON public.platform_links;
CREATE POLICY "platform_links_insert" ON public.platform_links FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "platform_links_update_own" ON public.platform_links;
CREATE POLICY "platform_links_update_own" ON public.platform_links FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "platform_links_delete_own" ON public.platform_links;
CREATE POLICY "platform_links_delete_own" ON public.platform_links FOR DELETE USING (auth.uid() = user_id);

-- STATUSES POLICIES
DROP POLICY IF EXISTS "statuses_select" ON public.statuses;
CREATE POLICY "statuses_select" ON public.statuses FOR SELECT USING (true);

DROP POLICY IF EXISTS "statuses_insert" ON public.statuses;
CREATE POLICY "statuses_insert" ON public.statuses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "statuses_update" ON public.statuses;
CREATE POLICY "statuses_update" ON public.statuses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "statuses_delete" ON public.statuses;
CREATE POLICY "statuses_delete" ON public.statuses FOR DELETE USING (true);

-- FIELDS POLICIES
DROP POLICY IF EXISTS "fields_select" ON public.fields;
CREATE POLICY "fields_select" ON public.fields FOR SELECT USING (true);

DROP POLICY IF EXISTS "fields_insert" ON public.fields;
CREATE POLICY "fields_insert" ON public.fields FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "fields_update" ON public.fields;
CREATE POLICY "fields_update" ON public.fields FOR UPDATE USING (true);

DROP POLICY IF EXISTS "fields_delete" ON public.fields;
CREATE POLICY "fields_delete" ON public.fields FOR DELETE USING (true);

-- APP CONFIG POLICIES
DROP POLICY IF EXISTS "app_config_select" ON public.app_config;
CREATE POLICY "app_config_select" ON public.app_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_config_update" ON public.app_config;
CREATE POLICY "app_config_update" ON public.app_config FOR UPDATE USING (true);

-- ============================================
-- DEFAULT DATA: STATUSES
-- ============================================
INSERT INTO public.statuses (name, color, sort_order, is_default) VALUES 
    ('На модерації', '#f59e0b', 1, true),
    ('Опубліковано', '#22c55e', 2, false),
    ('Відхилено', '#ef4444', 3, false),
    ('Архівовано', '#6b7280', 4, false);

-- ============================================
-- DEFAULT DATA: FIELDS
-- ============================================
INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options) VALUES 
    ('composer', 'Композитор', 'text', false, 'release', 1, true, ''),
    ('performer', 'Виконавець', 'text', false, 'release', 2, true, ''),
    ('label', 'Лейбл', 'text', false, 'release', 3, true, ''),
    ('isrc', 'ISRC', 'text', false, 'release', 4, true, ''),
    ('upc', 'UPC/EAN', 'text', false, 'release', 5, true, ''),
    ('explicit', 'Explicit контент', 'checkbox', false, 'release', 6, true, ''),
    ('copyrights', 'Copyright', 'textarea', false, 'release', 7, true, '');

-- ============================================
-- DEFAULT DATA: APP CONFIG
-- ============================================
INSERT INTO public.app_config (id, settings, home_page, admin_panel, login_page, label_socials) VALUES (1,
    '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
    '{"heroTitle": "Твоя музика. Скрізь.", "heroSubtitle": "Дистрибуція на 150+ платформ.", "buttonText": "Почати", "primaryColor": "#ef4444"}',
    '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
    '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "socialIcons": []}',
    '[]'
);

-- ============================================
-- DEFAULT DATA: ADMIN LINKS
-- ============================================
INSERT INTO public.admin_links (title, url, icon, sort_order, is_active) VALUES
    ('Discord', 'https://discord.gg/', '💬', 1, true),
    ('Drive', 'https://drive.google.com/', '📁', 2, true),
    ('YouTube', 'https://youtube.com/', '▶️', 3, true);

-- ============================================
-- STORAGE BUCKETS
-- NOTE: Create these manually in Supabase Dashboard > Storage
-- Required buckets:
--   - avatars (public)
--   - covers (public)
--   - releases (public)
--   - files (public)
-- ============================================