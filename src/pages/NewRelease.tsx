import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, Plus, Trash2, Check, ChevronRight, ChevronLeft, Image, Disc, Users, FileText, AlertCircle, X, GripVertical, CheckCircle2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useDataStore, useAuthStore, DEFAULT_GENRES } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/supabase';

interface Track {
  id: string;
  title: string;
  duration: string;
  explicit: boolean;
  lyrics: string;
  position: number;
}

interface ReleaseFormData {
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  coverUrl: string;
  composer: string;
  performer: string;
  label: string;
  description: string;
  explicit: boolean;
  isSingle: boolean;
  isrc: string;
  releaseUrl: string;
}

const STEPS = [
  { id: 1, name: 'Реліз', icon: Disc, title: 'Тип релізу' },
  { id: 2, name: 'Інформація', icon: FileText, title: 'Основна інформація' },
  { id: 3, name: 'Обкладинка', icon: Image, title: 'Обкладинка' },
  { id: 4, name: 'Треки', icon: Music, title: 'Треклист' },
  { id: 5, name: 'Підтвердження', icon: CheckCircle2, title: 'Перегляд та відправка' },
];

const NewRelease = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addRelease, statuses, fetchReleases } = useDataStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const [formData, setFormData] = useState<ReleaseFormData>({
    title: '',
    artist: user?.artistName || '',
    genre: 'Другое',
    releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coverUrl: '',
    composer: '',
    performer: '',
    label: 'ЖУРБА MUSIC',
    description: '',
    explicit: false,
    isSingle: true,
    isrc: '',
    releaseUrl: '',
  });
  
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: '', duration: '', explicit: false, lyrics: '', position: 1 }
  ]);
  
  const defaultStatus = statuses.find((s: any) => s.isDefault)?.name || 'На модерації';
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const updateFormData = (field: keyof ReleaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      showError('Будь ласка, завантажте файл у форматі JPG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Максимальний розмір файлу — 5 МБ');
      return;
    }

    setIsUploading(true);
    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const publicUrl = await uploadFile('covers', fileName, file);
      updateFormData('coverUrl', publicUrl);
      showSuccess('Обкладинку завантажено');
    } catch (error) {
      console.error('Upload error:', error);
      showError('Помилка завантаження файлу');
    } finally {
      setIsUploading(false);
    }
  };

  const addTrack = () => {
    setTracks([...tracks, { 
      id: Date.now().toString(), 
      title: '', 
      duration: '', 
      explicit: false, 
      lyrics: '', 
      position: tracks.length + 1 
    }]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(t => t.id !== id).map((t, i) => ({ ...t, position: i + 1 })));
    }
  };

  const updateTrack = (id: string, field: keyof Track, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.title.trim() !== '' && formData.artist.trim() !== '' && formData.performer.trim() !== '';
      case 3:
        return formData.coverUrl.trim() !== '' && !isUploading;
      case 4:
        return tracks.every(t => t.title.trim() !== '');
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateAll = () => {
    if (!formData.title.trim()) {
      showError('Вкажіть назву релізу');
      return false;
    }
    if (!formData.artist.trim()) {
      showError('Вкажіть артиста');
      return false;
    }
    if (!formData.performer.trim()) {
      showError('Вкажіть виконавця');
      return false;
    }
    if (!formData.coverUrl.trim()) {
      showError('Завантажте обкладинку релізу');
      return false;
    }
    for (const track of tracks) {
      if (!track.title.trim()) {
        showError('Всі треки повинні мати назву');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      const releaseData: any = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        releaseDate: formData.releaseDate,
        coverUrl: formData.coverUrl,
        composer: formData.composer,
        performer: formData.performer,
        label: formData.label,
        description: formData.description,
        explicit: formData.explicit,
        status: defaultStatus,
        isSingle: releaseType === 'single',
        tracks: releaseType === 'album' ? tracks : undefined,
        isrc: formData.isrc,
        releaseUrl: formData.releaseUrl,
      };

      const result = await addRelease(releaseData);

      if (result && result.id) {
        showSuccess('Реліз успішно відправлено на модерацію!');
        await fetchReleases(user?.id, user?.role);
        navigate('/releases');
      } else {
        showError('Помилка при створенні релізу');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating release:', error);
      showError('Сталася помилка: ' + (error as Error).message);
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Тип релізу</h2>
              <p className="text-zinc-500 text-sm">Оберіть формат вашого релізу</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setReleaseType('single')}
                className={cn(
                  "p-8 border-2 transition-all duration-300 rounded-none text-left group",
                  releaseType === 'single' 
                    ? "border-red-700 bg-red-900/10" 
                    : "border-white/10 bg-black/40 hover:border-white/30"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-none flex items-center justify-center mb-6 transition-colors",
                  releaseType === 'single' ? 'bg-red-700' : 'bg-white/10'
                )}>
                  <Music className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Single</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Один трек або EP до 5 треків</p>
                {releaseType === 'single' && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest">
                    <Check size={14} /> Вибрано
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setReleaseType('album'); if (tracks.length === 1) addTrack(); }}
                className={cn(
                  "p-8 border-2 transition-all duration-300 rounded-none text-left group",
                  releaseType === 'album' 
                    ? "border-red-700 bg-red-900/10" 
                    : "border-white/10 bg-black/40 hover:border-white/30"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-none flex items-center justify-center mb-6 transition-colors",
                  releaseType === 'album' ? 'bg-red-700' : 'bg-white/10'
                )}>
                  <Disc className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Альбом</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Повноформатний альбом від 6 треків</p>
                {releaseType === 'album' && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest">
                    <Check size={14} /> Вибрано
                  </div>
                )}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Основна інформація</h2>
              <p className="text-zinc-500 text-sm">Заповніть дані про реліз</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  Назва релізу <span className="text-red-800">*</span>
                </Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="bg-black/40 border-white/5 rounded-none h-14 text-white text-lg focus:border-red-700"
                  placeholder="Введіть назву..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Артист
                  </Label>
                  <Input 
                    value={formData.artist}
                    onChange={(e) => updateFormData('artist', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white"
                    placeholder="Назва артиста..."
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    Виконавець (ПІБ) <span className="text-red-800">*</span>
                  </Label>
                  <Input 
                    value={formData.performer}
                    onChange={(e) => updateFormData('performer', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white"
                    placeholder="Прізвище Ім'я Побатькові..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Композитор (ПІБ)
                  </Label>
                  <Input 
                    value={formData.composer}
                    onChange={(e) => updateFormData('composer', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white"
                    placeholder="Прізвище Ім'я Побатькові..."
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    Жанр <span className="text-red-800">*</span>
                  </Label>
                  <Select value={formData.genre} onValueChange={(val) => updateFormData('genre', val)}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none max-h-[300px]">
                      {DEFAULT_GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre} className="focus:bg-red-900/20 focus:text-red-500 text-xs uppercase font-bold">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Дата релізу
                  </Label>
                  <Input 
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => updateFormData('releaseDate', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Лейбл
                  </Label>
                  <Input 
                    value={formData.label}
                    onChange={(e) => updateFormData('label', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white"
                    placeholder="Назва лейблу..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    ISRC (необов'язково)
                  </Label>
                  <Input 
                    value={formData.isrc}
                    onChange={(e) => updateFormData('isrc', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white font-mono"
                    placeholder="XX-XXX-YY-NNNNN"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Посилання на реліз
                  </Label>
                  <Input 
                    value={formData.releaseUrl}
                    onChange={(e) => updateFormData('releaseUrl', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-700 text-white"
                    placeholder="https://..."
                  />
                  <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                    Посилання на Google Drive, DropBox, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Обкладинка</h2>
              <p className="text-zinc-500 text-sm">Завантажте обкладинку вашого релізу</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  Файл обкладинки (JPG, 1400x1400, до 5 МБ) <span className="text-red-800">*</span>
                </Label>
                
                <div className="relative">
                  <input 
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cover-upload"
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="cover-upload"
                    className={cn(
                      "flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed transition-all cursor-pointer",
                      isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-red-700/50 hover:bg-red-900/5",
                      coverPreview ? "border-white/10" : "border-white/20 bg-black/20"
                    )}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-red-700" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Завантаження...</p>
                      </div>
                    ) : coverPreview ? (
                      <img 
                        src={coverPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 p-8 text-center">
                        <Upload className="text-zinc-700" size={48} />
                        <div>
                          <p className="text-white text-xs font-black uppercase tracking-widest mb-1">Натисніть для завантаження</p>
                          <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest">Тільки JPG, до 5 МБ</p>
                        </div>
                      </div>
                    )}
                  </label>
                  
                  {coverPreview && !isUploading && (
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white h-10 w-10 rounded-none"
                      onClick={(e) => { 
                        e.preventDefault();
                        setCoverPreview(''); 
                        updateFormData('coverUrl', '');
                      }}
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-red-900/5 border border-red-900/10 flex items-start gap-3">
                <AlertCircle className="text-red-700 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Вимоги до зображення</p>
                  <ul className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest list-disc pl-4 space-y-1">
                    <li>Формат: JPG / JPEG</li>
                    <li>Розмір: 1400x1400 пікселів (квадрат)</li>
                    <li>Вага: до 5 МБ</li>
                    <li>Без логотипів соцмереж та зайвого тексту</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">
                {releaseType === 'single' ? 'Трек' : 'Треклист'}
              </h2>
              <p className="text-zinc-500 text-sm">
                {releaseType === 'single' ? 'Додайте інформацію про трек' : `Додайте треки альбому (${tracks.length} треків)`}
              </p>
            </div>

            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={track.id} className="p-6 bg-black/40 border border-white/5 rounded-none relative group">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-red-900/20 flex items-center justify-center text-red-700 text-xs font-black">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="ml-14 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
                        {releaseType === 'album' ? `Трек ${index + 1}` : 'Інформація'}
                      </span>
                      {tracks.length > 1 && (
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrack(track.id)}
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          Назва треку <span className="text-red-800">*</span>
                        </Label>
                        <Input 
                          value={track.title}
                          onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                          className="bg-black/40 border-white/5 rounded-none h-10 focus:border-red-700 text-white"
                          placeholder="Назва треку..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          Тривалість (формат: хх:хх)
                        </Label>
                        <Input 
                          value={track.duration}
                          onChange={(e) => updateTrack(track.id, 'duration', e.target.value)}
                          className="bg-black/40 border-white/5 rounded-none h-10 focus:border-red-700 text-white font-mono"
                          placeholder="03:45"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        Текст пісні / Нотатки
                      </Label>
                      <Textarea 
                        value={track.lyrics}
                        onChange={(e) => updateTrack(track.id, 'lyrics', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none min-h-[80px] resize-none text-white text-xs"
                        placeholder="Текст пісні або нотатки..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {releaseType === 'album' && (
                <Button 
                  type="button"
                  onClick={addTrack}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none"
                >
                  <Plus size={16} className="mr-2" /> Додати трек
                </Button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Перегляд та підтвердження</h2>
              <p className="text-zinc-500 text-sm">Перевірте всі дані перед відправкою</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview Card */}
              <div className="bg-black/40 border border-white/5 p-6 rounded-none">
                <div className="aspect-square mb-6 overflow-hidden border border-white/5 shadow-2xl">
                  <img 
                    src={coverPreview || formData.coverUrl} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider truncate">{formData.title || 'Назва релізу'}</h3>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">{formData.artist || 'Артист'}</p>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">{formData.genre}</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
                      {tracks.length} {tracks.length === 1 ? 'трек' : 'треків'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/5">
                  <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">Тип релізу</h4>
                  <p className="text-white font-bold uppercase tracking-wider">
                    {releaseType === 'single' ? 'Single / EP' : 'Альбом'}
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/5">
                  <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">Виконавець</h4>
                  <p className="text-white font-bold">{formData.performer}</p>
                  {formData.composer && (
                    <p className="text-zinc-500 text-sm mt-1">Композитор: {formData.composer}</p>
                  )}
                </div>

                <div className="p-4 bg-white/5 border border-white/5">
                  <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">Дата релізу</h4>
                  <p className="text-white font-bold">
                    {formData.releaseDate ? new Date(formData.releaseDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Не вказано'}
                  </p>
                </div>

                {formData.releaseUrl && (
                  <div className="p-4 bg-white/5 border border-white/5">
                    <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">Посилання на реліз</h4>
                    <a 
                      href={formData.releaseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-400 text-sm font-bold underline break-all"
                    >
                      {formData.releaseUrl}
                    </a>
                  </div>
                )}

                <div className="p-4 bg-white/5 border border-white/5">
                  <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">Треклист</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tracks.map((track, index) => (
                      <div key={track.id} className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-600 font-mono w-6">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-white truncate flex-1">{track.title}</span>
                        {track.duration && <span className="text-zinc-600 font-mono text-xs">{track.duration}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-red-900/5 border border-red-900/10 flex items-start gap-3">
                  <AlertCircle className="text-red-700 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Важливо</p>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">
                      Після відправки реліз потрапить у чергу модерації. Адміністратор перевірить дані та опублікує реліз.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="bg-black/40 border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-700 flex items-center justify-center">
              <Music className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-wider">Новий реліз</h1>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Створення релізу</p>
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={() => navigate('/releases')}
            className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-none"
          >
            Скасувати
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-black/40">
          <div 
            className="h-full bg-red-700 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps Navigation */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep < step.id}
                  className={cn(
                    "flex items-center gap-3 transition-all",
                    currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-none flex items-center justify-center transition-colors",
                    currentStep >= step.id ? 'bg-red-700' : 'bg-white/10'
                  )}>
                    <step.icon size={18} className={cn(currentStep >= step.id ? 'text-white' : 'text-zinc-500')} />
                  </div>
                  <div className="hidden md:block">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      currentStep === step.id ? 'text-white' : currentStep > step.id ? 'text-zinc-400' : 'text-zinc-600'
                    )}>
                      {step.name}
                    </p>
                    <p className="text-[9px] text-zinc-600">{step.title}</p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-px mx-4 transition-colors",
                    currentStep > step.id ? 'bg-red-700' : 'bg-white/10'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="min-h-[500px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting || isUploading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-none disabled:opacity-30"
          >
            <ChevronLeft size={16} className="mr-2" /> Назад
          </Button>

          {currentStep < STEPS.length ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceed() || isUploading}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none disabled:opacity-30"
            >
              {isUploading ? 'Завантаження...' : 'Далі'} <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Відправка...</>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Відправити на модерацію
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRelease;