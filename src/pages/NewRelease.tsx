import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, Trash2, Check, ChevronRight, ChevronLeft, Image, Disc, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useDataStore, useAuthStore, DEFAULT_GENRES } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

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
      case 1: return true;
      case 2: return formData.title.trim() !== '' && formData.artist.trim() !== '' && formData.performer.trim() !== '';
      case 3: return formData.coverUrl.trim() !== '';
      case 4: return tracks.every(t => t.title.trim() !== '');
      case 5: return true;
      default: return false;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const releaseData: any = {
        ...formData,
        status: defaultStatus,
        isSingle: releaseType === 'single',
        tracks: releaseType === 'album' ? tracks : undefined,
      };

      const result = await addRelease(releaseData);

      if (result) {
        showSuccess('Реліз успішно відправлено на модерацію!');
        await fetchReleases(user?.id, user?.role);
        navigate('/releases');
      }
    } catch (error) {
      showError('Помилка при створенні релізу');
    } finally {
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
                  releaseType === 'single' ? "border-red-700 bg-red-900/10" : "border-white/10 bg-black/40 hover:border-white/30"
                )}
              >
                <div className={cn("w-16 h-16 rounded-none flex items-center justify-center mb-6", releaseType === 'single' ? 'bg-red-700' : 'bg-white/10')}>
                  <Music className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Single</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Один трек або EP до 5 треків</p>
              </button>
              <button
                type="button"
                onClick={() => { setReleaseType('album'); if (tracks.length === 1) addTrack(); }}
                className={cn(
                  "p-8 border-2 transition-all duration-300 rounded-none text-left group",
                  releaseType === 'album' ? "border-red-700 bg-red-900/10" : "border-white/10 bg-black/40 hover:border-white/30"
                )}
              >
                <div className={cn("w-16 h-16 rounded-none flex items-center justify-center mb-6", releaseType === 'album' ? 'bg-red-700' : 'bg-white/10')}>
                  <Disc className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Альбом</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Повноформатний альбом від 6 треків</p>
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва релізу *</Label>
                <Input value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-14 text-white text-lg" placeholder="Введіть назву..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Артист</Label>
                  <Input value={formData.artist} onChange={(e) => updateFormData('artist', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-12" placeholder="Назва артиста..." />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Виконавець (ПІБ) *</Label>
                  <Input value={formData.performer} onChange={(e) => updateFormData('performer', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-12" placeholder="Прізвище Ім'я Побатькові..." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Жанр *</Label>
                  <Select value={formData.genre} onValueChange={(val) => updateFormData('genre', val)}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {DEFAULT_GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre} className="text-xs uppercase font-bold">{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Дата релізу</Label>
                  <Input type="date" value={formData.releaseDate} onChange={(e) => updateFormData('releaseDate', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-12" />
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
              <p className="text-zinc-500 text-sm">Вкажіть посилання на обкладинку</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на обкладинку (URL) *</Label>
                <Input value={formData.coverUrl} onChange={(e) => updateFormData('coverUrl', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-14 text-white" placeholder="https://example.com/cover.jpg" />
              </div>
              {formData.coverUrl && (
                <div className="aspect-square max-w-xs mx-auto border border-white/10 overflow-hidden">
                  <img src={formData.coverUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://jurbamusic.iceiy.com/releasepreview.png')} />
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">{releaseType === 'single' ? 'Трек' : 'Треклист'}</h2>
            </div>
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={track.id} className="p-6 bg-black/40 border border-white/5 rounded-none relative group">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-red-900/20 flex items-center justify-center text-red-700 text-xs font-black">{String(index + 1).padStart(2, '0')}</div>
                  <div className="ml-14 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Назва треку *</Label>
                        <Input value={track.title} onChange={(e) => updateTrack(track.id, 'title', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-10" placeholder="Назва треку..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Тривалість (хх:хх)</Label>
                        <Input value={track.duration} onChange={(e) => updateTrack(track.id, 'duration', e.target.value)} className="bg-black/40 border-white/5 rounded-none h-10" placeholder="03:45" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {releaseType === 'album' && (
                <Button type="button" onClick={addTrack} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none">
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
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Підтвердження</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/40 border border-white/5 p-6 rounded-none">
                <div className="aspect-square mb-6 overflow-hidden border border-white/5">
                  <img src={formData.coverUrl || 'https://jurbamusic.iceiy.com/releasepreview.png'} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider truncate">{formData.title || 'Назва'}</h3>
                <p className="text-sm text-zinc-500 uppercase tracking-wider">{formData.artist || 'Артист'}</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/5">
                  <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">Виконавець</h4>
                  <p className="text-white font-bold">{formData.performer}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5">
                  <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">Дата релізу</h4>
                  <p className="text-white font-bold">{formData.releaseDate}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="bg-black/40 border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-700 flex items-center justify-center"><Music className="text-white" size={20} /></div>
            <h1 className="text-lg font-black text-white uppercase tracking-wider">Новий реліз</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/releases')} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-none">Скасувати</Button>
        </div>
        <div className="h-1 bg-black/40"><div className="h-full bg-red-700 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="min-h-[500px]">{renderStepContent()}</div>
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1 || isSubmitting} className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-none">
            <ChevronLeft size={16} className="mr-2" /> Назад
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none">
              Далі <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Check size={16} className="mr-2" /> Відправити</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRelease;