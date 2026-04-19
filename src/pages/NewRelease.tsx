import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, Plus, Trash2, GripVertical, Check, Save, AlertCircle } from 'lucide-react';
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
  audioUrl: string;
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
  label: string;
  description: string;
  explicit: boolean;
  isSingle: boolean;
}

const NewRelease = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReleaseFormData>({
    defaultValues: {
      genre: 'Другое',
      releaseDate: new Date().toISOString().split('T')[0],
      explicit: false,
      isSingle: true,
    }
  });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fields, addRelease, statuses } = useDataStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: '', audioUrl: '', duration: '', explicit: false, lyrics: '', position: 1 }
  ]);
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');
  
  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);
  const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';
  const selectedGenre = watch('genre');

  useEffect(() => {
    if (selectedGenre) {
      setValue('genre', selectedGenre);
    }
  }, [selectedGenre, setValue]);

  const addTrack = () => {
    setTracks([...tracks, { 
      id: Date.now().toString(), 
      title: '', 
      audioUrl: '', 
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

  const onSubmit = async (data: ReleaseFormData) => {
    // Validate
    if (!data.title || !data.artist) {
      showError('Заповніть обов\'язкові поля');
      return;
    }

    if (releaseType === 'album' && tracks.length === 0) {
      showError('Додайте хоча б один трек');
      return;
    }

    for (const track of tracks) {
      if (!track.title) {
        showError('Всі треки повинні мати назву');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await addRelease({
        title: data.title,
        artist: data.artist,
        genre: data.genre,
        releaseDate: data.releaseDate,
        coverUrl: data.coverUrl,
        label: data.label,
        description: data.description,
        explicit: data.explicit,
        status: defaultStatus,
        isSingle: data.isSingle,
        tracks: releaseType === 'album' ? tracks : undefined,
      });

      if (result) {
        showSuccess('Реліз успішно відправлено на модерацію!');
        navigate('/releases');
      } else {
        showError('Помилка при створенні релізу');
      }
    } catch (error) {
      console.error('Error creating release:', error);
      showError('Сталася помилка. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Release Type */}
        <div className="bg-black/40 border border-white/5 p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Тип релізу</h2>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => { setReleaseType('single'); setTracks([{ id: '1', title: '', audioUrl: '', duration: '', explicit: false, lyrics: '', position: 1 }]); }}
              className={cn(
                "flex-1 p-6 border transition-all rounded-none",
                releaseType === 'single' 
                  ? "bg-red-900/10 border-red-700 text-white" 
                  : "bg-black/40 border-white/5 text-zinc-500 hover:border-white/20"
              )}
            >
              <div className="text-xs font-black uppercase tracking-widest mb-2">Single</div>
              <div className="text-[10px] text-zinc-600">Один трек</div>
            </button>
            <button
              type="button"
              onClick={() => setReleaseType('album')}
              className={cn(
                "flex-1 p-6 border transition-all rounded-none",
                releaseType === 'album' 
                  ? "bg-red-900/10 border-red-700 text-white" 
                  : "bg-black/40 border-white/5 text-zinc-500 hover:border-white/20"
              )}
            >
              <div className="text-xs font-black uppercase tracking-widest mb-2">Альбом / EP</div>
              <div className="text-[10px] text-zinc-600">Кілька треків</div>
            </button>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="bg-black/40 border border-white/5 p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-8 h-8 bg-red-700/20 flex items-center justify-center text-red-700 text-xs font-black">01</div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Основна інформація</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                Назва релізу <span className="text-red-800">*</span>
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
              <Select value={selectedGenre || 'Другое'} onValueChange={(val) => setValue('genre', val)}>
                <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white focus:ring-0">
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
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Обкладинка</h2>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Посилання на обкладинку (URL)
            </Label>
            <Input 
              {...register('coverUrl')}
              onChange={(e) => {
                setValue('coverUrl', e.target.value);
                setCoverPreview(e.target.value);
              }}
              className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800"
              placeholder="https://..."
            />
            {coverPreview && (
              <div className="mt-4 relative aspect-square max-w-[200px] border border-white/5 overflow-hidden">
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" onError={() => setCoverPreview('')} />
              </div>
            )}
          </div>
        </div>

        {/* Tracks Section */}
        <div className="bg-black/40 border border-white/5 p-8 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-700/20 flex items-center justify-center text-red-700 text-xs font-black">{releaseType === 'album' ? '03' : '03'}</div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest">
                {releaseType === 'album' ? 'Треклист' : 'Трек'}
              </h2>
            </div>
            {releaseType === 'album' && (
              <Button 
                type="button"
                onClick={addTrack}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest h-10 rounded-none"
              >
                <Plus size={14} className="mr-2" /> Додати трек
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {tracks.map((track, index) => (
              <div key={track.id} className="p-6 bg-white/5 border border-white/5 rounded-none space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-900/10 flex items-center justify-center text-red-700 text-xs font-black">
                      {index + 1}
                    </div>
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
                      {releaseType === 'album' ? `Трек ${index + 1}` : 'Інформація'}
                    </span>
                  </div>
                  {tracks.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => removeTrack(track.id)}
                      className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-8 w-8 p-0"
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
                      className="bg-black/40 border-white/5 rounded-none h-10 focus:border-red-900/50 text-white"
                      placeholder="Назва треку..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      Посилання на аудіо (URL)
                    </Label>
                    <Input 
                      value={track.audioUrl}
                      onChange={(e) => updateTrack(track.id, 'audioUrl', e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-10 focus:border-red-900/50 text-white"
                      placeholder="https://..."
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
                    className="bg-black/40 border-white/5 rounded-none min-h-[80px] resize-none text-white"
                    placeholder="Текст пісні або нотатки..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Fields from Admin */}
        {releaseFields.length > 0 && (
          <div className="bg-black/40 border border-white/5 p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Додаткові дані</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {releaseFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {field.label} {field.required && <span className="text-red-800">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      {...register(field.name as any)}
                      className="bg-black/40 border-white/5 rounded-none min-h-[100px] resize-none"
                      placeholder={field.label}
                    />
                  ) : field.type === 'select' && field.options ? (
                    <Select onValueChange={(val) => setValue(field.name as any, val)}>
                      <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                        <SelectValue placeholder={field.label} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                        {field.options.split(',').map(opt => (
                          <SelectItem key={opt.trim()} value={opt.trim()} className="text-xs">
                            {opt.trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      {...register(field.name as any, { required: field.required })}
                      className="bg-black/40 border-white/5 rounded-none h-12"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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