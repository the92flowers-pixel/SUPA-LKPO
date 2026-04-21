import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Music, Plus, Trash2, Check, ChevronRight, ChevronLeft, Image, Disc, FileText, AlertCircle, Loader2, Shield, ListMusic, Save, Layers } from 'lucide-react';
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
    // Dynamic fields validation
    if (currentStep === 5) {
      const missingRequired = releaseFields.find(f => f.required && !formData[f.name]);
      if (missingRequired) {
        showError(`Поле "${missingRequired.label}" є обов'язковим`);
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
        <Loader2 className="animate-spin text-red-700" size={32} />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Основна інформація</h2>
              <p className="text-zinc-500 text-xs sm:text-sm">Редагування базових даних релізу</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва релізу *</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => updateFormData('title', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-14 text-lg font-bold" 
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Дата виходу</Label>
                <Input 
                  type="date" 
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
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опис релізу</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => updateFormData('description', e.target.value)} 
                className="bg-black/40 border-white/5 rounded-none min-h-[100px] resize-none" 
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Треклист</h2>
            </div>
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={track.id} className="flex flex-col sm:flex-row gap-4 p-6 bg-white/5 border border-white/5 relative group">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-700/10 text-red-700 font-black text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Назва треку *</Label>
                    <Input 
                      value={track.title} 
                      onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-10 text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox 
                        id={`explicit-${track.id}`} 
                        checked={track.explicit} 
                        onCheckedChange={(val) => updateTrack(track.id, 'explicit', val)}
                        className="border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none"
                      />
                      <Label htmlFor={`explicit-${track.id}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer">Explicit</Label>
                    </div>
                    {releaseType === 'album' && (
                      <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-red-500 h-10 w-10" onClick={() => removeTrack(track.id)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {releaseType === 'album' && (
                <Button onClick={addTrack} variant="outline" className="w-full border-dashed border-white/10 h-14 rounded-none text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500">
                  <Plus size={16} className="mr-2" /> Додати трек
                </Button>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Обкладинка</h2>
            </div>
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
        );
      case 5:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Додаткові поля</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {releaseFields.map(field => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {field.label} {field.required && '*'}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      value={formData[field.name] || ''} 
                      onChange={(e) => updateFormData(field.name, e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none min-h-[100px]"
                    />
                  ) : field.type === 'select' ? (
                    <Select value={formData[field.name] || ''} onValueChange={(v) => updateFormData(field.name, v)}>
                      <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                        {field.options?.split(',').map((opt: string) => (
                          <SelectItem key={opt.trim()} value={opt.trim()} className="text-xs uppercase font-bold">{opt.trim()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      type={field.type}
                      value={formData[field.name] || ''} 
                      onChange={(e) => updateFormData(field.name, e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-12"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">Юридична інформація</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на аудіофайли (WAV) *</Label>
                <Input 
                  value={formData.releaseUrl} 
                  onChange={(e) => updateFormData('releaseUrl', e.target.value)} 
                  className="bg-black/40 border-white/5 rounded-none h-12 font-mono text-xs" 
                />
              </div>
              <div className="flex items-start space-x-4 p-6 bg-white/5 border border-white/5">
                <Checkbox 
                  id="copyright" 
                  checked={formData.copyrightConfirmed} 
                  onCheckedChange={(checked) => updateFormData('copyrightConfirmed', checked as boolean)}
                  className="border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none"
                />
                <Label htmlFor="copyright" className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-bold uppercase tracking-wider cursor-pointer">
                  Я підтверджую, що володію всіма необхідними правами на цей контент.
                </Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    { id: 1, label: 'Інфо' },
    { id: 2, label: 'Мета' },
    { id: 3, label: 'Треки' },
    { id: 4, label: 'Арт' },
    { id: 5, label: 'Додатково' },
    { id: 6, label: 'Права' },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 z-0" />
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 flex items-center justify-center border-2 transition-all duration-500 rounded-none",
                currentStep >= step.id ? "bg-red-700 border-red-700 text-white" : "bg-[#050505] border-white/5 text-zinc-700"
              )}>
                {step.id}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-widest", currentStep >= step.id ? "text-white" : "text-zinc-700")}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {formData.rejection_reason && (
          <div className="mb-10 p-6 bg-red-900/10 border border-red-900/20 flex items-start gap-4">
            <AlertCircle className="text-red-700 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Зауваження модератора</p>
              <p className="text-sm text-zinc-300 mt-1 font-medium">{formData.rejection_reason}</p>
            </div>
          </div>
        )}

        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-10">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white rounded-none h-12 px-8">
            <ChevronLeft className="mr-2" size={16} /> Назад
          </Button>
          
          {currentStep < 6 ? (
            <Button onClick={handleNext} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none">
              Далі <ChevronRight className="ml-2" size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase tracking-widest h-12 px-12 rounded-none">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <><Save className="mr-2" size={16} /> Зберегти зміни</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditRelease;