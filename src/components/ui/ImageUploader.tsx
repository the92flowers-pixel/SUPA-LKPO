"use client";

import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  Edit2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { uploadImage, deleteFile, replaceImage, STORAGE_BUCKETS } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';

interface ImageUploaderProps {
  bucket: keyof typeof STORAGE_BUCKETS;
  userId: string;
  entityType: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onDelete?: () => void;
  className?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  disabled?: boolean;
}

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

export default function ImageUploader({
  bucket,
  userId,
  entityType,
  currentUrl,
  onUpload,
  onDelete,
  className,
  label,
  aspectRatio = 'square',
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format. Allowed: JPG, PNG, WEBP, GIF');
      showError('Invalid format. Allowed: JPG, PNG, WEBP, GIF');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max size: 5MB');
      showError('File too large. Max size: 5MB');
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload to Supabase
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadImage({
        bucket: bucket as keyof typeof STORAGE_BUCKETS,
        userId,
        entityType,
        file,
        existingPath: currentUrl || undefined,
      });

      clearInterval(progressInterval);

      if (result.success && result.url) {
        setUploadProgress(100);
        onUpload(result.url);
        showSuccess('Image uploaded successfully');
        
        // Clean up object URL after successful upload
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 100);
      } else {
        setError(result.error || 'Upload failed');
        showError(result.error || 'Upload failed');
        setPreview(currentUrl || null);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
      showError('Upload failed');
      setPreview(currentUrl || null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploading(false);
    }
  }, [bucket, userId, entityType, currentUrl, onUpload]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  // Click to upload
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentUrl || !onDelete) return;

    try {
      await deleteFile(bucket as keyof typeof STORAGE_BUCKETS, currentUrl);
      setPreview(null);
      onDelete();
      showSuccess('Image removed');
    } catch (err) {
      console.error('Delete error:', err);
      showError('Failed to remove image');
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
          {label}
        </label>
      )}

      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer rounded-none overflow-hidden transition-all duration-300",
          aspectRatioClasses[aspectRatio],
          "border-2 border-dashed",
          isDragging 
            ? "border-red-700 bg-red-700/5" 
            : "border-white/10 hover:border-white/20",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-700/50",
          preview && !isUploading && "border-solid border-white/5"
        )}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Empty State - Drop Zone */}
        {!preview && !isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className={cn(
              "w-16 h-16 rounded-none border-2 border-dashed flex items-center justify-center mb-4 transition-colors",
              isDragging ? "border-red-700 bg-red-700/10" : "border-white/20"
            )}>
              {isDragging ? (
                <ImageIcon className="text-red-700" size={28} />
              ) : (
                <Upload className="text-zinc-500" size={28} />
              )}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">
              {isDragging ? 'Drop image here' : 'Drag & drop or click'}
            </p>
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">
              JPG, PNG, WEBP, GIF • Max 5MB
            </p>
          </div>
        )}

        {/* Preview Image */}
        {preview && !isUploading && (
          <>
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => {
                setPreview(FALLBACK_IMAGE);
              }}
            />
            
            {/* Hover Overlay - Edit Button */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <Button
                type="button"
                size="sm"
                className="bg-white/10 hover:bg-white text-white text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <Edit2 size={14} className="mr-2" />
                Replace
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="bg-red-900/30 hover:bg-red-900/50 text-red-500 text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <X size={14} className="mr-2" />
                  Remove
                </Button>
              )}
            </div>

            {/* Success Indicator */}
            <div className="absolute top-3 right-3 bg-green-500/20 text-green-500 p-1.5">
              <Check size={14} />
            </div>
          </>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            {/* Preview behind loading */}
            {preview && (
              <img
                src={preview}
                alt="Uploading..."
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center">
              <Loader2 className="text-red-700 animate-spin mb-4" size={36} />
              <p className="text-xs font-black uppercase tracking-widest text-white mb-2">
                Uploading...
              </p>
              
              {/* Progress Bar */}
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-700 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[9px] text-zinc-500 mt-2 font-mono">
                {uploadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isUploading && (
          <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="text-red-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
              {error}
            </p>
            <p className="text-[9px] text-zinc-500 mt-2">
              Click to try again
            </p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {!preview && !error && (
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold text-center">
          Click or drag image to upload
        </p>
      )}
    </div>
  );
}