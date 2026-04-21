import { toast } from 'sonner';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// Constants for image validation
export const IMAGE_CONSTRAINTS = {
  MIN_DIMENSION: 1400,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

export const validateImageBeforeUpload = (file: File): ImageValidationResult => {
  // Check file type
  if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Недопустимий формат. Дозволені: ${IMAGE_CONSTRAINTS.ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
    };
  }

  // Check file size
  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    const maxSizeMB = IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `Файл занадто великий. Макс. розмір: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

export const validateImageDimensions = (file: File): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;
      const minDim = IMAGE_CONSTRAINTS.MIN_DIMENSION;

      // Check if image is square (width must equal height)
      if (width !== height) {
        resolve({
          valid: false,
          error: `Зображення має бути квадратним (width=${width}, height=${height}). Співвідношення сторін має бути 1:1.`,
        });
        return;
      }

      // Check minimum dimension
      if (width < minDim || height < minDim) {
        resolve({
          valid: false,
          error: `Зображення занадто маленьке. Мінімум: ${minDim}x${minDim}px (поточный розмір: ${width}x${height})`,
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: 'Не вдалося завантажити зображення для перевірки',
      });
    };

    img.src = objectUrl;
  });
};

export const validateAndShowError = async (file: File): Promise<boolean> => {
  // First, basic validation
  const basicValidation = validateImageBeforeUpload(file);
  if (!basicValidation.valid) {
    toast.error(basicValidation.error || 'Помилка валідації зображення');
    return false;
  }

  // Then, dimension validation
  const dimensionValidation = await validateImageDimensions(file);
  if (!dimensionValidation.valid) {
    toast.error(dimensionValidation.error || 'Зображення не відповідає вимогам');
    return false;
  }

  return true;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
};