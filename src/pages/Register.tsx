import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.login,
        password: data.password,
        options: {
          data: {
            role: 'artist',
            artist_name: data.artistName,
            full_name: data.artistName,
          },
        },
      });

      if (error) {
        showError(error.message);
        return;
      }

      if (authData.user) {
        showSuccess('Акаунт успішно створено! Перевірте email для підтвердження.');
        navigate('/login');
      }
    } catch (err: any) {
      showError(err.message || 'Помилка реєстрації');
    }
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="artistName">Сценічне ім'я</Label>
            <Input id="artistName" {...register('artistName', { required: true })} className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" placeholder="Ваш псевдонім" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login">Email</Label>
            <Input id="login" type="email" {...register('login', { required: true })} className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" {...register('password', { required: true })} className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-bold text-lg">
            Зареєструватися
            <UserPlus className="ml-2" size={20} />
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