"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.login,
        password: data.password,
        options: {
          data: {
            full_name: data.artistName,
          }
        }
      });

      if (error) throw error;

      if (authData.user) {
        showSuccess('Акаунт створено! Перевірте пошту для підтвердження або увійдіть.');
        navigate('/login');
      }
    } catch (error: any) {
      showError(error.message || 'Помилка при реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a0505,transparent_70%)] opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Приєднатися</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Почни свій шлях у ЖУРБА MUSIC</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/5 p-8 border border-white/5">
          <div className="space-y-3">
            <Label htmlFor="artistName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
            <Input 
              id="artistName" 
              {...register('artistName', { required: true })} 
              className="bg-black/40 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
              placeholder="Твій нікнейм" 
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Адреса</Label>
            <Input 
              id="login" 
              type="email" 
              {...register('login', { required: true })} 
              className="bg-black/40 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
              placeholder="name@example.com" 
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" title="Пароль" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пароль</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password', { required: true })} 
              className="bg-black/40 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
              placeholder="••••••••" 
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Зареєструватися <UserPlus className="ml-3" size={18} /></>}
          </Button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Вже маєте акаунт? <Link to="/login" className="text-red-700 hover:text-red-600 transition-colors ml-2 underline underline-offset-4">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;