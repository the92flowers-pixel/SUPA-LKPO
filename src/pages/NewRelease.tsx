import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Music, Plus, Trash2, Check, ChevronRight, ChevronLeft, 
  Image as ImageIcon, Disc, FileText, AlertCircle, 
  Loader2, Shield, Calendar, Hash, Upload, 
  ListMusic, Layers, ArrowLeft, Info, User, Clock, FileAudio
} from 'lucide-react';
import { useDataStore, useAuthStore, DEFAULT_GENRES } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/ui/ImageUploader';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const NewRelease = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addRelease, statuses, fields } = useDataStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split('T')[0];

  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);

  const [formData, setFormData] = useState<any>({
    title: '',
    artist: user?.artistName || '',
    genre: 'Другое',
    releaseDate: minDateStr,
    coverUrl: '',
    coverImageLocal: '',
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
    { 
      id: Date.now().toString(), 
      title: '', 
      fileName: '',
      previewStart: '0',
      artist: user?.artistName || '',
      composer: '',
      lyricist: '',
      explicit: false, 
      position: 1 
    }
  ]);
  
  const defaultStatus = statuses.find((s: any) => s.isDefault)?.name || 'На модерації';

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addTrack = () => {
    setTracks([...tracks, { 
      id: Date.now().toString(), 
      title: '', 
      fileName: '',
      previewStart: '0',
      artist: user?.artistName || '',
      composer: '',
      lyricist: '',
      explicit: false, 
      position: tracks.length + 1 
    }]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length === 1) return;
    setTracks(tracks.filter(t => t.id !== id).map((t, i) => ({ ...t, position: i + 1 })));
  };

  const updateTrack = (id: string, field: string, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleNext = () => {
    if (currentStep === 1 && (!formData.title || !formData.artist)) {
      showError('Заповніть основні поля');
      return;
    }
    if (currentStep === 3) {
      const invalidTrack = tracks.find(t => !t.title || !t.fileName || !t.artist || !t.composer || !t.lyricist);
      if (invalidTrack) {
        showError('Заповніть всі обов\'язкові поля для кожного треку (Назва, Файл, Артист, Автори)');
        return;
      }
    }
    
    if (currentStep === 5) {
      const missingRequired = releaseFields.find(f => f.required && !formData[f.name]);
      if (missingRequired) {
        showError(`Поле "${missingRequired.label}" є обов'язковим`);
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.copyrightConfirmed) {
      showError('Ви повинні підтвердити авторські права');
      return;
    }

    setIsSubmitting(true);
    const loadingId = showLoading('Створення релізу...');
    
    try {
      const finalData = {
        ...formData,
        isSingle: releaseType === 'single',
        tracks: tracks,
        status: defaultStatus
      };

      await addRelease(finalData);
      showSuccess('Реліз успішно відправлено на модерацію!');
      navigate('/releases');
    } catch (error) {
      showError('Помилка при створенні релізу');
    } finally {
      setIsSubmitting(false);
      dismissToast(loadingId);
    }
  };

  const steps = [
    { id: 1, label: 'Інфо', icon: Music, desc: 'Базові дані' },
    { id: 2, label: 'Мета', icon: FileText, desc: 'Метадані' },
    { id: 3, label: 'Треки', icon: ListMusic, desc: 'Трекліст' },
    { id: 4, label: 'Арт', icon: ImageIcon, desc: 'Обкладинка' },
    { id: 5, label: 'Додатково', icon: Layers, desc: 'Поля лейбла' },
    { id: 6, label: 'Права', icon: Shield, desc: 'Юридично' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Назва релізу *</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => updateFormData('title', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 focus:border-red-700/50 rounded-none h-16 text-xl font-black uppercase tracking-tight transition-all" 
                  placeholder="ВВЕДІТЬ НАЗВУ ТРЕКУ АБО АЛЬБОМУ" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Головний Артист *</Label>
                <Input 
                  value={formData.artist} 
                  onChange={(e) => updateFormData('artist', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 focus:border-red-700/50 rounded-none h-14 text-lg font-bold uppercase tracking-wider transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Жанр</Label>
                  <Select value={formData.genre} onValueChange={(v) => updateFormData('genre', v)}>
                    <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:ring-0 focus:border-red-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {DEFAULT_GENRES.map(g => <SelectItem key={g} value={g} className="text-xs uppercase font-bold focus:bg-red-900/20">{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Тип релізу</Label>
                  <div className="flex p-1 bg-white/[0.03] border border-white/5 h-14">
                    <button 
                      className={cn(
                        "flex-1 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        releaseType === 'single' ? "bg-red-700 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                      )}
                      onClick={() => {
                        setReleaseType('single');
                        if (tracks.length > 1) setTracks([tracks[0]]);
                      }}
                    >
                      Single
                    </button>
                    <button 
                      className={cn(
                        "flex-1 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        releaseType === 'album' ? "bg-red-700 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                      )}
                      onClick={() => setReleaseType('album')}
                    >
                      Album / EP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Дата виходу (мін. 7 днів)</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <Input 
                    type="date" 
                    min={minDateStr}
                    value={formData.releaseDate} 
                    onChange={(e) => updateFormData('releaseDate', e.target.value)} 
                    className="bg-white/[0.03] border-white/5 pl-12 h-14 rounded-none focus:border-red-700/50" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Лейбл *</Label>
                <Select value={formData.label} onValueChange={(v) => updateFormData('label', v)}>
                  <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:ring-0 focus:border-red-700/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    <SelectItem value="ЖУРБА MUSIC" className="text-xs uppercase font-bold focus:bg-red-900/20">ЖУРБА MUSIC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Головний Композитор (ПІБ)</Label>
                <Input 
                  value={formData.composer} 
                  onChange={(e) => updateFormData('composer', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50" 
                  placeholder="ІМ'Я ПРІЗВИЩЕ"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Головний Виконавець (ПІБ)</Label>
                <Input 
                  value={formData.performer} 
                  onChange={(e) => updateFormData('performer', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50" 
                  placeholder="ІМ'Я ПРІЗВИЩЕ"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Опис релізу</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => updateFormData('description', e.target.value)} 
                className="bg-white/[0.03] border-white/5 rounded-none min-h-[120px] resize-none focus:border-red-700/50 p-4" 
                placeholder="РОЗКАЖІТЬ ІСТОРІЮ ВАШОГО РЕЛІЗУ..."
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              {tracks.map((track, index) => (
                <div key={track.id} className="p-6 bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-700 text-white font-black text-sm">
                        {index + 1}
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Дані треку</h4>
                    </div>
                    {releaseType === 'album' && tracks.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-700 hover:text-red-500 h-10 w-10 transition-colors"
                        onClick={() => removeTrack(track.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Назва треку *</Label>
                      <Input 
                        value={track.title} 
                        onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-12 text-sm font-bold focus:border-red-700 transition-all"
                        placeholder="ВВЕДІТЬ НАЗВУ..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Назва файлу в архіві *</Label>
                      <div className="relative">
                        <FileAudio className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                        <Input 
                          value={track.fileName} 
                          onChange={(e) => updateTrack(track.id, 'fileName', e.target.value)}
                          className="bg-black/40 border-white/5 pl-10 rounded-none h-12 text-xs font-mono"
                          placeholder="track_01.wav"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Артист (Сценічне ім'я) *</Label>
                      <Input 
                        value={track.artist} 
                        onChange={(e) => updateTrack(track.id, 'artist', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-12 text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Початок Preview (сек) *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                        <Input 
                          type="number"
                          value={track.previewStart} 
                          onChange={(e) => updateTrack(track.id, 'previewStart', e.target.value)}
                          className="bg-black/40 border-white/5 pl-10 rounded-none h-12 text-sm"
                          placeholder="30"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Композитор (ПІБ) *</Label>
                      <Input 
                        value={track.composer} 
                        onChange={(e) => updateTrack(track.id, 'composer', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-12 text-sm"
                        placeholder="ІВАНОВ ІВАН ІВАНОВИЧ"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Автор тексту (ПІБ) *</Label>
                      <Input 
                        value={track.lyricist} 
                        onChange={(e) => updateTrack(track.id, 'lyricist', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-12 text-sm"
                        placeholder="ПЕТРОВ ПЕТРО ПЕТРОВИЧ"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox 
                      id={`explicit-${track.id}`} 
                      checked={track.explicit} 
                      onCheckedChange={(val) => updateTrack(track.id, 'explicit', val)}
                      className="border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none w-5 h-5"
                    />
                    <Label htmlFor={`explicit-${track.id}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer group-hover:text-zinc-300 transition-colors">Explicit Content</Label>
                  </div>
                </div>
              ))}
              
              {releaseType === 'album' && (
                <Button 
                  onClick={addTrack}
                  variant="outline"
                  className="w-full border-dashed border-white/10 hover:border-red-700/50 hover:bg-red-700/5 h-16 rounded-none text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-red-500 transition-all"
                >
                  <Plus size={18} className="mr-3" /> Додати ще один трек
                </Button>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-xl mx-auto">
              <ImageUploader 
                bucket="covers"
                path={`releases/${user?.id}`}
                currentLocalUrl={formData.coverImageLocal}
                currentExternalUrl={formData.coverUrl}
                onUpload={(url) => updateFormData('coverImageLocal', url)}
                onExternalUrlChange={(url) => updateFormData('coverUrl', url)}
                onRemove={() => updateFormData('coverImageLocal', '')}
                label="Обкладинка релізу"
              />
            </div>

            <div className="p-8 bg-red-900/5 border border-red-900/10 space-y-4 max-w-2xl mx-auto">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700 flex items-center gap-3">
                <AlertCircle size={16} /> Кодекс обкладинки
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ul className="text-[10px] text-zinc-500 space-y-2 uppercase font-bold tracking-wider">
                  <li className="flex items-center gap-2"><Check size={12} className="text-red-700" /> Тільки квадрат (1:1)</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-red-700" /> Мін. 1500x1500px</li>
                </ul>
                <ul className="text-[10px] text-zinc-500 space-y-2 uppercase font-bold tracking-wider">
                  <li className="flex items-center gap-2"><X size={12} className="text-red-700" /> Без лого стрімінгів</li>
                  <li className="flex items-center gap-2"><X size={12} className="text-red-700" /> Без контактів/URL</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
              {releaseFields.length > 0 ? (
                releaseFields.map(field => (
                  <div key={field.id} className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                      {field.label} {field.required && '*'}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea 
                        value={formData[field.name] || ''} 
                        onChange={(e) => updateFormData(field.name, e.target.value)}
                        className="bg-white/[0.03] border-white/5 rounded-none min-h-[120px] focus:border-red-700/50 p-4"
                      />
                    ) : field.type === 'select' ? (
                      <Select value={formData[field.name] || ''} onValueChange={(v) => updateFormData(field.name, v)}>
                        <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:ring-0 focus:border-red-700/50">
                          <SelectValue placeholder="ОБЕРІТЬ ВАРІАНТ..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                          {field.options?.split(',').map((opt: string) => (
                            <SelectItem key={opt.trim()} value={opt.trim()} className="text-xs uppercase font-bold focus:bg-red-900/20">{opt.trim()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        type={field.type}
                        value={formData[field.name] || ''} 
                        onChange={(e) => updateFormData(field.name, e.target.value)}
                        className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-white/5">
                  <Layers className="mx-auto text-zinc-800 mb-4" size={40} />
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Додаткових полів не встановлено</p>
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Посилання на аудіофайли (WAV) *</Label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <Input 
                    value={formData.releaseUrl} 
                    onChange={(e) => updateFormData('releaseUrl', e.target.value)} 
                    className="bg-white/[0.03] border-white/5 pl-12 h-14 rounded-none focus:border-red-700/50 font-mono text-xs" 
                    placeholder="GOOGLE DRIVE, DROPBOX АБО ПРЯМЕ ПОСИЛАННЯ"
                  />
                </div>
                <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-[0.2em] ml-1">⚡ ЗАВАНТАЖТЕ ТРЕКИ ОДНИМ АРХІВОМ АБО ПАПКОЮ</p>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Докази авторських прав (Опціонально)</Label>
                <Input 
                  value={formData.copyrights} 
                  onChange={(e) => updateFormData('copyrights', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50 font-mono text-xs" 
                  placeholder="ПОСИЛАННЯ НА ПРОЕКТ, ДОГОВІР АБО ВІДЕО"
                />
              </div>
              <div className="flex items-start space-x-5 p-8 bg-red-900/5 border border-red-900/10 group cursor-pointer transition-all hover:bg-red-900/10" onClick={() => updateFormData('copyrightConfirmed', !formData.copyrightConfirmed)}>
                <Checkbox 
                  id="copyright" 
                  checked={formData.copyrightConfirmed} 
                  onCheckedChange={(checked) => updateFormData('copyrightConfirmed', checked as boolean)}
                  className="mt-1 border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none w-6 h-6"
                />
                <Label htmlFor="copyright" className="text-[11px] text-zinc-400 leading-relaxed font-bold uppercase tracking-wider cursor-pointer select-none">
                  Я ПІДТВЕРДЖУЮ, ЩО ВОЛОДІЮ ВСІМА НЕОБХІДНИМИ ПРАВАМИ НА ЦЕЙ КОНТЕНТ (МУЗИКА, ТЕКСТ, ОБКЛАДИНКА) АБО МАЮ ДОЗВІЛ ВІД ПРАВОВЛАСНИКІВ НА ЙОГО ДИСТРИБУЦІЮ.
                </Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link to="/releases">
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white rounded-none">
            <ArrowLeft size={16} className="mr-2" /> Назад до списку
          </Button>
        </Link>
        <div className="text-right">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Новий реліз</h1>
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-[0.4em]">Крок {currentStep} з {steps.length}</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-px bg-red-700 -translate-y-1/2 z-0 transition-all duration-700" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
              <div className={cn(
                "w-12 h-12 flex items-center justify-center border-2 transition-all duration-700 rounded-none backdrop-blur-xl",
                currentStep >= step.id ? "bg-red-700 border-red-700 text-white shadow-[0_0_20px_rgba(185,28,28,0.4)]" : "bg-[#050505] border-white/10 text-zinc-700"
              )}>
                <step.icon size={20} />
              </div>
              <div className="hidden sm:flex flex-col items-center">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  currentStep >= step.id ? "text-white" : "text-zinc-700"
                )}>{step.label}</span>
                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-800 mt-1">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-black/40 border border-white/5 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          
          <div className="min-h-[450px]">
            <div className="mb-12">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                <span className="text-red-700">/</span> {steps[currentStep - 1].label}
              </h2>
              <div className="h-px w-20 bg-red-700 mt-4" />
            </div>
            
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-12">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className="w-full sm:w-auto text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white rounded-none h-14 px-10 transition-all"
            >
              <ChevronLeft className="mr-2" size={18} /> Назад
            </Button>
            
            {currentStep < 6 ? (
              <Button 
                onClick={handleNext}
                className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-[11px] font-black uppercase tracking-[0.3em] h-14 px-14 rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)] transition-all group"
              >
                Далі <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-[11px] font-black uppercase tracking-[0.3em] h-14 px-16 rounded-none shadow-[0_0_40px_rgba(22,163,74,0.2)] transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-3" size={20} /> : <><Check className="mr-3" size={20} /> Відправити реліз</>}
              </Button>
            )}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-10 flex items-center gap-4 px-8 py-4 bg-white/[0.02] border border-white/5">
          <Info size={16} className="text-red-700" />
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            Порада: Ви можете зберегти реліз як чернетку, просто заповнивши основні поля та натиснувши "Назад".
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewRelease;