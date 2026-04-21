"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { DEFAULT_GENRES } from '@/lib/store';

interface ReleaseFormData {
  title: string;
  artist: string;
  genre: string;
  description: string;
}

const ReleaseForm = () => {
  const { register, handleSubmit } = useForm<ReleaseFormData>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addRelease } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ReleaseFormData) => {
    if (!user) {
      showError('Будь ласка, увійдіть в систему');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);

      const releaseData = {
        title: data.title,
        artist: data.artist || user.artistName || user.login,
        genre: data.genre,
        releaseDate: minDate.toISOString().split('T')[0],
        description: data.description,
        label: 'ЖУРБА MUSIC',
        status: 'На модерації',
      };

      const result = await addRelease(releaseData);
      
      if (result) {
        showSuccess('Реліз успішно відправлено на модерацію!');
        navigate('/releases');
      } else {
        throw new Error('Не вдалося створити реліз');
      }
    } catch (err: any) {
      console.error('Release creation error:', err);
      const message = err?.message || 'Невідома помилка';
      setError(message);
      showError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center">
              <Music className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Новий реліз</h1>
          <p className="text-gray-500 mt-2">Завантажте вашу музику</p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Назва релізу *</Label>
            <Input 
              id="title" 
              {...register('title', { required: true })} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder="Назва вашого треку"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Артист *</Label>
            <Input 
              id="artist" 
              {...register('artist')} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder={user?.artistName || 'Ваш псевдонім'}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Жанр *</Label>
            <Input 
              id="genre" 
              {...register('genre', { required: true })} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder="Hip-Hop, Pop, Rock..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea 
              id="description" 
              {...register('description')} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 min-h-[120px]" 
              placeholder="Розкажіть про ваш реліз..."
              disabled={isLoading}
            />
          </div>

          <div className="p-6 bg-white/5 border border-white/10">
            <p className="text-sm text-zinc-400 mb-4">
              Після відправки релізу на модерацію, ви зможете завантажити обкладинку та аудіофайли.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Створення...
              </>
            ) : (
              <>
                <Upload className="mr-2" size={20} />
                Відправити на модерацію
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ReleaseForm;