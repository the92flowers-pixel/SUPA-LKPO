import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, FileUp, Loader2 } from 'lucide-react';
import { supabase, uploadFile } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const NewRelease = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsUploading(true);

    try {
      // 1. Завантаження файлів
      const coverFile = data.cover[0];
      const audioFile = data.audio[0];

      const coverUrl = await uploadFile('covers', `${user.id}/${Date.now()}-${coverFile.name}`, coverFile);
      const audioUrl = await uploadFile('tracks', `${user.id}/${Date.now()}-${audioFile.name}`, audioFile);

      // 2. Отримання artist_id
      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // 3. Створення релізу
      const { data: release, error: releaseError } = await supabase
        .from('releases')
        .insert({
          artist_id: artist?.id,
          title: data.title,
          genre: data.genre,
          release_date: data.releaseDate,
          cover_url: coverUrl,
          status: 'На модерації'
        })
        .select()
        .single();

      if (releaseError) throw releaseError;

      // 4. Створення треку
      await supabase.from('tracks').insert({
        release_id: release.id,
        title: data.title,
        audio_url: audioUrl
      });

      showSuccess('Реліз успішно відправлено на модерацію!');
      navigate('/releases');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Новий реліз</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label>Назва релізу</Label>
            <Input {...register('title', { required: true })} className="bg-black/40 border-white/5" />
          </div>
          <div className="space-y-3">
            <Label>Жанр</Label>
            <Input {...register('genre', { required: true })} className="bg-black/40 border-white/5" />
          </div>
          <div className="space-y-3">
            <Label>Дата релізу</Label>
            <Input type="date" {...register('releaseDate', { required: true })} className="bg-black/40 border-white/5" />
          </div>
          <div className="space-y-3">
            <Label>Обкладинка</Label>
            <Input type="file" accept="image/*" {...register('cover', { required: true })} className="bg-black/40 border-white/5" />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label>Аудіофайл</Label>
            <Input type="file" accept="audio/*" {...register('audio', { required: true })} className="bg-black/40 border-white/5" />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isUploading}
          className="w-full bg-red-700 hover:bg-red-800 h-14 rounded-none font-black uppercase"
        >
          {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
          Відправити на модерацію
        </Button>
      </form>
    </div>
  );
};

export default NewRelease;