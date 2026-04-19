import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, CheckCircle2, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, toAppProfile } from '@/lib/supabase';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { loginPageConfig } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: { login: string; password: string }) => {
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
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email не підтверджено. Перевірте вашу пошту.');
          showError('Email не підтверджено');
        } else {
          setError(authError.message);
          showError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Try to fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        let finalProfile = profileData;

        // If profile doesn't exist (PGRST116), create it automatically
        if (profileError && profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email || data.login,
              full_name: authData.user.user_metadata?.full_name || authData.user.user_metadata?.artist_name || null,
              role: 'artist',
              balance: 0,
              is_verified: false,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile on login:', createError);
            // Fallback to basic user object if DB insert fails
            const fallbackUser = {
              id: authData.user.id,
              email: authData.user.email || data.login,
              login: authData.user.email || data.login,
              role: 'artist' as const,
              artistName: authData.user.user_metadata?.full_name || authData.user.user_metadata?.artist_name || null,
              balance: 0,
              isVerified: false,
              createdAt: new Date().toISOString(),
            };
            setAuth(fallbackUser);
            showSuccess('Успішний вхід (тимчасовий профіль)');
            navigate('/dashboard', { replace: true });
            setIsLoading(false);
            return;
          }
          finalProfile = newProfile;
        } else if (profileError) {
          throw profileError;
        }
        
        if (finalProfile) {
          const appUser = toAppProfile(finalProfile);
          setAuth(appUser);
          showSuccess('Успішний вхід!');
          
          // Redirect based on role
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
    <div className="min-h-screen flex bg-[#0a0a0a] text-white overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-red-900/20 to-black border-r border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center">
              <Music className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">{loginPageConfig?.logoText || 'ЖУРБА MUSIC'}</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black leading-tight tracking-tighter">
              Твоя музика.<br />
              <span className="text-red-700">Скрізь.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              Дистрибуція на 150+ платформ. Залишай собі 80% роялті.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {['150+ Платформ', '80% Роялті', '24/7 Підтримка'].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <CheckCircle2 size={16} className="text-red-700" />
              {f}
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-700/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">{loginPageConfig?.welcomeTitle || 'Ласкаво просимо'}</h1>
            <p className="text-gray-500 mt-2">{loginPageConfig?.welcomeSubtitle || 'Увійдіть, щоб продовжити'}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-red-400">{error}</p>
                <p className="text-xs text-red-500/60 mt-1">
                  Перевірте правильність даних або спробуйте пізніше
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login">Логін (Email)</Label>
              <Input 
                id="login" 
                {...register('login', { required: true })} 
                className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" 
                placeholder="name@example.com"
                disabled={isLoading}
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-bold text-lg disabled:opacity-50"
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
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Немає акаунту?{' '}
              <Link to="/register" className="text-red-700 hover:underline font-medium">Зареєструватися</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;