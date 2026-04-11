import React from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { Music, Instagram, Send, Youtube, Globe, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SmartLinkPage = () => {
  const { slug } = useParams();
  const { smartLinks, labelSocials } = useDataStore();
  const link = smartLinks.find(l => l.slug === slug);

  if (!link) return <div className="min-h-screen flex items-center justify-center text-white">404 | Link not found</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-20 px-6 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
        <img src={link.coverUrl} className="w-full h-full object-cover blur-[100px]" alt="" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-64 h-64 shadow-2xl rounded-sm overflow-hidden border border-white/10">
            <img src={link.coverUrl} className="w-full h-full object-cover" alt={link.title} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">{link.title}</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mt-1">{link.artist}</p>
            <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.2em] mt-4">Виберіть музикальний сервіс</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-sm overflow-hidden divide-y divide-white/5">
          {link.platforms.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center">
                  <Music size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">{p.name}</span>
              </div>
              <Button 
                onClick={() => window.open(p.url, '_blank')}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-6 h-10 rounded-none"
              >
                Слухати
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-8 pt-10">
          <div className="flex gap-8 text-zinc-500">
            <a href={labelSocials.instagram} target="_blank" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href={labelSocials.telegram} target="_blank" className="hover:text-white transition-colors"><Send size={20} /></a>
            <a href={labelSocials.youtube} target="_blank" className="hover:text-white transition-colors"><Youtube size={20} /></a>
            <a href={labelSocials.website} target="_blank" className="hover:text-white transition-colors"><Globe size={20} /></a>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em]">Created with ЖУРБА MUSIC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLinkPage;