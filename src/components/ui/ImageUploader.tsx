"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadFile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

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
}

const ImageUploader = ({
  bucket,
  path,
  currentLocalUrl,
  currentExternalUrl,
  onUpload,
  onExternalUrlChange,
  onRemove,
  label,
  className
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // 1. Перевірка розміру (7 МБ)
      if (file.size > 7 * 1024 * 1024) {
        showError('Файл занадто великий. Максимум 7 МБ');
        return resolve(false);
      }

      // 2. Перевірка формату
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showError('Непідтримуваний формат. Використовуйте JPG, PNG, WEBP або GIF');
        return resolve(false);
      }

      // 3. Перевірка на квадратність
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width !== img.height) {
          showError('Зображення має бути строго квадратним (1:1)');
          return resolve(false);
        }
        resolve(true);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = await validateImage(file);
    if (!isValid) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${path}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const publicUrl = await uploadFile(bucket, fileName, file);
      onUpload(publicUrl);
    } catch (error) {
      showError('Помилка завантаження зображення');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = currentLocalUrl || currentExternalUrl || "https://jurbamusic.iceiy.com/releasepreview.png";

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Local Upload */}
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/jpeg,image/png,image/webp,image/gif" 
              onChange={handleFileChange} 
              disabled={isUploading} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 w-full h-32 border-2 border-dashed border-white/10 hover:border-red-700/50 hover:bg-red-900/5 cursor-pointer transition-all group",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <Loader2 className="animate-spin text-red-700" />
              ) : (
                <Upload className="text-zinc-500 group-hover:text-red-700 transition-colors" />
              )}
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {isUploading ? 'Завантаження...' : 'Завантажити файл'}
                </p>
                <p className="text-[8px] text-zinc-600 mt-1 uppercase">Квадрат, до 7 МБ</p>
              </div>
            </div>
          </div>

          {/* External URL */}
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase text-zinc-600">Або зовнішній URL</Label>
            <Input 
              value={currentExternalUrl || ''} 
              onChange={(e) => onExternalUrlChange(e.target.value)}
              className="bg-black/40 border-white/5 rounded-none h-10 text-xs font-mono"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="relative aspect-square w-full max-w-[180px] mx-auto border border-white/10 bg-black/20 group">
          <img 
            src={displayUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://jurbamusic.iceiy.com/releasepreview.png")}
          />
          {currentLocalUrl && (
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-none"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X size={12} />
            </Button>
          )}
          {currentLocalUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 py-1 px-2">
              <p className="text-[8px] font-black uppercase text-white text-center">Локальний файл</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;