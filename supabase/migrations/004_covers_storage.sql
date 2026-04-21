-- =====================================================
-- MIGRATION: Covers Storage Setup & RLS Policies
-- =====================================================

-- 1. Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('covers', 'covers', true, 7340032, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('smartlinks', 'smartlinks', true, 7340032, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('artist-sites', 'artist-sites', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for covers bucket
-- Everyone can view covers (public read)
CREATE POLICY "Public covers are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

-- Authenticated users can upload covers to their own folder
CREATE POLICY "Users can upload their own covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own covers
CREATE POLICY "Users can update their own covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own covers
CREATE POLICY "Users can delete their own covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Create policies for avatars bucket
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Create policies for smartlinks bucket
CREATE POLICY "Public smartlinks images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'smartlinks');

CREATE POLICY "Users can upload their own smartlink images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'smartlinks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own smartlink images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'smartlinks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'smartlinks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Create policies for artist-sites bucket
CREATE POLICY "Public artist sites images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-sites');

CREATE POLICY "Users can upload their own artist site images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artist-sites' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own artist site images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artist-sites' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'artist-sites' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Admin policies (for admin users to manage all)
CREATE POLICY "Admins can view all storage objects"
ON storage.objects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert all storage objects"
ON storage.objects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all storage objects"
ON storage.objects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all storage objects"
ON storage.objects FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects(created_at DESC);