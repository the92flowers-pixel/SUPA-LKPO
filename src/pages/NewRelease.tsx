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
import ImageUploader from '@/components/ui/ImageUploader';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const NewRelease = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addRelease, statuses, fetchReleases, fields } = useDataStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split('T')[0];

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
    { id: '1', title: '', fileName: '', duration: '', explicit: false, lyrics: '', position: 1 }
  ]);
  
  const defaultStatus = statuses.find((s: any) => s.isDefault)?.name || 'На модерації';
  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.artist) {
        showError('Заповніть основні поля (назва та артист)');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!formData.copyrightConfirmed) {
      showError('Ви повинні підтвердити авторські права');
      return;
    }

    if (!formData.releaseUrl) {
      showError('Вкажіть посилання на аудіофайли');
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

  const handleCoverUpload = (url: string) => {
    updateFormData('coverImageLocal', url);
    updateFormData('coverUrl', url);
  };

  const handleCoverRemove = () => {
    updateFormData('coverImageLocal', '');
    updateFormData('coverUrl', '');
  };

  const handleExternalUrlChange = (url: string) => {
    updateFormData('coverUrl', url);
    updateFormData('coverImageLocal', '');
  };

  const hasCover = formData.coverImageLocal || formData.coverUrl;
  const displayCover = formData.coverImageLocal || formData.coverUrl || FALLBACK_IMAGE;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Основна інформація</h2>
              <p className="text-zinc-500 text-xs sm:text-sm">Вкажіть базові дані вашого майбутнього релізу</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва релізу *</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => updateFormData('title', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-14 text-lg font-bold" 
                  placeholder="Назва вашого треку або альбому" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Артист *</Label>
                <Input 
                  value={formData.artist} 
                  onChange={(e) => updateFormData('artist', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Жанр</Label>
                  <Select value={formData.genre} onValueChange={(v) => updateFormData('genre', v)}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {DEFAULT_GENRES.map(g => <SelectItem key={g} value={g} className="text-xs uppercase font-bold">{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Тип релізу</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className={cn("flex-1 rounded-none h-12 text-[10px] font-black uppercase tracking-widest", releaseType === 'single' ? "bg-red-700 border-red-700 text-white" : "border-white/5 text-zinc-500")}
                      onClick={() => setReleaseType('single')}
                    >
                      Single
                    </Button>
                    <Button 
                      variant="outline" 
                      className={cn("flex-1 rounded-none h-12 text-[10px] font-black uppercase tracking-widest", releaseType === 'album' ? "bg-red-700 border-red-700 text-white" : "border-white/5 text-zinc-500")}
                      onClick={() => setReleaseType('album')}
                    >
                      Album / EP
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Метадані та Дати</h2>
              <p className="text-zinc-500 text-xs sm:text-sm">Додаткова інформація для стрімінгових платформ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Дата виходу (мін. 7 днів)</Label>
                <Input 
                  type="date" 
                  min={minDateStr}
                  value={formData.releaseDate} 
                  onChange={(e) => updateFormData('releaseDate', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Лейбл</Label>
                <Input 
                  value={formData.label} 
                  onChange={(e) => updateFormData('label', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Композитор (ПІБ)</Label>
                <Input 
                  value={formData.composer} 
                  onChange={(e) => updateFormData('composer', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12" 
                  placeholder="Ім'я Прізвище"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Виконавець (ПІБ)</Label>
                <Input 
                  value={formData.performer} 
                  onChange={(e) => updateFormData('performer', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12" 
                  placeholder="Ім'я Прізвище"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опис релізу</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => updateFormData('description', e.target.value)} 
                className="bg-black/40 border-white/5 rounded-none min-h-[100px] resize-none" 
                placeholder="Розкажіть про ваш реліз..."
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Обкладинка</h2>
              <p className="text-zinc-500 text-xs sm:text-sm">Завантажте квадратне зображення високої якості</p>
            </div>
            
            <ImageUploader 
              bucket="covers"
              path={`releases/${user?.id}`}
              currentLocalUrl={formData.coverImageLocal}
              currentExternalUrl={formData.coverUrl}
              onUpload={handleCoverUpload}
              onExternalUrlChange={handleExternalUrlChange}
              onRemove={handleCoverRemove}
              label="Обкладинка релізу"
              className="max-w-xl mx-auto"
              acceptedTypes="image/jpeg,image/jpg,image/png,image/webp"
              maxSizeMB={10}
              minDimensions={{ width: 1400, height: 1400 }}
              aspectRatio="1:1"
            />

            {/* Requirements */}
            <div className="p-6 bg-red-900/5 border border-red-900/10 space-y-3 mt-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                <AlertCircle size={14} /> Вимоги до обкладинки
              </p>
              <ul className="text-[9px] text-zinc-500 space-y-1 uppercase font-bold tracking-wider">
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-green-500" /> Тільки квадратні зображення (1:1)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-green-500" /> Мінімальний розмір: 1400x1400px
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-green-500" /> Максимальний розмір: 10МБ
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-green-500" /> Без логотипів стрімінгів та соцмереж
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-green-500" /> Без контактної інформації та адрес сайтів
                </li>
                <li className="flex items-center gap-2">
                  <Check size={10} className="text-green-500" /> Формати: JPG, PNG, WebP
                </li>
              </ul>
            </div>

            {/* Нагадування */}
            {!hasCover && (
              <div className="p-4 bg-amber-900/10 border border-amber-900/20 flex items-start gap-3">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  Обкладинка необов'язкова на цьому етапі. Ви зможете завантажити її пізніше через редагування релізу.
                </p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Юридична інформація</h2>
              <p className="text-zinc-500 text-xs sm:text-sm">Підтвердження прав та посилання на файли</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на аудіофайли (WAV) *</Label>
                <Input 
                  value={formData.releaseUrl} 
                  onChange={(e) => updateFormData('releaseUrl', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12 font-mono text-xs" 
                  placeholder="Google Drive, Dropbox або інше пряме посилання"
                />
                <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">⚡ Завантажте треки одним архівом або папкою</p>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Докази авторських прав (Опціонально)</Label>
                <Input 
                  value={formData.copyrights} 
                  onChange={(e) => updateFormData('copyrights', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12 font-mono text-xs" 
                  placeholder="Посилання на проект, договір або відео процесу"
                />
              </div>
              <div className="flex items-start space-x-4 p-6 bg-white/5 border border-white/5">
                <Checkbox 
                  id="copyright" 
                  checked={formData.copyrightConfirmed} 
                  onCheckedChange={(checked) => updateFormData('copyrightConfirmed', checked as boolean)}
                  className="mt-1 border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none shrink-0"
                />
                <Label htmlFor="copyright" className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-bold uppercase tracking-wider cursor-pointer">
                  Я підтверджую, що володію всіма необхідними правами на цей контент (музика, текст, обкладинка) або маю дозвіл від правовласників на його дистрибуцію.
                </Label>
              </div>
            </div>

            {/* Preview Card */}
            {hasCover && (
              <div className="p-6 bg-black/40 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Попередній перегляд</p>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 shrink-0 overflow-hidden border border-white/10">
                    <img 
                      src={displayCover} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-white uppercase tracking-wider">{formData.title || 'Назва релізу'}</p>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{formData.artist || 'Артист'}</p>
                    <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-4">
                      {releaseType === 'single' ? 'Single' : 'Album / EP'} • {formData.genre}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    { id: 1, label: 'Інфо', icon: Music },
    { id: 2, label: 'Мета', icon: FileText },
    { id: 3, label: 'Арт', icon: Image },
    { id: 4, label: 'Права', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 z-0" />
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 transition-all duration-500 rounded-none",
                currentStep >= step.id ? "bg-red-700 border-red-700 text-white" : "bg-[#050505] border-white/5 text-zinc-700"
              )}>
                <step.icon size={18} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                currentStep >= step.id ? "text-white" : "text-zinc-700"
              )}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="min-h-[400px] sm:min-h-[500px]">
          {renderStepContent()}
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-10">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={currentStep === 1}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white rounded-none h-12 px-8"
          >
            <ChevronLeft className="mr-2" size={16} /> Назад
          </Button>
          
          {currentStep < 4 ? (
            <Button 
              onClick={handleNext}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none"
            >
              Далі <ChevronRight className="ml-2" size={16} />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.releaseUrl || !formData.copyrightConfirmed}
              className="bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase tracking-widest h-12 px-12 rounded-none shadow-[0_0_30px_rgba(22,163,74,0.2)] disabled:opacity-30"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
              Відправити реліз
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRelease;