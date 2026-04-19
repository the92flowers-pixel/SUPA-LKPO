-- Releases table
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  genre TEXT DEFAULT 'Другое',
  release_date TEXT DEFAULT CURRENT_DATE,
  cover_url TEXT DEFAULT '',
  audio_url TEXT DEFAULT '',
  status TEXT DEFAULT 'На модерації',
  streams INTEGER DEFAULT 0,
  history JSONB DEFAULT '[]',
  composer TEXT DEFAULT '',
  performer TEXT DEFAULT '',
  label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  explicit BOOLEAN DEFAULT false,
  is_single BOOLEAN DEFAULT true,
  isrc TEXT DEFAULT '',
  tracks JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own releases
CREATE POLICY "Users can view own releases" ON releases
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own releases
CREATE POLICY "Users can insert own releases" ON releases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all releases
CREATE POLICY "Admins can view all releases" ON releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update releases
CREATE POLICY "Admins can update releases" ON releases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to delete releases
CREATE POLICY "Admins can delete releases" ON releases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);