"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, ExternalLink, Loader2, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

interface ImageUploaderProps {
  bucket: string;
  path: string;
  currentLocalUrl?: string;
  currentExternalUrl?: string;
  onUpload: (url: string) => void;
  onExternalUrlChange: (url: string) => void;
  onRemove: () => void;
  label: string;
  className?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  minDimensions?: { width: number; height: number };
  aspectRatio?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  path,
  currentLocalUrl,
  currentExternalUrl,
  onUpload,
  onExternalUrlChange,
  onRemove,
  label,
  className = "",
  acceptedTypes = "image/jpeg,image/jpg,image/png,image/webp",
  maxSizeMB = 7,
  minDimensions,
  aspectRatio = "1:1"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | currentLocalUrl || '');

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateImage = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        resolve({ valid: false, error: `Непідтримуваний формат. Дозволені: JPG, PNG, WebP` });
        return;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        resolve({ valid: false, error: `Файл занадто великий. Максимум: ${maxSizeMB}МБ` });
        return;
      }

      // Check dimensions
      if (minDimensions) {
        const img = new window.Image();
        img.onload = () => {
          if (img.width < minDimensions.width || img.height < minDimensions.height) {
            resolve({ 
              valid: false, 
              error: `Зображення занадто маленьке. Мінімум: ${minDimensions.width}x${minDimensions.height}px` 
            });
          } else {
            // Check aspect ratio (allow some tolerance)
            const ratio = img.width / img.height;
            const expectedRatio = 1; // 1:1
            const tolerance = 0.02;
            
            if (Math.abs(ratio - expectedRatio) > tolerance) {
              resolve({ 
                valid: false, 
                error: `Неправильне співвідношення сторін. Потрібно: ${aspectRatio} (квадратне)` 
              });
            } else {
              resolve({ valid: true });
            }
          }
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
          resolve({ valid: false, error: 'Не вдалося завантажити зображення' });
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve({ valid: true });
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setIsValidating(true);

    try {
      // Validate the image
      const validation = await validateImage(file);
      
      if (!validation.valid) {
        setValidationError(validation.error || 'Помилка валідації');
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
      
      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage
      setIsUploading(true);
      setUploadProgress(10);

      const fileName = `${Date.now()}-${file.name.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "-")}`;
      const fullPath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) {
        console.error('Upload error:', error);
        showError('Помилка завантаження: ' + error.message);
        setIsUploading(false);
        return;
      }

      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      onUpload(publicUrl);
      setPreviewUrl(publicUrl);
      showSuccess('Зображення завантажено!');
      
    } catch (err: any) {
      console.error('Upload error:', err);
      showError('Помилка: ' + (err.message || 'Невідома помилка'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      const event = { target: fileInputRef.current } as any;
      handleFileSelect(event);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const hasImage = previewUrl || currentLocalUrl || currentExternalUrl;
  const displayUrl = previewUrl || currentLocalUrl || currentExternalUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</Label>
      
      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-900/10 border border-red-900/20 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{validationError}</p>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-red-700 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[9px] text-zinc-500 text-center font-bold uppercase tracking-widest">
            Завантаження... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Image Preview / Upload Area */}
      {hasImage ? (
        <div className="relative group">
          {/* Image */}
          <div className="aspect-square relative overflow-hidden border border-white/10 bg-black/40">
            <img 
              src={displayUrl} 
              alt={label}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              {currentLocalUrl || previewUrl ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-white/20 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-9 rounded-none"
                    disabled={isUploading || isValidating}
                  >
                    <Upload size={14} className="mr-2" /> Змінити
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="border-red-500/20 text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest h-9 rounded-none"
                  >
                    <X size={14} className="mr-2" /> Видалити
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(displayUrl, '_blank')}
                  className="border-white/20 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-9 rounded-none"
                >
                  <ExternalLink size={14} className="mr-2" /> Відкрити
                </Button>
              )}
            </div>
          </div>
          
          {/* Success indicator */}
          <div className="absolute top-3 right-3 bg-green-500/20 text-green-500 p-1.5">
            <Check size={14} />
          </div>
        </div>
      ) : (
        /* Upload Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !isUploading && !isValidating && fileInputRef.current?.click()}
          className={`
            aspect-square border-2 border-dashed border-white/10 
            flex flex-col items-center justify-center gap-4 
            bg-black/40 cursor-pointer
            transition-all duration-300
            hover:border-red-700/50 hover:bg-white/[0.02]
            ${isUploading || isValidating ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {isValidating ? (
            <>
              <Loader2 size={32} className="text-zinc-600 animate-spin" />
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Перевірка...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-none bg-white/5 flex items-center justify-center">
                <ImageIcon size={28} className="text-zinc-600" />
              </div>
              <div className="text-center space-y-2 px-4">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Натисніть або перетягніть
                </p>
                <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                  JPG, PNG, WebP • Макс. {maxSizeMB}МБ
                </p>
                {minDimensions && (
                  <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                    Мінімум {minDimensions.width}x{minDimensions.height}px • {aspectRatio}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* External URL option */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Або</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <Input 
          type="url"
          value={currentExternalUrl || ''}
          onChange={(e) => onExternalUrlChange(e.target.value)}
          placeholder="...або вставте пряме посилання на зображення"
          className="bg-black/40 border-white/5 rounded-none h-10 text-[10px] font-mono focus:ring-0 focus:border-red-700"
        />
      </div>
    </div>
  );
};

export default ImageUploader;