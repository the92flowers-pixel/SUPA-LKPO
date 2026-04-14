-- 1. Таблицы для Смарт-линков и Сайтов артистов
CREATE TABLE IF NOT EXISTS public.smart_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  cover_url TEXT,
  platforms JSONB DEFAULT '[]'::jsonb, -- [{name: 'Spotify', url: '...'}, ...]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.artist_websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  config JSONB DEFAULT '{}'::jsonb, -- Цвета, секции, контент
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица настроек системы (только для админа)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Включение RLS
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4. Политики безопасности

-- Smart Links: Публичный просмотр по slug, управление только владельцем или админом
CREATE POLICY "Public view smart links" ON public.smart_links FOR SELECT USING (true);
CREATE POLICY "Manage own smart links" ON public.smart_links 
FOR ALL USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Artist Websites: Публичный просмотр, управление владельцем или админом
CREATE POLICY "Public view websites" ON public.artist_websites FOR SELECT USING (true);
CREATE POLICY "Manage own websites" ON public.artist_websites 
FOR ALL USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- System Settings: Только админ может всё, остальные только читать (если нужно)
CREATE POLICY "Admin manage settings" ON public.system_settings 
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Public read settings" ON public.system_settings FOR SELECT USING (true);

-- 5. Индексы для быстрого поиска по slug
CREATE INDEX IF NOT EXISTS idx_smart_links_slug ON public.smart_links(slug);
CREATE INDEX IF NOT EXISTS idx_artist_websites_slug ON public.artist_websites(slug);
