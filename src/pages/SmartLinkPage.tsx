import React from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { Music, Instagram, Send, Youtube, Globe, Cloud, Disc, Apple, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlatformIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('spotify')) return <Music className="text-[#1DB954]" size={20} />;
  if (lowerName.includes('apple') || lowerName.includes('itunes')) return <Apple className="text-[#FA243C]" size={20} />;
  if (lowerName.includes('youtube')) return <Youtube className="text-[#FF0000]" size={20} />;
  if (lowerName.includes('soundcloud')) return <Cloud className="text-[#FF3300]" size={20} />;
  if (lowerName.includes('deezer')) return <Disc className="text-[#EF5466]" size={20} />;
  return <Music size={20} />;
};

const SocialIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <Instagram size={18} />;
  if (lowerName.includes('telegram')) return <Send size={18} />;
  if (lowerName.includes('youtube')) return <Youtube size={18} />;
  if (lowerName.includes('twitter')) return <Twitter size={18} />;
  if (lowerName.includes('tiktok')) return <MessageCircle size={18} />;
  return <Globe size={18} />;
};

const SmartLinkPage = () => {
  const { slug } = useParams();
  const { smartLinks, labelSocials, settings } = useDataStore();
  
  const link = smartLinks.find(l => l.slug === slug);

  if (!link) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-widest">404 | Link not found</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img src={link.coverUrl} className="w-full h-full object-cover blur-[120px] scale-110" alt="" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-full aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-none overflow-hidden border border-white/10">
            <img src={link.coverUrl} className="w-full h-full object-cover" alt={link.title} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{link.title}</h1>
            <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-xs">{link.artist}</p>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-none overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {link.platforms.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/5">
                    <PlatformIcon name={p.name} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[11px]">{p.name}</span>
                </div>
                <Button 
                  onClick={() => window.open(p.url, '_blank')}
                  className="bg-white/10 hover:bg-white text-white hover:text-black text-[9px] font-black uppercase tracking-widest px-6 h-9 rounded-none transition-all"
                >
                  Слухати
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <div className="flex gap-8 text-zinc-500">
            {labelSocials.map((social) => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title={social.name}
              >
                <SocialIcon name={social.name} />
              </a>
            ))}
          </div>
          
          <div className="text-center opacity-30">
            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-[0.4em]">Powered by {settings.siteName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLinkPage;