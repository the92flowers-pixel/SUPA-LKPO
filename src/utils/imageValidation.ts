"use client";

// Image validation constants
export const MIN_IMAGE_SIZE = 1400; // Minimum width/height in pixels
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

/**
 * Validates that an image file meets the following requirements:
 * 1. Must be square (width equals height)
 * 2. Minimum resolution must be 1400x1400 pixels
 * 3. File size must not exceed 10MB
 * 4. File type must be JPEG, PNG, or WebP
 */
export const validateImage = async (file: File): Promise<ImageValidationResult> => {
  // Check file type first
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Недопустимий формат. Дозволені формати: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Файл занадто великий. Максимальний розмір: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Load and validate image dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;

      // Check if square
      if (width !== height) {
        resolve({
          valid: false,
          error: `Зображення має бути квадратним. Поточний розмір: ${width}x${height}px. Потрібно: ${MIN_IMAGE_SIZE}x${MIN_IMAGE_SIZE}px або більше (квадратне).`,
          width,
          height
        });
        return;
      }

      // Check minimum resolution
      if (width < MIN_IMAGE_SIZE || height < MIN_IMAGE_SIZE) {
        resolve({
          valid: false,
          error: `Зображення занадто маленьке. Мінімум: ${MIN_IMAGE_SIZE}x${MIN_IMAGE_SIZE}px. Поточний розмір: ${width}x${height}px.`,
          width,
          height
        });
        return;
      }

      // All validations passed
      resolve({
        valid: true,
        width,
        height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: 'Не вдалося завантажити зображення для перевірки. Спробуйте інший файл.'
      });
    };

    img.src = objectUrl;
  });
};

/**
 * Validates URL is a valid HTTP/HTTPS URL
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url.trim()) {
    return { valid: false, error: 'URL не може бути порожнім' };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL має починатися з http:// або https://' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Недопустимий формат URL' };
  }
};

/**
 * Gets human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};