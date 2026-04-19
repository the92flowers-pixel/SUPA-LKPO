-- =============================================
-- ЖУРБА MUSIC - Database Schema
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
-- RELEASES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS smart_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS artist_websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'adjustment')),
    amount NUMERIC NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WITHDRAWAL REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS quarterly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Releases policies
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
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all releases" ON releases
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Smart links policies
CREATE POLICY "Users can manage own smart links" ON smart_links
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all smart links" ON smart_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Artist websites policies
CREATE POLICY "Users can manage own websites" ON artist_websites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view artist websites" ON artist_websites
    FOR SELECT USING (TRUE);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" ON transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Withdrawal requests policies
CREATE POLICY "Users can view own withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert withdrawal requests" ON withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests" ON withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Quarterly reports policies
CREATE POLICY "Users can view own reports" ON quarterly_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert reports" ON quarterly_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reports" ON quarterly_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Statuses policies (public read)
CREATE POLICY "Everyone can view statuses" ON statuses
    FOR SELECT USING (TRUE);

-- Fields policies (public read)
CREATE POLICY "Everyone can view fields" ON fields
    FOR SELECT USING (TRUE);

-- App config policies (public read, admin write)
CREATE POLICY "Everyone can view app config" ON app_config
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update app config" ON app_config
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON smart_links(slug);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON artist_websites(slug);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_reports_user_id ON quarterly_reports(user_id);