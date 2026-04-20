import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, Trash2, Check, ChevronRight, ChevronLeft, Image, Disc, FileText, AlertCircle, CheckCircle2, Loader2, Shield, Calendar, Hash, Upload } from 'lucide-react';
import { useDataStore, useAuthStore, DEFAULT_GENRES } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/supabase';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const NewRelease = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addRelease, statuses, fetchReleases, fields } = useDataStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState<any>({
    title: '',
    artist: user?.artistName || '',
    genre: 'Другое',
    releaseDate: minDateStr,
    coverUrl: '',
    composer: '',
    performer: '',
    label: 'ЖУРБА MUSIC',
    description: '',
    explicit: false,
    isSingle: true,
    isrc: '',
    upc: '',
    releaseUrl: '',
    copyrights: '',
    copyrightConfirmed: false,
  });
  
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');
  const [tracks, setTracks] = useState<any[]>([
    { id: '1', title: '', fileName: '', duration: '', explicit: false, lyrics: '', position: 1 }
  ]);
  
  const defaultStatus = statuses.find((s: any) => s.isDefault)?.name || 'На модерації';
  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Файл занадто великий. Максимальний розмір: 5 МБ');
      return;
    }

    setIsUploading(true);
    const loadingId = showLoading('Завантаження обкладинки на сервер...');
    try {
      const path = `releases/${user?.id}/${Date.now()}-${file.name}`;
      // uploadFile повертає прямий Public URL з Supabase
      const publicUrl = await uploadFile('covers', path, file);
      
      // Оновлюємо стан прямим посиланням з Supabase
      updateFormData('coverUrl', publicUrl);
      showSuccess('Обкладинку успішно завантажено в сховище!');
    } catch (err) {
      showError('Помилка завантаження в Supabase');
    } finally {
      setIsUploading(false);
      dismissToast(loadingId);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 3:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Обкладинка</h2>
              <p className="text-zinc-500 text-xs sm:text-sm">Завантажте файл (він буде збережений у Supabase)</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Завантажити файл</Label>
                  <div className="relative">
                    <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                    <label htmlFor="cover-upload" className={cn(
                      "flex flex-col items-center justify-center gap-3 w-full h-32 border-2 border-dashed border-white/10 hover:border-red-700/50 hover:bg-red-900/5 cursor-pointer transition-all",
                      isUploading && "opacity-50 cursor-not-allowed"
                    )}>
                      {isUploading ? <Loader2 className="animate-spin text-red-700" /> : <Upload className="text-zinc-500" />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {isUploading ? 'Завантаження в Supabase...' : 'Оберіть файл (JPG/PNG, макс. 5 МБ)'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Обкладинки (Supabase або зовнішній)</Label>
                  <Input 
                    value={formData.coverUrl} 
                    onChange={(e) => updateFormData('coverUrl', e.target.value)} 
                    className="bg-black/40 border-white/5 rounded-none h-12 text-white text-xs font-mono" 
                    placeholder="https://..." 
                  />
                </div>
              </div>
              
              {/* Передпрогляд: якщо є coverUrl, показуємо його (це буде URL з Supabase після завантаження) */}
              <div className="aspect-square max-w-xs mx-auto border border-white/10 overflow-hidden shadow-2xl bg-black/20 flex items-center justify-center">
                <img 
                  src={formData.coverUrl || FALLBACK_IMAGE} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== FALLBACK_IMAGE) target.src = FALLBACK_IMAGE;
                  }} 
                />
              </div>
              {formData.coverUrl && formData.coverUrl.includes('supabase.co') && (
                <p className="text-center text-[9px] text-green-500 font-black uppercase tracking-widest">
                  ✓ Зображення завантажено в Supabase Storage
                </p>
              )}
            </div>
          </div>
        );
      // ... інші кроки залишаються без змін
      default: return null;
    }
  };

  // ... решта компонента
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ... */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="min-h-[400px] sm:min-h-[500px]">{renderStepContent()}</div>
        {/* ... кнопки навігації */}
      </div>
    </div>
  );
};

export default NewRelease;