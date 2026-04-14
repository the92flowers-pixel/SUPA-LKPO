-- 1. Таблиця профілів користувачів
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  login TEXT,
  role TEXT DEFAULT 'artist',
  artist_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблиця релізів
CREATE TABLE IF NOT EXISTS releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  release_date DATE,
  cover_url TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'На модерації',
  streams BIGINT DEFAULT 0,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблиця смартлінків
CREATE TABLE IF NOT EXISTS smart_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES releases ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  artist TEXT,
  cover_url TEXT,
  platforms JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Таблиця сайтів артистів
CREATE TABLE IF NOT EXISTS artist_websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  stage_name TEXT,
  bio TEXT,
  photo_url TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Таблиця транзакцій (баланс)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL, -- deposit, withdrawal, admin_adjust
  status TEXT DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Таблиця заявок на вивід
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  contact_info TEXT,
  confirmation_agreed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Таблиця квартальних звітів
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  quarter INTEGER,
  year INTEGER,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Системні налаштування (дизайн, контент)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- 9. Динамічні поля форм
CREATE TABLE IF NOT EXISTS dynamic_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT,
  type TEXT,
  required BOOLEAN DEFAULT false,
  section TEXT,
  for_role TEXT,
  sort_order INTEGER,
  visible BOOLEAN DEFAULT true,
  options JSONB,
  file_types TEXT,
  max_size TEXT
);

-- 10. Статуси релізів
CREATE TABLE IF NOT EXISTS release_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  sort_order INTEGER,
  is_default BOOLEAN DEFAULT false
);

-- ТРИГЕР ДЛЯ АВТОМАТИЧНОГО СТВОРЕННЯ ПРОФІЛЮ ПРИ РЕЄСТРАЦІЇ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, login, artist_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'artistName', 'artist');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ПОЧАТКОВІ ДАНІ
INSERT INTO release_statuses (name, color, sort_order, is_default) VALUES
('На модерації', 'yellow', 1, true),
('Опубліковано', 'green', 2, false),
('Відхилено', 'red', 3, false)
ON CONFLICT DO NOTHING;

INSERT INTO system_settings (key, value) VALUES
('login_config', '{"logoText": "ЖУРБА MUSIC", "welcomeTitle": "Ласкаво просимо", "welcomeSubtitle": "Увійдіть, щоб продовжити", "leftTitle": "Твоя музика.", "leftText1": "Скрізь.", "leftText2": "Дистрибуція на 150+ стрімінгових платформ. Залишай собі 100% роялті.", "primaryColor": "#8b5cf6", "secondaryColor": "#1e1e2f", "socialIcons": ["Spotify", "Apple Music"]}'::jsonb),
('home_config', '{"heroTitle": "МУЗИКА ТВОЄЇ ДУШІ.", "heroSubtitle": "Ми — прихисток для справжнього мистецтва.", "buttonText": "Почати шлях", "primaryColor": "#b91c1c"}'::jsonb),
('admin_config', '{"accentColor": "#b91c1c", "logoText": "ЖУРБА"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;