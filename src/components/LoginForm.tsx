"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, toAppProfile } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

interface LoginFormData {
  login: string;
  password: string;
}

const LoginForm = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.login,
        password: data.password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Неправильний email або пароль');
          showError('Неправильний email або пароль');
        } else {
          setError(authError.message);
          showError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!profileError && profileData) {
          const appUser = toAppProfile(profileData);
          setAuth(appUser);
          showSuccess('Успішний вхід!');
          
          const redirectPath = appUser.role === 'admin' ? '/admin/moderation' : '/dashboard';
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Помилка з\'єднання. Спробуйте пізніше.');
      showError('Помилка з\'єднання');
    } finally {
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
          <h1 className="text-3xl font-bold tracking-tight">Вхід до системи</h1>
          <p className="text-gray-500 mt-2">Увійдіть, щоб продовжити</p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {...register('password', { required: true })} 
              className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
              placeholder="••••••••"
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
                Вхід...
              </>
            ) : (
              <>
                Увійти
                <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;