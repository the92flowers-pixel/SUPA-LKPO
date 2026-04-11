import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, ArrowRight } from 'lucide-react';
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
    const user = users.find(u => u.login === data.login);
    
    if (data.login === 'admin' && data.password === 'admin2') {
      const adminUser = users.find(u => u.role === 'admin');
      setAuth(
        adminUser || { 
          id: '1', 
          login: 'admin', 
          role: 'admin', 
          artistName: 'Адмін',
          balance: 0,
          isVerified: true,
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
      navigate(user.role === 'admin' ? '/admin/moderation' : '/dashboard');
    } else {
      showError('Невірний логін або пароль');
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
              <Input {...register('login')} className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" placeholder="name@example.com" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пароль</Label>
                <a href="#" className="text-[9px] font-black uppercase tracking-widest text-red-700 hover:underline">Забули?</a>
              </div>
              <Input type="password" {...register('password')} className="bg-black/40 border-white/5 rounded-none h-14 focus:border-red-700 text-white placeholder:text-zinc-800" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest text-xs rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]">
              {content.buttonText}
              <ArrowRight className="ml-3" size={18} />
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