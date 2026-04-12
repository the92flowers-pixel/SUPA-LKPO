import { createClient } from '@supabase/supabase-js';

// Эти переменные будут заполнены автоматически после того, как вы настроите интеграцию Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ВАЖНО: Настоящая безопасность обеспечивается на стороне сервера (Supabase RLS).
 * Этот клиент используется для аутентификации и запросов к БД.
 */
