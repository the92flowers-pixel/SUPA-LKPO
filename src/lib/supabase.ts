"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eufiqqflkrpttusrfvru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZmlxcWZsa3JwdHR1c3JmdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI0MjAsImV4cCI6MjA5MTcwODQyMH0.T6zPiFY548f_9pn6gd_i7ZZ2Nfh94XQaL4t3Z_bvU5M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Функція для завантаження файлів у Supabase Storage
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

/**
 * RPC для збільшення лічильника кліків (потрібно створити функцію в SQL Editor)
 */
export const incrementClicks = async (linkId: string) => {
  const { error } = await supabase.rpc('increment_clicks', { link_id: linkId });
  if (error) console.error('Error incrementing clicks:', error);
};