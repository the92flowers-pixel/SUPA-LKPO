import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, toAppProfile } from '@/lib/supabase';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { settings } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!settings?.registrationEnabled) {
    return (
      <div className="min-h-screen flex bg-[#0a0a0a] text-white items-center justify-center p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto text-amber-500" size={48} />
          <h1 className="text-2xl font-bold">Реєстрація тимчасово закрита</h1>
          <p className="text-gray-500">Зверніться до адміністратора.</p>
          <Link to="/">
            <Button variant="outline" className="mt-4 border-white/10">На головну</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign up the user in auth
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
        // Profile will be created automatically by database trigger
        // But let's also create it manually to be sure
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        // If profile doesn't exist, create it
        if (profileError?.code === 'PGRST116' || !profile) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: data.login,
              full_name: data.artistName,
              role: 'artist',
              balance: 0,
              is_verified: false,
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
          }

          if (newProfile) {
            const appUser = toAppProfile(newProfile);
            setAuth(appUser);
          } else {
            // Fallback - create minimal auth state
            setAuth({
              id: authData.user.id,
              email: data.login,
              login: data.login,
              role: 'artist',
              artistName: data.artistName,
              balance: 0,
              isVerified: false,
              createdAt: new Date().toISOString(),
            });
          }
        } else if (profile) {
          setAuth(toAppProfile(profile));
        }

        setSuccess(true);
        showSuccess('Акаунт успішно створено!');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err?.message || 'Невідома помилка';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex bg-[#0a0a0a] text-white items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-500" size={48} />
          </div>
          <h1 className="text-2xl font-bold">Реєстрація успішна!</h1>
          <p className="text-gray-500">Ласкаво просимо до ЖУРБА MUSIC. Перенаправляємо вас...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white items-center justify-center p-8">
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
            className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-bold text-lg disabled:opacity-50"
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
        <p className="text-center text-sm text-gray-500">
          Вже маєте акаунт? <Link to="/login" className="text-red-700 hover:underline font-medium">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;