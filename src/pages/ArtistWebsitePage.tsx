import React from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { 
  Instagram, Send, Youtube, Globe, Music, Cloud, 
  Disc, Apple, Twitter, MessageCircle, ExternalLink, 
  Link as LinkIcon, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PlatformIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <Instagram size={size} />;
  if (lowerName.includes('telegram')) return <Send size={size} />;
  if (lowerName.includes('youtube')) return <Youtube size={size} />;
  if (lowerName.includes('spotify')) return <Music size={size} className="text-[#1DB954]" />;
  if (lowerName.includes('apple')) return <Apple size={size} className="text-[#FA243C]" />;
  if (lowerName.includes('tiktok')) return <MessageCircle size={size} />;
  if (lowerName.includes('soundcloud')) return <Cloud size={size} className="text-[#FF3300]" />;
  if (lowerName.includes('twitter')) return <Twitter size={size} />;
  if (lowerName.includes('deezer')) return <Disc size={size} className="text-[#EF5466]" />;
  return <LinkIcon size={size} />;
};

const ArtistWebsitePage = () => {
  const { slug } = useParams();
  const { artistWebsites, settings } = useDataStore();
  
  const website = artistWebsites.find(w => w.slug === slug);

  if (!website) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-black uppercase tracking-[0.3em]">
        404 | Сторінку не знайдено
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden selection:bg-red-700/50">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[540px] mx-auto px-6 py-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-700 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/10 relative z-10 shadow-2xl">
              <img 
                src={website.photoUrl || "https://jurbamusic.iceiy.com/profileavatar.png"} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                alt={website.stageName} 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
              {website.stageName}
            </h1>
            <div className="h-1 w-12 bg-red-700 mx-auto" />
            <p className="text-zinc-400 text-xs sm:text-sm font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              {website.bio}
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="w-full space-y-4">
          {website.links.map((link) => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block w-full"
            >
              <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-700/50 backdrop-blur-md py-5 px-6 sm:px-8 transition-all duration-300 group-active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="text-zinc-400 group-hover:text-red-500 transition-colors">
                    <PlatformIcon name={link.name} />
                  </div>
                  <span className="font-black uppercase tracking-[0.2em] text-[11px] sm:text-xs">
                    {link.name}
                  </span>
                </div>
                <ExternalLink size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer Section */}
        <div className="mt-20 flex flex-col items-center space-y-8">
          <div className="flex gap-8 text-zinc-500">
            {website.links.slice(0, 4).map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                className="hover:text-white transition-colors duration-300"
              >
                <PlatformIcon name={link.name} size={18} />
              </a>
            ))}
          </div>
          
          <div className="text-center space-y-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-400">
              Powered by {settings.siteName}
            </p>
            <div className="h-px w-8 bg-zinc-800 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistWebsitePage;