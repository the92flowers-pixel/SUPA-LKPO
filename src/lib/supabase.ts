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
  avatarLocal?: string;
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
  avatar_local?: string;
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
  coverImageLocal?: string;
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
  avatarLocal?: string;
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
  siteAvatarLocal?: string;
  links: any[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'rejected';
  description?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  contactInfo: string;
  confirmationAgreed: boolean;
  status: 'pending' | 'paid' | 'rejected';
  admin_comment?: string;
  createdAt: string;
}

export interface QuarterlyReport {
  id: string;
  userId: string;
  quarter: number;
  year: number;
  fileUrl: string;
  fileName?: string;
  createdAt: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface Field {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: 'release' | 'profile';
  order: number;
  visible: boolean;
  options?: string;
  fileTypes?: string;
  maxSize?: string;
}

export interface LabelSocial {
  id: string;
  name: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

/**
 * Upload a file to Supabase Storage
 * Uses unique filenames to prevent conflicts
 */
export const uploadFile = async (bucket: string, path: string, file: File): Promise<string> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  // Generate a unique filename to avoid conflicts
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const sanitizedFileName = `${timestamp}_${randomId}.${fileExtension}`;
  
  // Clean the path and append filename
  const cleanPath = path.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "-").replace(/\/+/g, "/");
  const fullPath = cleanPath.endsWith('/') ? `${cleanPath}${sanitizedFileName}` : `${cleanPath}/${sanitizedFileName}`;

  // Delete existing file if it exists (for single file uploads)
  try {
    const { data: existingFiles } = await supabase.storage
      .from(bucket)
      .list(cleanPath, { search: fileExtension });
    
    if (existingFiles && existingFiles.length > 0) {
      // Delete old files in this path with same extension (single file mode)
      for (const existingFile of existingFiles) {
        if (existingFile.name.endsWith(`.${fileExtension}`)) {
          await supabase.storage
            .from(bucket)
            .remove([`${cleanPath}/${existingFile.name}`]);
        }
      }
    }
  } catch (e) {
    // Ignore errors from listing/deleting existing files
    console.log('No existing file to clean up');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (error) {
    console.error('Supabase Storage Error:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Supabase Storage Delete Error:', error);
    return false;
  }

  return true;
};

/**
 * Get a list of files in a bucket folder
 */
export const listFiles = async (bucket: string, path: string): Promise<any[]> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) {
    console.error('Supabase Storage List Error:', error);
    return [];
  }

  return data || [];
};