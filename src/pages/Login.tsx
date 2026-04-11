import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { users, loginPageConfig: content } = useDataStore();

  const onSubmit = (data: any) => {
    // Check against our "Local DB"
    const user = users.find(u => u.login === data.login);
    
    // For demo purposes, we check password directly (in real app use bcrypt)
    if (data.login === 'admin' && data.password === 'admin2') {
      const adminUser = users.find(u => u.role === 'admin');
      setAuth(
        adminUser || { 
          id: '1', 
          login: 'admin', 
          role: 'admin', 
          artistName: 'Адмін',
          balance: 0,
          createdAt: new Date().toISOString() 
        }, 
        'mock-jwt'
      );
      showSuccess('Вітаємо, адмін!');
      navigate('/admin/moderation');
      return;
    }

    if (user && data.password) {
      setAuth(user, 'mock-jwt');
      showSuccess('Успішний вхід!');
      navigate(user.role === 'admin' ? '/admin/moderation' : '/');
    } else {
      showError('Невірний логін або пароль');
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
            <span className="text-2xl font-bold tracking-tighter">{content.logoText}</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black leading-tight tracking-tighter">
              {content.leftTitle}<br />
              <span className="text-red-700">{content.leftText1}</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">{content.leftText2}</p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[content.feature1, content.feature2, content.feature3].map((f, i) => (
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
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">{content.welcomeTitle}</h1>
            <p className="text-gray-500 mt-2">{content.welcomeSubtitle}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login">Логін (Email)</Label>
              <Input id="login" {...register('login')} className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <a href="#" className="text-xs text-red-700 hover:underline">Забули пароль?</a>
              </div>
              <Input id="password" type="password" {...register('password')} className="bg-[#1a1a1a] border-white/10 focus:border-red-700 h-12" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-bold text-lg">
              {content.buttonText}
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Немає акаунту?{' '}
              <Link to="/register" className="text-red-700 hover:underline font-medium">Зареєструватися</Link>
            </p>
            <div className="p-4 bg-red-700/5 border border-red-700/10 rounded-lg">
              <p className="text-xs text-red-700 font-mono">Демо: admin / admin2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;