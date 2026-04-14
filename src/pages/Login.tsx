"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.login,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        showSuccess('Успішний вхід!');
        // Перенаправлення відбудеться автоматично через App.tsx, 
        // але для впевненості додаємо базове
        navigate('/dashboard');
      }
    } catch (error: any) {
      showError(error.message || 'Помилка при вході');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-black border-r border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-xl font-black tracking-[0.3em] uppercase">ЖУРБА MUSIC</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-7xl font-black leading-[0.9] tracking-tighter uppercase">
              Твоя музика.<br />
              <span className="text-red-700">Твоя влада.</span>
            </h2>
            <p className="text-lg text-zinc-500 max-w-md font-bold uppercase tracking-wide">
              Дистрибуція на 150+ стрімінгових платформ. Залишай собі 100% роялті.
            </p>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
          © 2024 ЖУРБА MUSIC DISTRIBUTION
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-4xl font-black tracking-tight uppercase">Увійти</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Введіть свої дані для доступу до кабінету</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Адреса</Label>
              <Input 
                id="login" 
                {...register('login', { required: true })} 
                className="bg-white/5 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
                placeholder="name@example.com" 
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" title="Пароль" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password', { required: true })} 
                className="bg-white/5 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
                placeholder="••••••••" 
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Увійти <ArrowRight className="ml-3" size={18} /></>}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Немає акаунту?{' '}
              <Link to="/register" className="text-red-700 hover:text-red-600 transition-colors ml-2 underline underline-offset-4">Зареєструватися</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;