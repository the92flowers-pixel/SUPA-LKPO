"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';
import { validateImage, ALLOWED_IMAGE_TYPES, MIN_IMAGE_SIZE, MAX_FILE_SIZE, formatFileSize } from '@/utils/imageValidation';

interface ImageUploaderProps {
  bucket: string;
  userId: string;
  entityType: string;
  currentUrl?: string | null;
  currentLocalUrl?: string | null;
  onUpload: (url: string) => void;
  onDelete?: () => void;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  currentImageUrl?: string; // Alias for currentUrl for backwards compatibility
}

// Upload to Supabase Storage
const uploadToStorage = async (
  bucket: string,
  userId: string,
  entityType: string,
  file: File
): Promise<string> => {
  const timestamp = Date.now();
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
  
  const filePath = `${userId}/${entityType}/${timestamp}-${sanitizedName}`;

  // Dynamic import to avoid issues with SSR
  const { supabase } = await import('@/lib/supabase');

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Помилка завантаження: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  userId,
  entityType,
  currentUrl,
  currentLocalUrl,
  onUpload,
  onDelete,
  label = 'Завантажити зображення',
  className,
  aspectRatio = 'square',
  currentImageUrl, // Alias
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use either prop for current image
  const activeImageUrl = preview || currentUrl || currentLocalUrl || currentImageUrl || null;

  const handleFileSelect = useCallback(async (file: File) => {
    setValidationMessage(null);

    // Validate image BEFORE upload
    const validation = await validateImage(file);
    
    if (!validation.valid) {
      setValidationMessage(validation.error || 'Невідома помилка валідації');
      showError(validation.error || 'Невідома помилка валідації');
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload to Supabase
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadToStorage(bucket, userId, entityType, file);
      onUpload(uploadedUrl);
      setPreview(null); // Clear preview since we have the uploaded URL
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Upload error:', error);
      showError('Помилка при завантаженні зображення');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [bucket, userId, entityType, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setValidationMessage(null);

    const file = e.dataTransfer.files[0];
    if (file && ALLOWED_IMAGE_TYPES.includes(file.type)) {
      handleFileSelect(file);
    } else {
      setValidationMessage('Дозволені формати: JPG, PNG, WebP');
      showError('Дозволені формати: JPG, PNG, WebP');
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDelete = useCallback(() => {
    setPreview(null);
    setValidationMessage(null);
    onDelete?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDelete]);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }[aspectRatio];

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {label}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {activeImageUrl ? (
        <div className={cn('relative group', aspectRatioClass, 'w-full')}>
          <img
            src={activeImageUrl}
            alt="Uploaded"
            className={cn(
              'w-full h-full object-cover border border-white/10 shadow-2xl',
              aspectRatio === 'square' && 'rounded-none'
            )}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-none transition-colors"
            >
              <Upload size={20} />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-3 bg-red-900/50 hover:bg-red-900 text-white rounded-none transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <Loader2 className="animate-spin text-red-700" size={32} />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'w-full border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4',
            aspectRatioClass,
            'min-h-[200px]',
            isDragging
              ? 'border-red-700 bg-red-900/10'
              : 'border-white/10 hover:border-white/20 bg-white/[0.02]',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin text-red-700" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Завантаження...
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-none bg-white/5 flex items-center justify-center">
                <ImageIcon className="text-zinc-600" size={24} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {label}
                </p>
                <p className="text-[9px] text-zinc-700 uppercase tracking-wider">
                  JPG, PNG, WebP • Макс {MAX_FILE_SIZE / (1024 * 1024)}MB
                </p>
                <p className="text-[9px] text-red-700/60 uppercase tracking-wider font-bold">
                  Квадратне • Мінімум {MIN_IMAGE_SIZE}x{MIN_IMAGE_SIZE}px
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Validation Message Display */}
      {validationMessage && (
        <div className="p-3 bg-red-900/10 border border-red-900/20 flex items-start gap-2">
          <AlertCircle className="text-red-700 shrink-0 mt-0.5" size={14} />
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider leading-relaxed">
            {validationMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;