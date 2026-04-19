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
  password?: string;
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
});

export interface Track {
  id?: string;
  title: string;
  fileName: string;
  audioUrl?: string;
  duration?: string;
  explicit?: boolean;
  lyrics?: string;
  position?: number;
}

export interface Release {
  id: string;
  user_id?: string;
  userId: string;
  title: string;
  artist: string;
  genre: string;
  release_date?: string;
  releaseDate: string;
  cover_url?: string;
  coverUrl: string;
  release_url?: string;
  releaseUrl?: string;
  audio_url?: string;
  status: string;
  deletion_status?: 'pending' | null;
  streams: number;
  history: { date: string; count: number }[];
  created_at?: string;
  createdAt: string;
  composer?: string;
  performer?: string;
  label?: string;
  description?: string;
  explicit?: boolean;
  isSingle?: boolean;
  isrc?: string;
  upc?: string;
  tracks?: Track[];
  copyrights?: string;
  copyrightConfirmed?: boolean;
}

export interface SmartLink {
  id: string;
  user_id?: string;
  userId: string;
  release_id?: string;
  releaseId: string | null;
  title: string;
  artist: string;
  cover_url?: string;
  coverUrl: string;
  slug: string;
  platforms: SmartLinkPlatform[];
  clicks: number;
  created_at?: string;
  createdAt: string;
}

export interface SmartLinkPlatform {
  id?: string;
  name: string;
  url: string;
  active?: boolean;
  icon?: string;
}

export interface ArtistWebsite {
  id: string;
  user_id?: string;
  userId: string;
  title: string;
  slug: string;
  stageName: string;
  bio: string;
  photo_url?: string;
  photoUrl: string;
  links: WebsiteLink[];
  created_at?: string;
  createdAt: string;
}

export interface WebsiteLink {
  id: string;
  name: string;
  url: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'adjustment';
  amount: number;
  description: string;
  status?: 'completed' | 'pending' | 'cancelled';
  created_at?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id?: string;
  userId: string;
  amount: number;
  status: 'pending' | 'paid' | 'approved' | 'rejected';
  contactInfo?: string;
  confirmationAgreed?: boolean;
  admin_comment?: string;
  created_at?: string;
  createdAt: string;
}

export interface QuarterlyReport {
  id: string;
  user_id?: string;
  userId: string;
  title?: string;
  quarter: number;
  year: number;
  fileUrl: string;
  file_url?: string;
  fileName?: string;
  created_at?: string;
  createdAt: string;
}

export interface Status {
  id?: number;
  name: string;
  color: string;
  order: number;
  sort_order?: number;
  isDefault: boolean;
  is_default?: boolean;
}

export interface Field {
  id?: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  forRole?: string;
  order: number;
  sort_order?: number;
  visible: boolean;
  options?: string;
  fileTypes?: string;
  maxSize?: string;
}

export interface LabelSocial {
  id: string;
  name: string;
  url: string;
  platform?: string;
}

export interface AppConfig {
  id?: number;
  settings: { siteName: string; registrationEnabled: boolean; contactEmail: string };
  home_page: { heroTitle: string; heroSubtitle: string; buttonText: string; primaryColor: string };
  admin_panel: { logoText: string; accentColor: string };
  login_page: {
    logoText: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    socialIcons: string[];
  };
  label_socials: LabelSocial[];
  labelSocials: LabelSocial[];
  fields: Field[];
  statuses: Status[];
}

export const uploadFile = async (bucket: string, path: string, file: File): Promise<string> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  const fileExt = file.name.split('.').pop();
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