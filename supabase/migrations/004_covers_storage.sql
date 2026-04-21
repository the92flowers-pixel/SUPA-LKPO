-- =====================================================
-- MIGRATION: Storage Bucket Configuration & RLS Policies
-- =====================================================
-- NOTE: Buckets must be created via Supabase Dashboard: Storage -> New Bucket
-- This SQL creates policies for existing buckets

-- 1. First, ensure buckets exist by inserting them (will be skipped if exists)
-- Run this in SQL Editor - buckets must be created manually in Dashboard:
-- Storage -> Create new bucket -> Set name and make public

-- 2. Enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for releases table to handle cover_url
-- This ensures covers are properly stored and retrieved

-- 4. Storage policies (for buckets that already exist)
-- These policies allow authenticated users to manage their own files

-- Allow public read access to all public buckets
CREATE POLICY "Public read access for covers"
ON storage.objects FOR SELECT
USING (bucket_id IN ('covers', 'avatars', 'smartlinks', 'artist-sites'));

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('covers', 'avatars', 'smartlinks', 'artist-sites')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('covers', 'avatars', 'smartlinks', 'artist-sites')
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('covers', 'avatars', 'smartlinks', 'artist-sites')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('covers', 'avatars', 'smartlinks', 'artist-sites')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin policies (users with admin role can manage all files)
CREATE POLICY "Admins can view all storage"
ON storage.objects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert all storage"
ON storage.objects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all storage"
ON storage.objects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all storage"
ON storage.objects FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);