import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import bcrypt from 'bcryptjs';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { addUser, users, settings } = useDataStore();

  if (!settings.registrationEnabled) {
    return (
      <div className="min-h-screen flex bg-[#050505] text-white items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="mx-auto text-red-700" size={64} />
          <h1 className="text-3xl font-black uppercase tracking-tight">Реєстрація закрита</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 leading-relaxed">Зверніться до адміністратора для створення акаунту або спробуйте пізніше.</p>
          <Link to="/">
            <Button variant="outline" className="mt-8 border-white/10 rounded-none h-12 px-10 text-[10px] font-black uppercase tracking-widest">На головну</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: any) => {
    if (users.find(u => u.login === data.login)) {
      showError('Користувач з таким email вже існує');
      return;
    }

    // Hash password before saving
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    
    // First user becomes admin automatically for setup purposes
    const isFirstUser = users.length === 0;

    const newUser = { 
      ...data,
      password: hashedPassword,
      id: Math.random().toString(36).substr(2, 9), 
      role: isFirstUser ? 'admin' : 'artist', 
      isVerified: isFirstUser,
      balance: 0,
      createdAt: new Date().toISOString()
    };
    
    addUser(newUser);
    setAuth(newUser, 'mock-jwt');
    showSuccess(isFirstUser ? 'Акаунт адміністратора створено!' : 'Акаунт успішно створено!');
    navigate(isFirstUser ? '/admin/moderation' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white items-center justify-center p-8">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-8">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Створити акаунт</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Приєднуйтесь до {settings.siteName}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
            <Input {...register('artistName', { required: true })} className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" placeholder="Ваш псевдонім" />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</Label>
            <Input type="email" {...register('login', { required: true })} className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" placeholder="name@example.com" />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пароль</Label>
            <Input type="password" {...register('password', { required: true })} className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest text-xs rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]">
            Зареєструватися
            <UserPlus className="ml-3" size={18} />
          </Button>
        </form>
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
          Вже маєте акаунт? <Link to="/login" className="text-red-700 hover:underline">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;