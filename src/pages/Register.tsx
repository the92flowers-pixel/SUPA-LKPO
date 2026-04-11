import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, UserPlus } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { addUser, users } = useDataStore();

  const onSubmit = (data: any) => {
    if (users.find(u => u.login === data.login)) {
      showError('Користувач з таким email вже існує');
      return;
    }

    const newUser = { 
      id: Math.random().toString(36).substr(2, 9), 
      login: data.login, 
      role: 'artist' as const, 
      artistName: data.artistName,
      createdAt: new Date().toISOString()
    };
    
    addUser(newUser);
    setAuth(newUser, 'mock-jwt');
    showSuccess('Акаунт успішно створено!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center">
              <Music className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Створити акаунт</h1>
          <p className="text-gray-500 mt-2">Приєднуйтесь до ЖУРБА MUSIC сьогодні</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="artistName">Сценічне ім'я</Label>
            <Input id="artistName" {...register('artistName', { required: true })} className="bg-[#1a1a1a] border-white/10 focus:border-violet-500 h-12" placeholder="Ваш псевдонім" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login">Email</Label>
            <Input id="login" type="email" {...register('login', { required: true })} className="bg-[#1a1a1a] border-white/10 focus:border-violet-500 h-12" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" {...register('password', { required: true })} className="bg-[#1a1a1a] border-white/10 focus:border-violet-500 h-12" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg">
            Зареєструватися
            <UserPlus className="ml-2" size={20} />
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Вже маєте акаунт? <Link to="/login" className="text-violet-500 hover:underline font-medium">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;