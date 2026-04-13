"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { supabaseApi } from '@/lib/supabase-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { loginPageConfig: content } = useDataStore();

  const onSubmit = async (data: any) => {
    try {
      const result = await supabaseApi.auth.signInWithPassword(data.login, data.password);
      
      if (result.error) {
        throw new Error(result.error);
      }

      const { access_token, user } = result;

      // Получаем профиль пользователя напрямую по ID
      const profileResult = await supabaseApi.db.getProfile(user.id, access_token);
      
      if (profileResult.error || !profileResult.data) {
        throw new Error(profileResult.error || 'Профіль користувача не знайдено. Переконайтеся, що ви виконали SQL скрипт в Supabase.');
      }

      const userProfile = profileResult.data;

      setAuth({
        id: user.id,
        login: user.email,
        role: userProfile.role,
        artistName: userProfile.artist_name || '',
        isVerified: userProfile.is_verified || false,
        createdAt: userProfile.created_at
      }, access_token);

      showSuccess('Успішний вхід!');
      navigate(userProfile.role === 'admin' ? '/admin/moderation' : '/dashboard');
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 bg-black border-r border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-12 w-auto" />
            <span className="text-2xl font-black tracking-[0.3em] uppercase">{content.logoText}</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-7xl font-black leading-[0.9] tracking-tighter uppercase">
              {content.leftTitle}<br />
              <span className="text-red-700">{content.leftText1}</span>
            </h2>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 max-w-md leading-relaxed">{content.leftText2}</p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-4">
          {[content.feature1, content.feature2, content.feature3].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <div className="w-1 h-1 bg-red-700" />
              {f}
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 blur-[150px] rounded-full" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-black tracking-tight uppercase">{content.welcomeTitle}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{content.welcomeSubtitle}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Логін (Email)</Label>
              <Input 
                {...register('login', { required: true })} 
                className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" 
                placeholder="name@example.com" 
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пароль</Label>
              </div>
              <Input 
                type="password" 
                {...register('password', { required: true })} 
                className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" 
                placeholder="••••••••" 
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest text-xs rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {content.buttonText}
                  <ArrowRight className="ml-3" size={18} />
                </>
              )}
            </Button>
          </form>
          <div className="text-center space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              Немає акаунту?{' '}
              <Link to="/register" className="text-red-700 hover:underline">Зареєструватися</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
