import React, { useState, useEffect } from 'react';
// ... (інші імпорти)
import { uploadFile } from '@/lib/supabase';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const Releases = () => {
  // ... (інші стани)
  const [coverUrl, setCoverUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Файл занадто великий. Максимальний розмір: 5 МБ');
      return;
    }

    setIsUploading(true);
    const loadingId = showLoading('Завантаження обкладинки...');
    try {
      const path = `smartlinks/${user?.id}/${Date.now()}-${file.name}`;
      // Отримуємо прямий URL з Supabase
      const supabaseUrl = await uploadFile('covers', path, file);
      
      // Оновлюємо стан, що автоматично оновить <img>
      setCoverUrl(supabaseUrl);
      
      showSuccess('Обкладинку оновлено з хмари!');
    } catch (err) {
      showError('Помилка завантаження');
    } finally {
      setIsUploading(false);
      dismissToast(loadingId);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ... (Каталог) */}
      
      {/* Smart Link Modal */}
      <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-none p-4 sm:p-6">
          {/* ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* ... (Upload Input) */}
              <div className="relative">
                <input type="file" id="smartlink-upload" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                <label htmlFor="smartlink-upload" className={cn(
                  "flex flex-col items-center justify-center gap-2 w-full h-20 border border-dashed border-white/10 hover:border-red-700/50 hover:bg-red-900/5 cursor-pointer transition-all",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}>
                  {isUploading ? <Loader2 className="animate-spin text-red-700" size={16} /> : <Upload size={16} className="text-zinc-500" />}
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    {isUploading ? 'Завантаження...' : 'Оберіть файл (макс. 5 МБ)'}
                  </span>
                </label>
              </div>
            </div>
            
            {/* Передпрогляд: Використовує coverUrl, який оновлюється з Supabase */}
            <div className="flex items-center justify-center">
              <div className="aspect-square w-full max-w-[180px] border border-white/10 overflow-hidden shadow-2xl bg-black/40">
                <img 
                  src={coverUrl || FALLBACK_IMAGE} 
                  alt="Preview" 
                  key={coverUrl} // Force re-render
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                />
              </div>
            </div>
          </div>
          {/* ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Releases;