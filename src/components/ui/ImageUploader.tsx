import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { supabase, uploadFile } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  aspectRatio?: string;
  minDimensions?: { width: number; height: number };
  /** If true, only allows one image (replaces old one on new upload) */
  singleImage?: boolean;
}

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const ImageUploader = ({
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
  maxSizeMB = 5,
  singleImage = true,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Priority for display:
  // 1. Currently uploading preview (previewUrl)
  // 2. Just uploaded file (uploadedUrl)  
  // 3. Previously uploaded local file (currentLocalUrl)
  // 4. External URL (currentExternalUrl)
  // 5. null (show upload placeholder)
  
  const hasImage = !!(previewUrl || uploadedUrl || currentLocalUrl || currentExternalUrl);
  const displayUrl = previewUrl || uploadedUrl || currentLocalUrl || currentExternalUrl || null;

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file type
    if (!acceptedTypes.split(',').some(type => file.type === type.trim())) {
      setError(`Неприпустимий тип файлу. Дозволені: ${acceptedTypes}`);
      return false;
    }
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Файл занадто великий. Максимальний розмір: ${maxSizeMB}MB`);
      return false;
    }
    
    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadedUrl(null); // Clear previous uploaded URL
    
    // Create preview immediately from file
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
    
    try {
      // Use single filename for single image mode
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const singleFileName = `image.${fileExtension}`;
      
      // Clean the path
      const cleanPath = path.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "-").replace(/\/+/g, "/");
      const fullPath = `${cleanPath}/${singleFileName}`;

      // Try to delete existing files first (for single image mode)
      if (singleImage) {
        try {
          const { data: existingFiles } = await supabase.storage
            .from(bucket)
            .list(cleanPath);
          
          if (existingFiles && existingFiles.length > 0) {
            for (const existingFile of existingFiles) {
              await supabase.storage
                .from(bucket)
                .remove([`${cleanPath}/${existingFile.name}`]);
            }
          }
        } catch (e) {
          // Ignore errors from listing/deleting
        }
      }

      setUploadProgress(30);

      // Upload new file
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      
      setUploadProgress(100);
      setUploadedUrl(publicUrl);
      setPreviewUrl(null); // Clear file preview, use uploaded URL
      onUpload(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Помилка завантаження');
      setPreviewUrl(null);
      setUploadedUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
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
    if (file) handleFileSelect(file);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    if (onRemove) onRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExternalUrlSubmit = (url: string) => {
    if (onExternalUrlChange) {
      onExternalUrlChange(url);
      setUploadedUrl(null); // Clear uploaded URL when using external
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    // Try fallback URLs in order
    if (img.src === uploadedUrl && currentLocalUrl) {
      img.src = currentLocalUrl;
    } else if (img.src === (currentLocalUrl || uploadedUrl) && currentExternalUrl) {
      img.src = currentExternalUrl;
    } else if (img.src !== FALLBACK_IMAGE) {
      img.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {label}
        </Label>
      )}
      
      <div
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 rounded-none overflow-hidden",
          isDragging 
            ? "border-red-700 bg-red-700/10" 
            : hasImage
              ? "border-white/5 bg-black/40" 
              : "border-white/10 bg-black/20 hover:border-white/20",
          error && "border-red-700"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
            <Loader2 className="w-10 h-10 text-red-700 animate-spin mb-4" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Завантаження...</p>
            <div className="w-48 h-1 bg-white/10 mt-4">
              <div 
                className="h-full bg-red-700 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }} 
              />
            </div>
          </div>
        ) : hasImage && displayUrl ? (
          <div className="relative group">
            <img 
              src={displayUrl} 
              alt="Preview" 
              className="w-full h-full object-cover max-h-[300px]"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black rounded-none text-[10px] font-black uppercase tracking-widest"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} className="mr-2" /> Змінити
              </Button>
              {onRemove && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-red-900/20 border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white rounded-none text-[10px] font-black uppercase tracking-widest"
                  onClick={handleRemove}
                >
                  <X size={14} className="mr-2" /> Видалити
                </Button>
              )}
            </div>
            {/* Show upload indicator if we have a local file but not uploaded yet */}
            {previewUrl && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-8 min-h-[200px] cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Перетягніть зображення або натисніть для вибору
            </p>
            <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">
              Макс. {maxSizeMB}MB • JPG, PNG, WebP
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {onExternalUrlChange && !hasImage && (
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
            Або вкажіть зовнішню URL
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
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
          </div>
        </div>
      )}

      {/* Show external URL input when there's already an image, but allow changing it */}
      {onExternalUrlChange && hasImage && (
        <details className="group">
          <summary className="text-[9px] font-black uppercase tracking-widest text-zinc-600 cursor-pointer hover:text-zinc-500">
            Або вкажіть зовнішню URL
          </summary>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              defaultValue={currentExternalUrl || ''}
              className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExternalUrlSubmit((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
        </details>
      )}
    </div>
  );
};

export default ImageUploader;