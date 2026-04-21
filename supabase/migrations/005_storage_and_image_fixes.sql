-- ============================================
-- SQL MIGRATION FOR IMAGE STORAGE FIXES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('smartlinks', 'smartlinks', true),
  ('artist-sites', 'artist-sites', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for public access

-- Avatars bucket policies
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY "Public upload access for avatars" ON storage.objects;
CREATE POLICY "Public upload access for avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY "Public update access for avatars" ON storage.objects;
CREATE POLICY "Public update access for avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

DROP POLICY "Public delete access for avatars" ON storage.objects;
CREATE POLICY "Public delete access for avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');

-- Covers bucket policies
DROP POLICY IF EXISTS "Public read access for covers" ON storage.objects;
CREATE POLICY "Public read access for covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

DROP POLICY "Public upload access for covers" ON storage.objects;
CREATE POLICY "Public upload access for covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers');

DROP POLICY "Public update access for covers" ON storage.objects;
CREATE POLICY "Public update access for covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers');

DROP POLICY "Public delete access for covers" ON storage.objects;
CREATE POLICY "Public delete access for covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers');

-- Smartlinks bucket policies
DROP POLICY IF EXISTS "Public read access for smartlinks" ON storage.objects;
CREATE POLICY "Public read access for smartlinks" ON storage.objects
  FOR SELECT USING (bucket_id = 'smartlinks');

DROP POLICY "Public upload access for smartlinks" ON storage.objects;
CREATE POLICY "Public upload access for smartlinks" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'smartlinks');

DROP POLICY "Public update access for smartlinks" ON storage.objects;
CREATE POLICY "Public update access for smartlinks" ON storage.objects
  FOR UPDATE USING (bucket_id = 'smartlinks');

DROP POLICY "Public delete access for smartlinks" ON storage.objects;
CREATE POLICY "Public delete access for smartlinks" ON storage.objects
  FOR DELETE USING (bucket_id = 'smartlinks');

-- Artist sites bucket policies
DROP POLICY IF EXISTS "Public read access for artist-sites" ON storage.objects;
CREATE POLICY "Public read access for artist-sites" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-sites');

DROP POLICY "Public upload access for artist-sites" ON storage.objects;
CREATE POLICY "Public upload access for artist-sites" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artist-sites');

DROP POLICY "Public update access for artist-sites" ON storage.objects;
CREATE POLICY "Public update access for artist-sites" ON storage.objects
  FOR UPDATE USING (bucket_id = 'artist-sites');

DROP POLICY "Public delete access for artist-sites" ON storage.objects;
CREATE POLICY "Public delete access for artist-sites" ON storage.objects
  FOR DELETE USING (bucket_id = 'artist-sites');

-- 3. Add CORS headers to storage (run via Edge Function or use dashboard)
-- The storage API already has CORS enabled by default in Supabase

-- 4. Create function to generate unique filenames
CREATE OR REPLACE FUNCTION generate_unique_filename(bucket_name TEXT, user_id TEXT, file_extension TEXT)
RETURNS TEXT AS $$
DECLARE
  unique_id TEXT;
  timestamp_val BIGINT;
BEGIN
  timestamp_val := floor(extract(epoch from now()))::BIGINT;
  unique_id := md5(random()::TEXT || now()::TEXT);
  RETURN bucket_name || '/' || user_id || '/' || timestamp_val || '_' || unique_id || '.' || file_extension;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to clean old uploads (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_uploads(bucket_name TEXT, days_old INTEGER DEFAULT 7)
RETURNS VOID AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = bucket_name
    AND created_at < now() - (days_old || ' days')::INTERVAL
    AND name NOT LIKE '%/avatar%'  -- Keep avatars
    AND name NOT LIKE '%/cover%';  -- Keep covers
END;
$$ LANGUAGE plpgsql;

-- 6. Add indexes for better performance on image lookups
CREATE INDEX IF NOT EXISTS idx_releases_cover_url ON releases(cover_url) WHERE cover_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_releases_cover_local ON releases(cover_image_local) WHERE cover_image_local IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_local ON profiles(avatar_local) WHERE avatar_local IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_smart_links_cover ON smart_links(cover_url) WHERE cover_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_smart_links_avatar_local ON smart_links(avatar_local) WHERE avatar_local IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_artist_websites_photo ON artist_websites(photo_url) WHERE photo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_artist_websites_avatar_local ON artist_websites(site_avatar_local) WHERE site_avatar_local IS NOT NULL;

-- 7. Grant permissions for service role to manage storage (if needed)
-- This is usually already set up by Supabase

-- 8. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE releases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE smart_links ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE artist_websites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_releases_updated_at ON releases;
CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_smart_links_updated_at ON smart_links;
CREATE TRIGGER update_smart_links_updated_at
  BEFORE UPDATE ON smart_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artist_websites_updated_at ON artist_websites;
CREATE TRIGGER update_artist_websites_updated_at
  BEFORE UPDATE ON artist_websites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Verify storage is working
-- SELECT * FROM storage.buckets WHERE name IN ('avatars', 'covers', 'smartlinks', 'artist-sites');