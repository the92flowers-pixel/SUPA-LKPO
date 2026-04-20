-- Створення таблиці завдань та нотаток
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Додавання поля дистриб'ютора до релізів
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='distributor') THEN
    ALTER TABLE releases ADD COLUMN distributor TEXT;
  END IF;
END $$;

-- Увімкнення RLS для завдань
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Політика: тільки адміни можуть керувати завданнями
CREATE POLICY "Admins can manage tasks" ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );