"use client";

import { createClient } from '@supabase/supabase-js';

// Використовуємо змінні оточення для безпеки при деплої
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eufiqqflkrpttusrfvru.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZmlxcWZsa3JwdHR1c3JmdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI0MjAsImV4cCI6MjA5MTcwODQyMH0.T6zPiFY548f_9pn6gd_i7ZZ2Nfh94XQaL4t3Z_bvU5M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};