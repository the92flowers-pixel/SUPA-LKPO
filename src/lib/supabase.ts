import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-client-info': 'zhurba-music',
        },
      },
    })
  : ({} as SupabaseClient);

// Debug helper
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Database types (snake_case from PostgreSQL)
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'artist';
  balance: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Convert DB profile to app profile
export const toAppProfile = (dbProfile: Profile) => ({
  id: dbProfile.id,
  email: dbProfile.email,
  login: dbProfile.email,
  role: dbProfile.role,
  artistName: dbProfile.full_name,
  balance: dbProfile.balance,
  isVerified: dbProfile.is_verified,
  createdAt: dbProfile.created_at,
});

export interface Release {
  id: string;
  user_id: string;
  artist_id: string;
  title: string;
  genre: string;
  release_date: string;
  cover_url: string;
  status: string;
  streams: number;
  history: { date: string; count: number }[];
  created_at: string;
}

export interface SmartLink {
  id: string;
  user_id: string;
  artist_id: string;
  release_id: string | null;
  title: string;
  artist: string;
  cover_url: string;
  slug: string;
  platforms: { name: string; url: string; active: boolean }[];
  clicks: number;
  created_at: string;
}

export interface ArtistWebsite {
  id: string;
  user_id: string;
  artist_id: string;
  title: string;
  slug: string;
  socials: { name: string; url: string }[];
  bio: string;
  photo_url: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_comment?: string;
}

export interface QuarterlyReport {
  id: string;
  title: string;
  period: string;
  streams: number;
  revenue: number;
  user_id: string;
  created_at: string;
}

export interface Status {
  id?: number;
  name: string;
  sort_order: number;
}

export interface Field {
  id?: number;
  name: string;
  type: string;
  required: boolean;
  sort_order: number;
}

export interface LabelSocial {
  platform: string;
  url: string;
}

export interface AppConfig {
  id?: number;
  settings: { siteName: string; registrationEnabled: boolean; contactEmail: string };
  home_page: { heroTitle: string; heroSubtitle: string; buttonText: string; primaryColor: string };
  admin_panel: { logoText: string; accentColor: string };
  login_page: { logoText: string; welcomeTitle: string; welcomeSubtitle: string; socialIcons: string[] };
  label_socials: LabelSocial[];
  fields: Field[];
  statuses: Status[];
}

// Helper functions for uploads
export const uploadFile = async (bucket: string, path: string, file: File): Promise<string> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Please add your Supabase credentials to .env file.');
  }
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};