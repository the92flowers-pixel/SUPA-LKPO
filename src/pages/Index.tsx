import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Globe, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuthStore();
  const { settings, loginPageConfig: content } = useDataStore();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/moderation' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-red-900/50">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-700 rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(185,28,28,0.3)] rotate-45">
              <Music className="text-white -rotate-45" size={20} />
            </div>
            <span className="text-xl font-black tracking-[0.2em] uppercase ml-2">{settings.siteName}</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
            <a href="#features" className="hover:text-red-600 transition-colors">Естетика</a>
            <a href="#stats" className="hover:text-red-600 transition-colors">Масштаб</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login">
              <Button variant="ghost" className="text-xs font-bold tracking-widest text-zinc-400 hover:text-white uppercase">Увійти</Button>
            </Link>
            {settings.registrationEnabled && (
              <Link to="/register">
                <Button className="bg-red-700 hover:bg-red-800 text-xs font-bold tracking-widest uppercase px-8 rounded-none border border-red-500/50">
                  Приєднатися
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-52 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-none border-l-2 border-red-700 bg-red-900/10 text-red-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-10">
              Melancholy & Power
            </div>
            <h1 className="text-7xl md:text-9xl font-black leading-[0.85] tracking-tighter mb-12">
              {content.heroTitle1} <br />
              <span className="text-zinc-800">{content.heroTitle2}</span> <br />
              <span className="text-red-700">{content.heroTitle3}</span>
            </h1>
            <p className="text-lg text-zinc-500 mb-14 leading-relaxed max-w-xl font-medium tracking-wide">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              {settings.registrationEnabled && (
                <Link to="/register">
                  <Button className="h-16 px-12 bg-red-700 hover:bg-red-800 text-sm font-bold tracking-widest uppercase rounded-none group transition-all duration-500 hover:shadow-[0_0_30px_rgba(185,28,28,0.4)]">
                    Почати шлях
                    <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={18} />
                  </Button>
                </Link>
              )}
              <Link to="/login">
                <Button variant="outline" className="h-16 px-12 border-zinc-800 hover:bg-white/5 text-sm font-bold tracking-widest uppercase rounded-none">
                  Демо кабінету
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-900/10 blur-[120px] rounded-full" />
      </section>

      <section id="features" className="py-32 border-y border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6 group">
              <div className="w-12 h-12 border border-red-900/50 flex items-center justify-center text-red-600 group-hover:bg-red-900/20 transition-all">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase">{content.feature1Title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{content.feature1Desc}</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-12 h-12 border border-red-900/50 flex items-center justify-center text-red-600 group-hover:bg-red-900/20 transition-all">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase">{content.feature2Title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{content.feature2Desc}</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-12 h-12 border border-red-900/50 flex items-center justify-center text-red-600 group-hover:bg-red-900/20 transition-all">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase">{content.feature3Title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{content.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <Music className="text-red-700" size={20} />
            <span className="font-bold tracking-[0.3em] uppercase text-xs text-zinc-500">{settings.siteName} © 2024</span>
          </div>
          <div className="flex gap-12 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-red-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-red-600 transition-colors">Terms</a>
            <a href={`mailto:${settings.contactEmail}`} className="hover:text-red-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;