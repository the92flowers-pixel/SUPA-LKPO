import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Music, Plus, Trash2, Check, ChevronRight, ChevronLeft, 
  Image as ImageIcon, Disc, FileText, AlertCircle, 
  Loader2, Shield, Calendar, Hash, Upload, 
  ListMusic, Layers, ArrowLeft, Save, Info
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

const EditRelease = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { releases, updateRelease, fields } = useDataStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');

  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);

  useEffect(() => {
    const release = releases.find(r => r.id === id);
    if (release) {
      setFormData({
        ...release,
        releaseDate: release.releaseDate || '',
      });
      setTracks(release.tracks || []);
      setReleaseType(release.isSingle ? 'single' : 'album');
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        if (isLoading) navigate('/releases');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [id, releases, navigate]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addTrack = () => {
    setTracks([...tracks, { id: Date.now().toString(), title: '', explicit: false, position: tracks.length + 1 }]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length === 1) return;
    setTracks(tracks.filter(t => t.id !== id).map((t, i) => ({ ...t, position: i + 1 })));
  };

  const updateTrack = (id: string, field: string, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleNext = () => {
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
    const loadingId = showLoading('Оновлення релізу...');
    
    try {
      const finalData = {
        ...formData,
        isSingle: releaseType === 'single',
        tracks: tracks,
        status: 'На модерації'
      };

      await updateRelease(id!, finalData);
      showSuccess('Реліз оновлено та відправлено на повторну модерацію!');
      navigate('/releases');
    } catch (error) {
      showError('Помилка при оновленні релізу');
    } finally {
      setIsSubmitting(false);
      dismissToast(loadingId);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-red-700" size={40} />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Завантаження даних...</p>
        </div>
      </div>
    );
  }

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
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Артист *</Label>
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
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Дата виходу</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <Input 
                    type="date" 
                    value={formData.releaseDate} 
                    onChange={(e) => updateFormData('releaseDate', e.target.value)} 
                    className="bg-white/[0.03] border-white/5 pl-12 h-14 rounded-none focus:border-red-700/50" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Лейбл</Label>
                <Input 
                  value={formData.label} 
                  onChange={(e) => updateFormData('label', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Композитор (ПІБ)</Label>
                <Input 
                  value={formData.composer} 
                  onChange={(e) => updateFormData('composer', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Виконавець (ПІБ)</Label>
                <Input 
                  value={formData.performer} 
                  onChange={(e) => updateFormData('performer', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Опис релізу</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => updateFormData('description', e.target.value)} 
                className="bg-white/[0.03] border-white/5 rounded-none min-h-[120px] resize-none focus:border-red-700/50 p-4" 
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={track.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-700 text-white font-black text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Назва треку *</Label>
                    <Input 
                      value={track.title} 
                      onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                      className="bg-transparent border-b border-white/10 border-t-0 border-x-0 rounded-none h-10 text-base font-bold focus:border-red-700 transition-all px-0"
                    />
                  </div>
                  <div className="flex items-end gap-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox 
                        id={`explicit-${track.id}`} 
                        checked={track.explicit} 
                        onCheckedChange={(val) => updateTrack(track.id, 'explicit', val)}
                        className="border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none w-5 h-5"
                      />
                      <Label htmlFor={`explicit-${track.id}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer group-hover:text-zinc-300 transition-colors">Explicit</Label>
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
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Докази авторських прав (Опціонально)</Label>
                <Input 
                  value={formData.copyrights} 
                  onChange={(e) => updateFormData('copyrights', e.target.value)} 
                  className="bg-white/[0.03] border-white/5 h-14 rounded-none focus:border-red-700/50 font-mono text-xs" 
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
                  Я ПІДТВЕРДЖУЮ, ЩО ВОЛОДІЮ ВСІМА НЕОБХІДНИМИ ПРАВАМИ НА ЦЕЙ КОНТЕНТ.
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
      <div className="flex items-center justify-between mb-12">
        <Link to="/releases">
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white rounded-none">
            <ArrowLeft size={16} className="mr-2" /> Назад до списку
          </Button>
        </Link>
        <div className="text-right">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Редагування</h1>
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-[0.4em]">Крок {currentStep} з {steps.length}</p>
        </div>
      </div>

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
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {formData.rejection_reason && (
          <div className="mb-10 p-8 bg-red-900/10 border border-red-900/20 flex items-start gap-6 animate-in zoom-in-95 duration-500">
            <AlertCircle className="text-red-700 shrink-0" size={24} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-red-700 mb-2">Зауваження модератора</p>
              <p className="text-sm text-zinc-300 font-medium leading-relaxed">{formData.rejection_reason}</p>
            </div>
          </div>
        )}

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
                {isSubmitting ? <Loader2 className="animate-spin mr-3" size={20} /> : <><Save className="mr-3" size={20} /> Зберегти зміни</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRelease;