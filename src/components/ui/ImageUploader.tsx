"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader2, AlertCircle, Check, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { uploadFile, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface ImageUploaderProps {
  bucket: string;
  path: string;
  currentLocalUrl?: string;
  currentExternalUrl?: string;
  onUpload: (url: string) => void;
  onExternalUrlChange?: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  minDimensions?: { width: number; height: number };
  aspectRatio?: string;
}

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  path,
  currentLocalUrl,
  currentExternalUrl,
  onUpload,
  onExternalUrlChange,
  onRemove,
  label,
  className,
  acceptedTypes = "image/jpeg,image/jpg,image/png,image/webp",
  maxSizeMB = 10,
  minDimensions,
  aspectRatio = "1:1",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = currentLocalUrl || currentExternalUrl;

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypesArray = acceptedTypes.split(',').map(t => t.trim());
    if (!acceptedTypesArray.some(type => file.type === type || file.name.toLowerCase().endsWith(type.replace('image/', '.')))) {
      return `Дозволені формати: ${acceptedTypes}`;
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Максимальний розмір: ${maxSizeMB}MB`;
    }

    return null;
  };

  const checkImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!minDimensions) {
        resolve(null);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      showError(validationError);
      return;
    }

    // Check dimensions if required
    if (minDimensions) {
      const dimensions = await checkImageDimensions(file);
      if (dimensions) {
        if (dimensions.width < minDimensions.width || dimensions.height < minDimensions.height) {
          const dimError = `Мінімальний розмір: ${minDimensions.width}x${minDimensions.height}px. Поточний: ${dimensions.width}x${dimensions.height}px`;
          setError(dimError);
          showError(dimError);
          return;
        }
      }
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Fallback: use local URL for demo mode
      const localUrl = URL.createObjectURL(file);
      onUpload(localUrl);
      showSuccess('Файл завантажено (локальний режим)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadedUrl = await uploadFile(bucket, path, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUpload(uploadedUrl);
      showSuccess('Обкладинку завантажено!');
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err?.message || 'Помилка при завантаженні';
      setError(errorMessage);
      showError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleExternalUrlSubmit = (url: string) => {
    if (url && onExternalUrlChange) {
      onExternalUrlChange(url);
      showSuccess('URL додано');
    }
  };

  const aspectRatioClass = aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "16:9" ? "aspect-video" : "";

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
          {label}
        </Label>
      )}

      {/* Current Image Preview */}
      {currentUrl && (
        <div className="relative group">
          <div className={cn("w-full overflow-hidden border border-white/10 bg-black/40", aspectRatioClass)}>
            <img 
              src={currentUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
          </div>
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-none opacity-0 group-hover:opacity-100 transition-opacity bg-red-900/80 hover:bg-red-700"
              onClick={onRemove}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!currentUrl && (
        <div
          className={cn(
            "border-2 border-dashed transition-all duration-300 relative",
            isDragging 
              ? "border-red-700 bg-red-900/10" 
              : "border-white/10 bg-black/40 hover:border-white/20",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="animate-spin text-red-700 mb-4" size={40} />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Завантаження... {uploadProgress}%
                </p>
                <div className="w-48 h-1 bg-white/10 mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-red-700 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-4 text-zinc-600">
                  {error ? (
                    <AlertCircle size={32} className="text-red-700" />
                  ) : (
                    <Upload size={32} />
                  )}
                </div>
                
                {error ? (
                  <p className="text-sm text-red-500 font-bold">{error}</p>
                ) : (
                  <>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                      Перетягніть файл або клікніть
                    </p>
                    <p className="text-[10px] text-zinc-700 uppercase font-bold tracking-wider">
                      JPG, PNG, WebP • Макс. {maxSizeMB}MB
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* External URL Input */}
      {onExternalUrlChange && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">АБО</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Або вставте URL зображення..."
              className="bg-black/40 border-white/5 rounded-none h-10 text-xs font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExternalUrlSubmit((e.target as HTMLInputElement).value);
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  handleExternalUrlSubmit(e.target.value);
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-[9px] font-black uppercase tracking-widest h-10 rounded-none shrink-0"
              onClick={() => {
                const input = document.activeElement?.parentElement?.querySelector('input') as HTMLInputElement;
                if (input?.value) {
                  handleExternalUrlSubmit(input.value);
                }
              }}
            >
              <Check size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Re-upload button when image exists */}
      {currentUrl && (
        <Button
          variant="outline"
          className="w-full border-white/10 text-[10px] font-black uppercase tracking-widest h-10 rounded-none"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={14} />
              Завантаження...
            </>
          ) : (
            <>
              <Upload size={14} className="mr-2" />
              Замінити зображення
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;