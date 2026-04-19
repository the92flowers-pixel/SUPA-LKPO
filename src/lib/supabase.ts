import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://betclysjesjqdvkpbexe.supabase.co';
const supabaseAnonKey = 'sb_publishable_cnnlIaVWbW-hf38TY15ZeQ_-8KYoWm7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper types
export interface Profile {
  id: string;
  login: string;
  artist_name: string | null;
  role: 'admin' | 'artist';
  balance: number;
  is_verified: boolean;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Release {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  genre: string | null;
  release_date: string | null;
  cover_url: string | null;
  audio_url: string | null;
  status: string;
  streams: number;
  history: { date: string; count: number }[];
  created_at: string;
  updated_at: string;
}

export interface SmartLink {
  id: string;
  release_id: string | null;
  user_id: string;
  slug: string;
  title: string | null;
  artist: string | null;
  cover_url: string | null;
  platforms: { id: string; name: string; url: string }[];
  created_at: string;
}

export interface ArtistWebsite {
  id: string;
  user_id: string;
  slug: string;
  stage_name: string | null;
  bio: string | null;
  photo_url: string | null;
  links: { id: string; name: string; url: string }[];
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'admin_adjust';
  status: 'pending' | 'completed' | 'cancelled';
  description: string | null;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  contact_info: string | null;
  confirmation_agreed: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  admin_comment: string | null;
  created_at: string;
}

export interface QuarterlyReport {
  id: string;
  user_id: string;
  quarter: number;
  year: number;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  is_default: boolean;
}

export interface Field {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  for_role: string;
  sort_order: number;
  visible: boolean;
  options: string[];
  file_types: string | null;
  max_size: string | null;
}

export interface LabelSocial {
  id: string;
  name: string;
  url: string | null;
  sort_order: number;
}

export interface AppConfig {
  id: number;
  settings: {
    siteName: string;
    registrationEnabled: boolean;
    contactEmail: string;
  };
  home_page: {
    heroTitle: string;
    heroSubtitle: string;
    buttonText: string;
    primaryColor: string;
  };
  admin_panel: {
    logoText: string;
    accentColor: string;
  };
  login_page: {
    logoText: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    socialIcons: string[];
  };
  fields: Field[];
  statuses: Status[];
  label_socials: LabelSocial[];
}