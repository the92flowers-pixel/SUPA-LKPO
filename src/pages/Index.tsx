import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Globe, Zap, Shield, ArrowRight, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuthStore();
  const { settings } = useDataStore();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/moderation' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-violet-500/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Music className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">{settings.siteName}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-white transition-colors">Можливості</a>
            <a href="#stats" className="hover:text-white transition-colors">Статистика</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="font-bold text-gray-300 hover:text-white">Увійти</Button>
            </Link>
            {settings.registrationEnabled && (
              <Link to="/register">
                <Button className="bg-violet-600 hover:bg-violet-700 font-bold px-6">Почати зараз</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Star size={14} /> Нова ера дистрибуції
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              ТВОЯ МУЗИКА <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">БЕЗ МЕЖ.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl">
              Доставляємо твої треки на 150+ платформ по всьому світу. Залишай собі 100% роялті та керуй своєю кар'єрою через сучасний кабінет артиста.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {settings.registrationEnabled && (
                <Link to="/register">
                  <Button className="h-16 px-10 bg-violet-600 hover:bg-violet-700 text-lg font-black rounded-2xl group">
                    Випустити трек
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
              <Link to="/login">
                <Button variant="outline" className="h-16 px-10 border-white/10 hover:bg-white/5 text-lg font-black rounded-2xl">
                  <Play className="mr-2 fill-current" size={18} /> Демо кабінету
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full -mr-40" />
      </section>

      <section id="features" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-bold">Глобальне охоплення</h3>
              <p className="text-gray-500 leading-relaxed">Spotify, Apple Music, TikTok, YouTube та ще 150+ сервісів у кожному куточку планети.</p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center text-fuchsia-500">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold">Миттєва статистика</h3>
              <p className="text-gray-500 leading-relaxed">Відстежуй прослуховування та доходи в реальному часі через наш інтерактивний дашборд.</p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-bold">Повна прозорість</h3>
              <p className="text-gray-500 leading-relaxed">Жодних прихованих комісій. Твої права та твої гроші належать тільки тобі.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Music className="text-violet-500" size={20} />
            <span className="font-bold tracking-tighter uppercase">{settings.siteName} © 2024</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;