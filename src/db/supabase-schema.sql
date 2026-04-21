-- ============================================
-- ЖУРБА MUSIC - База данных (Simplified)
-- ============================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. RELEASES
CREATE TABLE IF NOT EXISTS public.releases (
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

-- 3. SMART_LINKS
CREATE TABLE IF NOT EXISTS public.smart_links (
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

-- 4. ARTIST_WEBSITES
CREATE TABLE IF NOT EXISTS public.artist_websites (
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

-- 5. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payout')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. WITHDRAWAL_REQUESTS
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    contact_info TEXT NOT NULL,
    confirmation_agreed BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    admin_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. QUARTERLY_REPORTS
CREATE TABLE IF NOT EXISTS public.quarterly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. STATUSES
CREATE TABLE IF NOT EXISTS public.statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6b7280',
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false
);

-- 9. FIELDS
CREATE TABLE IF NOT EXISTS public.fields (
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

-- 10. APP_CONFIG
CREATE TABLE IF NOT EXISTS public.app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB DEFAULT '{}',
    home_page JSONB DEFAULT '{}',
    admin_panel JSONB DEFAULT '{}',
    login_page JSONB DEFAULT '{}',
    label_socials JSONB DEFAULT '[]'
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. REVENUE_STREAMS
CREATE TABLE IF NOT EXISTS public.revenue_streams (
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

-- 13. PLATFORM_LINKS
CREATE TABLE IF NOT EXISTS public.platform_links (
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
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON public.releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON public.releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_links_user_id ON public.smart_links(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON public.smart_links(slug);
CREATE INDEX IF NOT EXISTS idx_artist_websites_user_id ON public.artist_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON public.artist_websites(slug);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_user_id ON public.revenue_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_release_id ON public.revenue_streams(release_id);
CREATE INDEX IF NOT EXISTS idx_platform_links_user_id ON public.platform_links(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_links_release_id ON public.platform_links(release_id);

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
-- RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_links ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Releases RLS
CREATE POLICY "releases_select" ON public.releases FOR SELECT USING (true);
CREATE POLICY "releases_insert" ON public.releases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "releases_update" ON public.releases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "releases_delete" ON public.releases FOR DELETE USING (auth.uid() = user_id);

-- Smart Links RLS
CREATE POLICY "smart_links_select" ON public.smart_links FOR SELECT USING (true);
CREATE POLICY "smart_links_all" ON public.smart_links FOR ALL USING (auth.uid() = user_id);

-- Artist Websites RLS
CREATE POLICY "artist_websites_select" ON public.artist_websites FOR SELECT USING (true);
CREATE POLICY "artist_websites_all" ON public.artist_websites FOR ALL USING (auth.uid() = user_id);

-- Transactions RLS
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawal Requests RLS
CREATE POLICY "withdrawal_requests_select" ON public.withdrawal_requests FOR SELECT USING (true);
CREATE POLICY "withdrawal_requests_all" ON public.withdrawal_requests FOR ALL USING (auth.uid() = user_id);

-- Quarterly Reports RLS
CREATE POLICY "quarterly_reports_select" ON public.quarterly_reports FOR SELECT USING (true);
CREATE POLICY "quarterly_reports_all" ON public.quarterly_reports FOR ALL USING (auth.uid() = user_id);

-- Revenue Streams RLS
CREATE POLICY "revenue_streams_select" ON public.revenue_streams FOR SELECT USING (true);
CREATE POLICY "revenue_streams_insert" ON public.revenue_streams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "revenue_streams_update" ON public.revenue_streams FOR UPDATE USING (auth.uid() = user_id);

-- Platform Links RLS
CREATE POLICY "platform_links_select" ON public.platform_links FOR SELECT USING (true);
CREATE POLICY "platform_links_all" ON public.platform_links FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT DATA
-- ============================================
INSERT INTO public.statuses (name, color, sort_order, is_default)
SELECT 'На модерації', '#f59e0b', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.statuses WHERE name = 'На модерації');

INSERT INTO public.statuses (name, color, sort_order, is_default)
SELECT 'Опубліковано', '#22c55e', 2, false
WHERE NOT EXISTS (SELECT 1 FROM public.statuses WHERE name = 'Опубліковано');

INSERT INTO public.statuses (name, color, sort_order, is_default)
SELECT 'Відхилено', '#ef4444', 3, false
WHERE NOT EXISTS (SELECT 1 FROM public.statuses WHERE name = 'Відхилено');

INSERT INTO public.statuses (name, color, sort_order, is_default)
SELECT 'Архівовано', '#6b7280', 4, false
WHERE NOT EXISTS (SELECT 1 FROM public.statuses WHERE name = 'Архівовано');

INSERT INTO public.app_config (id, settings, home_page, admin_panel, login_page, label_socials)
SELECT 1, '{}', '{}', '{}', '{}', '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.app_config WHERE id = 1);