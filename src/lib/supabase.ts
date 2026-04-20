import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : ({} as SupabaseClient);

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

export interface AppUser {
  id: string;
  login: string;
  email?: string;
  role: 'admin' | 'artist';
  artistName: string | null;
  balance: number;
  isVerified: boolean;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
  avatarLocal?: string; // Нове поле
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'artist';
  balance: number;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  artist_name?: string;
  bio?: string;
  avatar_url?: string;
  avatar_local?: string; // Нове поле
}

export const toAppProfile = (dbProfile: Profile): AppUser => ({
  id: dbProfile.id,
  login: dbProfile.email,
  email: dbProfile.email,
  role: dbProfile.role,
  artistName: dbProfile.full_name || dbProfile.artist_name || null,
  balance: dbProfile.balance || 0,
  isVerified: dbProfile.is_verified || false,
  createdAt: dbProfile.created_at,
  bio: dbProfile.bio,
  avatarUrl: dbProfile.avatar_url,
  avatarLocal: dbProfile.avatar_local,
});

export interface Release {
  id: string;
  userId: string;
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  coverUrl: string;
  coverImageLocal?: string; // Нове поле
  status: string;
  streams: number;
  history: { date: string; count: number }[];
  createdAt: string;
  composer?: string;
  performer?: string;
  label?: string;
  description?: string;
  explicit?: boolean;
  isSingle?: boolean;
  isrc?: string;
  upc?: string;
  tracks?: any[];
  copyrights?: string;
  copyrightConfirmed?: boolean;
  distributor?: string;
  rejection_reason?: string;
}

export interface SmartLink {
  id: string;
  userId: string;
  releaseId: string | null;
  title: string;
  artist: string;
  coverUrl: string;
  avatarLocal?: string; // Нове поле
  slug: string;
  platforms: any[];
  clicks: number;
  createdAt: string;
}

export interface ArtistWebsite {
  id: string;
  userId: string;
  title: string;
  slug: string;
  stageName: string;
  bio: string;
  photoUrl: string;
  siteAvatarLocal?: string; // Нове поле
  links: any[];
  createdAt: string;
}

export const uploadFile = async (bucket: string, path: string, file: File): Promise<string> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  const sanitizedPath = path.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "-");

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(sanitizedPath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (error) {
    console.error('Supabase Storage Error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};