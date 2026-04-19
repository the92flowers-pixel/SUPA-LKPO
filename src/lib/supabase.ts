import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// App User type (camelCase)
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

// Profile type (snake_case from DB)
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

export const toAppProfile = (dbProfile: Profile): AppUser => ({
  id: dbProfile.id,
  login: dbProfile.email,
  email: dbProfile.email,
  role: dbProfile.role,
  artistName: dbProfile.full_name,
  balance: dbProfile.balance,
  isVerified: dbProfile.is_verified,
  createdAt: dbProfile.created_at,
});

// Release type (camelCase for app)
export interface Release {
  id: string;
  user_id: string;
  userId: string;
  artist_id: string;
  artist: string;
  title: string;
  genre: string;
  release_date: string;
  releaseDate: string;
  cover_url: string;
  coverUrl: string;
  audioUrl?: string;
  audio_url?: string;
  status: string;
  streams: number;
  history: { date: string; count: number }[];
  created_at: string;
  createdAt: string;
}

// SmartLink type (camelCase for app)
export interface SmartLink {
  id: string;
  user_id: string;
  userId: string;
  release_id: string | null;
  releaseId: string | null;
  title: string;
  artist: string;
  cover_url: string;
  coverUrl: string;
  slug: string;
  platforms: SmartLinkPlatform[];
  clicks: number;
  created_at: string;
  createdAt: string;
}

export interface SmartLinkPlatform {
  id?: string;
  name: string;
  url: string;
  active?: boolean;
  icon?: string;
}

// ArtistWebsite type (camelCase for app)
export interface ArtistWebsite {
  id: string;
  user_id: string;
  userId: string;
  title: string;
  slug: string;
  stageName: string;
  bio: string;
  photo_url: string;
  photoUrl: string;
  links: WebsiteLink[];
  socials?: { name: string; url: string }[];
  created_at: string;
  createdAt: string;
}

export interface WebsiteLink {
  id: string;
  name: string;
  url: string;
}

// Transaction type (camelCase for app)
export interface Transaction {
  id: string;
  user_id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  status?: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  createdAt: string;
}

// WithdrawalRequest type (camelCase for app)
export interface WithdrawalRequest {
  id: string;
  user_id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'paid' | 'approved' | 'rejected';
  contactInfo?: string;
  confirmationAgreed?: boolean;
  admin_comment?: string;
  created_at: string;
  createdAt: string;
}

// QuarterlyReport type (camelCase for app)
export interface QuarterlyReport {
  id: string;
  user_id: string;
  userId: string;
  title: string;
  quarter: number;
  year: number;
  fileUrl: string;
  file_url: string;
  fileName?: string;
  period?: string;
  streams?: number;
  revenue?: number;
  created_at: string;
  createdAt: string;
}

// Status type (camelCase for app)
export interface Status {
  id?: number;
  name: string;
  color: string;
  order: number;
  sort_order?: number;
  isDefault: boolean;
  is_default?: boolean;
}

// Field type (camelCase for app)
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

// LabelSocial type (camelCase for app)
export interface LabelSocial {
  id: string;
  name: string;
  url: string;
  platform?: string;
}

// AppConfig type (expanded)
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
    primaryColor?: string;
    secondaryColor?: string;
    leftTitle?: string;
    leftText2?: string;
    feature1?: string;
    feature2?: string;
    feature3?: string;
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
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};