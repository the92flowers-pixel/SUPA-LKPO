import { supabase } from './supabase';

const BUCKETS = {
  'release-covers': 'release-covers',
  'avatars': 'avatars',
  'artist-sites': 'artist-sites',
  'smartlinks': 'smartlinks',
  'covers': 'covers',
} as const;

type BucketName = keyof typeof BUCKETS;

interface UploadOptions {
  bucket: BucketName;
  userId: string;
  entityType: string;
  file: File;
  existingPath?: string | null;
}

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// File validation constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_DIMENSION = 4000;

const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid format. Allowed: ${ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }

  return { valid: true };
};

const validateImageDimensions = (file: File): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        resolve({ 
          valid: false, 
          error: `Image too large. Max resolution: ${MAX_DIMENSION}x${MAX_DIMENSION}px` 
        });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      resolve({ valid: false, error: 'Failed to load image for validation' });
    };
    img.src = URL.createObjectURL(file);
  });
};

const sanitizeFileName = (fileName: string): string => {
  // Remove special characters and spaces, keep only safe characters
  return fileName
    .toLowerCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100); // Limit length
};

export const uploadImage = async ({
  bucket,
  userId,
  entityType,
  file,
  existingPath,
}: UploadOptions): Promise<UploadResult> => {
  try {
    // Validate file type and size
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return { success: false, error: fileValidation.error };
    }

    // Validate image dimensions
    const dimensionValidation = await validateImageDimensions(file);
    if (!dimensionValidation.valid) {
      return { success: false, error: dimensionValidation.error };
    }

    // Delete existing file if replacing
    if (existingPath) {
      await deleteFile(bucket, existingPath);
    }

    // Generate unique file path: /{userId}/{entityType}/{timestamp}-{sanitized-filename}
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const filePath = `${userId}/${entityType}/${timestamp}-${sanitizedName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

export const deleteFile = async (
  bucket: BucketName, 
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!filePath || filePath.trim() === '') {
      return { success: true }; // Nothing to delete
    }

    // Extract just the path from full URL if needed
    let pathToDelete = filePath;
    if (filePath.includes('supabase.co/storage')) {
      // Extract path from full URL
      const matches = filePath.match(/storage\/v1\/object\/public\/[^/]+\/(.+)/);
      if (matches) {
        pathToDelete = matches[1];
      }
    }

    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([pathToDelete]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Don't fail the whole operation if delete fails
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    };
  }
};

export const getPublicUrl = (
  bucket: BucketName,
  path: string
): string => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const replaceImage = async ({
  bucket,
  userId,
  entityType,
  newFile,
  oldPath,
}: Omit<UploadOptions, 'existingPath'> & { oldPath: string | null }): Promise<UploadResult> => {
  return uploadImage({
    bucket,
    userId,
    entityType,
    file: newFile,
    existingPath: oldPath,
  });
};

export const STORAGE_BUCKETS = BUCKETS;
export { ALLOWED_TYPES, MAX_FILE_SIZE, MAX_DIMENSION };