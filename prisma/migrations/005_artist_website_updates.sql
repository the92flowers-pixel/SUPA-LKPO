-- Migration: Update ArtistWebsite model and add siteAvatarLocal field
-- This migration ensures all artist websites have proper fields

ALTER TABLE "artist_websites" ADD COLUMN IF NOT EXISTS "site_avatar_local" TEXT;
ALTER TABLE "artist_websites" ADD COLUMN IF NOT EXISTS "photo_url" TEXT;