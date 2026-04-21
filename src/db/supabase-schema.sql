-- ============================================
-- ЖУРБА MUSIC - База данных Schema
-- ============================================

-- ============================================
-- 1. PROFILES (расширение auth.users)
-- ============================================
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

-- ============================================
-- 2. RELEASES
-- ============================================
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

-- ============================================
-- 3. SMART_LINKS
-- ============================================
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

-- ============================================
-- 4. ARTIST_WEBSITES
-- ============================================
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

-- ============================================
-- 5. TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payout')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. WITHDRAWAL_REQUESTS
-- ============================================
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

-- ============================================
-- 7. QUARTERLY_REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.quarterly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. STATUSES
-- ============================================
CREATE TABLE IF NOT EXISTS public.statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6b7280',
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false
);

-- ============================================
-- 9. FIELDS
-- ============================================
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

-- ============================================
-- 10. APP_CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB DEFAULT '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
    home_page JSONB DEFAULT '{"heroTitle": "Твоя музика. Скрізь.", "heroSubtitle": "Дистрибуція на 150+ платформ.", "buttonText": "Почати", "primaryColor": "#ef4444"}',
    admin_panel JSONB DEFAULT '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
    login_page JSONB DEFAULT '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "socialIcons": []}',
    label_socials JSONB DEFAULT '[]'
);

-- ============================================
-- 11. TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 12. REVENUE_STREAMS (для аналитики)
-- ============================================
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

-- ============================================
-- 13. PLATFORM_LINKS (ссылки на платформы)
-- ============================================
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
-- INDEXES для оптимизации
-- ============================================
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON public.releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON public.releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_releases_genre ON public.releases(genre);

CREATE INDEX IF NOT EXISTS idx_smart_links_user_id ON public.smart_links(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON public.smart_links(slug);

CREATE INDEX IF NOT EXISTS idx_artist_websites_user_id ON public.artist_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON public.artist_websites(slug);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

CREATE INDEX IF NOT EXISTS idx_revenue_streams_user_id ON public.revenue_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_release_id ON public.revenue_streams(release_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_platform ON public.revenue_streams(platform);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_period ON public.revenue_streams(period);

CREATE INDEX IF NOT EXISTS idx_platform_links_user_id ON public.platform_links(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_links_release_id ON public.platform_links(release_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Автоматическое создание профиля при регистрации
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

-- Обновление updated_at для профилей
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
CREATE TRIGGER on_profile_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_links ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RELEASES policies
DROP POLICY IF EXISTS "Users can view own releases" ON public.releases;
CREATE POLICY "Users can view own releases" ON public.releases
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own releases" ON public.releases;
CREATE POLICY "Users can insert own releases" ON public.releases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own releases" ON public.releases;
CREATE POLICY "Users can update own releases" ON public.releases
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own releases" ON public.releases;
CREATE POLICY "Users can delete own releases" ON public.releases
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all releases" ON public.releases;
CREATE POLICY "Admins can view all releases" ON public.releases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all releases" ON public.releases;
CREATE POLICY "Admins can update all releases" ON public.releases
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete all releases" ON public.releases;
CREATE POLICY "Admins can delete all releases" ON public.releases
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SMART_LINKS policies
DROP POLICY IF EXISTS "Users can manage own smart links" ON public.smart_links;
CREATE POLICY "Users can manage own smart links" ON public.smart_links
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view smart links" ON public.smart_links;
CREATE POLICY "Everyone can view smart links" ON public.smart_links
    FOR SELECT USING (true);

-- ARTIST_WEBSITES policies
DROP POLICY IF EXISTS "Users can manage own artist websites" ON public.artist_websites;
CREATE POLICY "Users can manage own artist websites" ON public.artist_websites
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view artist websites" ON public.artist_websites;
CREATE POLICY "Everyone can view artist websites" ON public.artist_websites
    FOR SELECT USING (true);

-- TRANSACTIONS policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- WITHDRAWAL_REQUESTS policies
DROP POLICY IF EXISTS "Users can manage own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can manage own withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- QUARTERLY_REPORTS policies
DROP POLICY IF EXISTS "Users can manage own reports" ON public.quarterly_reports;
CREATE POLICY "Users can manage own reports" ON public.quarterly_reports
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON public.quarterly_reports;
CREATE POLICY "Admins can view all reports" ON public.quarterly_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- REVENUE_STREAMS policies
DROP POLICY IF EXISTS "Users can view own revenue streams" ON public.revenue_streams;
CREATE POLICY "Users can view own revenue streams" ON public.revenue_streams
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own revenue streams" ON public.revenue_streams;
CREATE POLICY "Users can insert own revenue streams" ON public.revenue_streams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all revenue streams" ON public.revenue_streams;
CREATE POLICY "Admins can manage all revenue streams" ON public.revenue_streams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PLATFORM_LINKS policies
DROP POLICY IF EXISTS "Users can manage own platform links" ON public.platform_links;
CREATE POLICY "Users can manage own platform links" ON public.platform_links
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view platform links" ON public.platform_links;
CREATE POLICY "Everyone can view platform links" ON public.platform_links
    FOR SELECT USING (true);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Статусы релизов (только если таблица пустая)
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

-- Конфигурация приложения (только если пусто)
INSERT INTO public.app_config (id, settings, home_page, admin_panel, login_page, label_socials)
SELECT 1, 
    '{"siteName": "ЖУРБА MUSIC", "registrationEnabled": true, "contactEmail": "support@jurba.music"}',
    '{"heroTitle": "Твоя музика. Скрізь.", "heroSubtitle": "Дистрибуція на 150+ платформ.", "buttonText": "Почати", "primaryColor": "#ef4444"}',
    '{"logoText": "ЖУРБА", "accentColor": "#ef4444"}',
    '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "socialIcons": []}',
    '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.app_config WHERE id = 1);

-- Дефолтные поля для релизов
INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'composer', 'Композитор', 'text', false, 'release', 1, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'composer');

INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'performer', 'Виконавець', 'text', false, 'release', 2, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'performer');

INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'label', 'Лейбл', 'text', false, 'release', 3, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'label');

INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'isrc', 'ISRC', 'text', false, 'release', 4, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'isrc');

INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'upc', 'UPC/EAN', 'text', false, 'release', 5, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'upc');

INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'explicit', 'Explicit контент', 'checkbox', false, 'release', 6, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'explicit');

INSERT INTO public.fields (name, label, type, required, section, sort_order, visible, options)
SELECT 'copyrights', 'Copyright', 'textarea', false, 'release', 7, true, ''
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name = 'copyrights');

-- ============================================
-- STORAGE BUCKETS (выполняется отдельно через UI)
-- ============================================

-- Вручную создайте в Supabase Storage следующие buckets:
-- - avatars (public: true)
-- - covers (public: true)
-- - releases (public: true)
-- - files (public: true)

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Функция для генерации slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_slug TEXT, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    new_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.smart_links WHERE slug = new_slug AND user_id = user_id_param) LOOP
        new_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для генерации slug для artist websites
CREATE OR REPLACE FUNCTION public.generate_unique_website_slug(base_slug TEXT, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    new_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.artist_websites WHERE slug = new_slug AND user_id = user_id_param) LOOP
        new_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки прав администратора
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id_param AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS (выполняется автоматически Supabase)
-- ============================================