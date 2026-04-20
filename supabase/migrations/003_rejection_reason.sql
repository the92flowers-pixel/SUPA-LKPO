-- Додавання поля для причини відхилення релізу
ALTER TABLE releases ADD COLUMN IF NOT EXISTS rejection_reason TEXT;