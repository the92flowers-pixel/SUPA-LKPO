import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, FileUp, Check } from 'lucide-react';
import { useDataStore, useAuthStore, DEFAULT_GENRES } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface ReleaseFormData {
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  coverUrl: string;
  audioUrl: string;
  isrc?: string;
  label?: string;
  description?: string;
  explicit?: boolean;
}

const NewRelease = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReleaseFormData>({
    defaultValues: {
      genre: 'Другое',
      releaseDate: new Date().toISOString().split('T')[0],
      explicit: false,
    }
  });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fields, addRelease, statuses } = useDataStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);
  const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';

  const onSubmit = async (data: ReleaseFormData) => {
    if (!data.title || !data.artist) {
      showError('Заповніть обов\'язкові поля');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addRelease({
        title: data.title,
        artist: data.artist,
        genre: data.genre,
        releaseDate: data.releaseDate,
        coverUrl: data.coverUrl,
        audioUrl: data.audioUrl,
        isrc: data.isrc,
        label: data.label,
        description: data.description,
        explicit: data.explicit,
        status: defaultStatus,
      });

      if (result) {
        showSuccess('Реліз успішно відправлено на модерацію!');
        navigate('/releases');
      } else {
        showError('Помилка при створенні релізу');
      }
    } catch (error) {
      showError('Сталася помилка. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverUrlChange = (url: string) => {
    setValue('coverUrl', url);
    setCoverPreview(url);
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverUrl' | 'audioUrl') => {
    setValue(field, e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/10 border border-red-900/20 mb-4">
          <Music className="text-red-700" size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Новий реліз</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Завантажте вашу музику</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Basic Info Section */}
        <div className="bg-black/40 border border-white/5 p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-8 h-8 bg-red-700/20 flex items-center justify-center text-red-700 text-xs font-black">01</div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Основна інформація</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                Назва треку/альбому <span className="text-red-800">*</span>
              </Label>
              <Input 
                {...register('title', { required: true })}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="Введіть назву..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                Артист <span className="text-red-800">*</span>
              </Label>
              <Input 
                {...register('artist', { required: true })}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="Ім'я артиста..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                Жанр <span className="text-red-800">*</span>
              </Label>
              <Select onValueChange={(val) => setValue('genre', val)} defaultValue="Другое">
                <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Оберіть жанр" />
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

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Дата релізу
              </Label>
              <Input 
                type="date"
                {...register('releaseDate')}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white"
              />
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-black/40 border border-white/5 p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-8 h-8 bg-red-700/20 flex items-center justify-center text-red-700 text-xs font-black">02</div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Медіа файли</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Посилання на обкладинку (URL)
              </Label>
              <Input 
                {...register('coverUrl')}
                onChange={(e) => handleCoverUrlChange(e.target.value)}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="https://..."
              />
              {coverPreview && (
                <div className="mt-4 relative aspect-square max-w-[200px] border border-white/5 overflow-hidden">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" onError={() => setCoverPreview('')} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Посилання на аудіо файл (URL)
              </Label>
              <Input 
                {...register('audioUrl')}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-black/40 border border-white/5 p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-8 h-8 bg-red-700/20 flex items-center justify-center text-red-700 text-xs font-black">03</div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Додаткова інформація</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                ISRC код
              </Label>
              <Input 
                {...register('isrc')}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="XX-XXX-XXXXX-XX"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Лейбл
              </Label>
              <Input 
                {...register('label')}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="Назва лейблу..."
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Опис
              </Label>
              <Textarea 
                {...register('description')}
                className="bg-black/40 border-white/5 rounded-none min-h-[120px] py-4 resize-none focus:border-red-900/50 text-white placeholder:text-zinc-800"
                placeholder="Додаткова інформація про реліз..."
              />
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="p-10 bg-black/40 border border-white/5 rounded-none flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <div className="w-16 h-16 rounded-none bg-red-900/10 flex items-center justify-center text-red-700 border border-red-900/20">
            <Upload size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Готові до публікації?</h3>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Після відправки реліз потрапить у чергу модерації. Адміністратор перевірить дані та опублікує реліз.
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-12 h-14 rounded-none shadow-[0_0_30px_rgba(185,28,28,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Завантаження...</>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                Відправити на модерацію
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewRelease;