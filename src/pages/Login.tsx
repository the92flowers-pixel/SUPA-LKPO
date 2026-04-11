import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { initialLoginPageContent } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const content = initialLoginPageContent;

  const onSubmit = (data: any) => {
    // Mock authentication
    if (data.login === 'admin' && data.password === 'admin2') {
      setAuth({ id: 1, login: 'admin', role: 'admin' }, 'mock-jwt-token');
      showSuccess('Вітаємо, адмін!');
      navigate('/admin/moderation');
    } else if (data.login && data.password) {
      setAuth({ id: 2, login: data.login, role: 'artist', artistName: 'Артист' }, 'mock-jwt-token');
      showSuccess('Успішний вхід!');
      navigate('/');
    } else {
      showError('Невірний логін або пароль');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white overflow-hidden">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-violet-900/20 to-black border-r border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
              <Music className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">{content.logoText}</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-6xl font-black leading-tight tracking-tighter">
              {content.leftTitle}<br />
              <span className="text-violet-500">{content.leftText1}</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              {content.leftText2}
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[content.feature1, content.feature2, content.feature3].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <CheckCircle2 size={16} className="text-violet-500" />
              {f}
            </div>
          ))}
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">{content.welcomeTitle}</h1>
            <p className="text-gray-500 mt-2">{content.welcomeSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login">Логін (Email)</Label>
              <Input 
                id="login" 
                {...register('login')} 
                className="bg-[#1a1a1a] border-white/10 focus:border-violet-500 h-12"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <a href="#" className="text-xs text-violet-500 hover:underline">Забули пароль?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                className="bg-[#1a1a1a] border-white/10 focus:border-violet-500 h-12"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg">
              {content.buttonText}
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              {content.signupLink.split('?')[0]}?{' '}
              <Link to="/register" className="text-violet-500 hover:underline font-medium">
                {content.signupLink.split('?')[1]?.trim() || 'Зареєструватися'}
              </Link>
            </p>
            <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-lg">
              <p className="text-xs text-violet-400 font-mono">{content.demoText}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-center text-xs text-gray-600 mb-4 uppercase tracking-widest font-bold">Доступно на</p>
            <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {content.socialIcons.map((icon) => (
                <span key={icon} className="text-[10px] font-bold">{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;