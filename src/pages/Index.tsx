import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Globe, Zap, Shield, ArrowRight, Instagram, Send, Youtube, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Navigate } from 'react-router-dom';

const SocialIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <Instagram size={18} />;
  if (lowerName.includes('telegram')) return <Send size={18} />;
  if (lowerName.includes('youtube')) return <Youtube size={18} />;
  if (lowerName.includes('twitter')) return <Twitter size={18} />;
  if (lowerName.includes('tiktok')) return <MessageCircle size={18} />;
  return <Globe size={18} />;
};

const Index = () => {
  const { user } = useAuthStore();
  const { settings, homePageConfig: config, labelSocials } = useDataStore();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/moderation' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-red-900/50 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-8 sm:h-10 w-auto" />
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/login">
              <Button variant="ghost" className="text-[10px] sm:text-xs font-black tracking-widest text-zinc-400 hover:text-white uppercase rounded-none px-2 sm:px-4">Увійти</Button>
            </Link>
            {settings.registrationEnabled && (
              <Link to="/register">
                <Button 
                  className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-4 sm:px-8 rounded-none border border-white/10"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Почати
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-40 sm:pt-52 pb-20 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div 
              className="inline-flex items-center gap-2 px-4 py-1 rounded-none border-l-2 bg-white/5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-8 sm:mb-10"
              style={{ borderColor: config.primaryColor, color: config.primaryColor }}
            >
              Made in Ukraine
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black leading-[0.9] sm:leading-[0.85] tracking-tighter mb-8 sm:mb-12 uppercase">
              {config.heroTitle.split(' ').map((word: string, i: number) => (
                <span key={i} className={i === config.heroTitle.split(' ').length - 1 ? "text-red-700" : ""}>
                  {word}{' '}
                  {i === 0 && <br className="hidden sm:block" />}
                </span>
              ))}
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 mb-10 sm:mb-14 leading-relaxed max-w-xl font-bold tracking-wide uppercase">
              {config.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              {settings.registrationEnabled && (
                <Link to="/register">
                  <Button 
                    className="h-14 sm:h-16 px-8 sm:px-12 text-xs sm:text-sm font-black tracking-widest uppercase rounded-none group transition-all duration-500 w-full sm:w-auto"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {config.buttonText}
                    <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={18} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full bg-gradient-to-l from-red-900/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-red-900/10 blur-[120px] rounded-full" />
      </section>

      <section id="features" className="py-20 sm:py-32 border-y border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-20">
            <div className="space-y-6 group">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-red-600 group-hover:bg-red-900/20 transition-all rounded-none">
                <Globe size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-widest uppercase">Темна Глобалізація</h3>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-bold uppercase tracking-wider">Ваш голос почують у кожному куточку світу. Від Spotify до найтемніших куточків Bandcamp.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-red-600 group-hover:bg-red-900/20 transition-all rounded-none">
                <Zap size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-widest uppercase">Кривава Аналітика</h3>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-bold uppercase tracking-wider">Точні дані в реальному часі. Кожен стрім, кожен цент — під вашим повним контролем.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-red-600 group-hover:bg-red-900/20 transition-all rounded-none">
                <Shield size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-widest uppercase">Вічна Свобода</h3>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-bold uppercase tracking-wider">Ми не володіємо вашою музикою. Ми лише допомагаємо їй знайти свого слухача.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 sm:py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 sm:gap-12">
          <div className="flex items-center gap-3">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-black tracking-[0.3em] uppercase text-[10px] text-zinc-500">{settings.siteName} © 2024</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-zinc-600">
            {labelSocials.map((social) => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors"
                title={social.name}
              >
                <SocialIcon name={social.name} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;