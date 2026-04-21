-- Migration: Add AdminLink model for external admin links with drag-drop ordering
-- This migration adds a new table for managing external links in the admin panel

-- Create admin_links table
CREATE TABLE IF NOT EXISTS "admin_links" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT DEFAULT '🔗',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS "admin_links_sort_order_idx" ON "admin_links"("sort_order" ASC);

-- Create index for filtering active links
CREATE INDEX IF NOT EXISTS "admin_links_active_idx" ON "admin_links"("is_active" ASC);

-- Insert default admin links if table is empty
INSERT INTO "admin_links" ("title", "url", "icon", "sort_order", "is_active")
SELECT 
    "title", "url", "icon", "sort_order", "is_active"
FROM (VALUES 
    ('Google Drive', 'https://drive.google.com', '📁', 1, true),
    ('Slack', 'https://slack.com', '💬', 2, true),
    ('GitHub', 'https://github.com', '🐙', 3, true)
) AS defaults(title, url, icon, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM "admin_links");