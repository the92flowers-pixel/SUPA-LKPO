"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Music, UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, toAppProfile } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

interface RegisterFormData {
  artistName: string;
  login: string;
  password: string;
}

const RegistrationForm = () => {
  const { register, handleSubmit } = useForm<RegisterFormData>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.login,
        password: data.password,
        options: {
          data: {
            artist_name: data.artistName,
            full_name: data.artistName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        showError(authError.message);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        const appUser = {
          id: authData.user.id,
          email: data.login,
          login: data.login,
          role: 'artist' as const,
          artistName: data.artistName,
          balance: 0,
          isVerified: false,
          createdAt: new Date().toISOString(),
        };
        
        setAuth(appUser);
        showSuccess('Акаунт успішно створено!');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err?.message || 'Невідома помилка';
      setError(message);
      showError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center">
              <Music className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Створити акаунт</h1>
          <p className="text-gray-500 mt-2">Приєднуйтесь до ЖУРБА MUSIC</p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="artistName">Сценічне ім'я</Label>
            <Input 
              id="artistName" 
              {...register('artistName', { required: true })} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder="Ваш псевдонім"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login">Email</Label>
            <Input 
              id="login" 
              type="email" 
              {...register('login', { required: true })} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder="name@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password', { required: true, minLength: 6 })} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder="Мінімум 6 символів"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Реєстрація...
              </>
            ) : (
              <>
                Зареєструватися
                <UserPlus className="ml-2" size={20} />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;