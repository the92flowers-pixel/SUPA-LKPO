import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { Music, Instagram, Send, Youtube, Globe, Info, X, Play, Cloud, Disc, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PlatformIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('spotify')) return <Music className="text-[#1DB954]" size={20} />;
  if (lowerName.includes('apple') || lowerName.includes('itunes')) return <Apple className="text-[#FA243C]" size={20} />;
  if (lowerName.includes('youtube')) return <Youtube className="text-[#FF0000]" size={20} />;
  if (lowerName.includes('soundcloud')) return <Cloud className="text-[#FF3300]" size={20} />;
  if (lowerName.includes('deezer')) return <Disc className="text-[#EF5466]" size={20} />;
  return <Music size={20} />;
};

const SmartLinkPage = () => {
  const { slug } = useParams();
  const { smartLinks, labelSocials, releases, fields } = useDataStore();
  const [showInfo, setShowInfo] = useState(false);
  
  const link = smartLinks.find(l => l.slug === slug);
  const release = releases.find(r => r.id === link?.releaseId);

  if (!link) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-widest">404 | Link not found</div>;

  const releaseFields = fields.filter(f => f.section === 'release');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-12 px-6 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img src={link.coverUrl} className="w-full h-full object-cover blur-[120px] scale-110" alt="" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-full aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-white/10">
            <img src={link.coverUrl} className="w-full h-full object-cover" alt={link.title} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{link.title}</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-xs">{link.artist}</p>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-sm overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {link.platforms.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center border border-white/5">
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
          <Button 
            variant="ghost" 
            onClick={() => setShowInfo(true)}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white hover:bg-white/5 h-12 px-8 rounded-none border border-white/5"
          >
            <Info size={14} className="mr-3" /> Інформація про реліз
          </Button>

          <div className="flex gap-8 text-zinc-500">
            <a href={labelSocials.instagram} target="_blank" className="hover:text-white transition-colors"><Instagram size={18} /></a>
            <a href={labelSocials.telegram} target="_blank" className="hover:text-white transition-colors"><Send size={18} /></a>
            <a href={labelSocials.youtube} target="_blank" className="hover:text-white transition-colors"><Youtube size={18} /></a>
            <a href={labelSocials.website} target="_blank" className="hover:text-white transition-colors"><Globe size={18} /></a>
          </div>
          
          <div className="text-center opacity-30">
            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-[0.4em]">Powered by ЖУРБА MUSIC</p>
          </div>
        </div>
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Метадані релізу</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              {release && releaseFields.map(field => (
                <div key={field.id} className="space-y-1 border-b border-white/5 pb-2">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{field.label}</p>
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{release[field.name] || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartLinkPage;