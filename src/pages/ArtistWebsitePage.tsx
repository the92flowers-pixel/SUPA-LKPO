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
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-red-900/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-900/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[540px] mx-auto px-6 py-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-700 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full" />
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border border-white/10 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <img 
                src={website.photoUrl || "https://jurbamusic.iceiy.com/profileavatar.png"} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
                alt={website.stageName} 
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
              {website.stageName}
            </h1>
            <div className="h-1 w-16 bg-red-700 mx-auto" />
            <p className="text-zinc-400 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] max-w-xs mx-auto leading-relaxed">
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
              <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-red-700/40 backdrop-blur-xl py-5 px-6 sm:px-10 transition-all duration-500 group-active:scale-[0.98] relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-5">
                  <div className="text-zinc-500 group-hover:text-red-500 transition-colors duration-300">
                    <PlatformIcon name={link.name} />
                  </div>
                  <span className="font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs">
                    {link.name}
                  </span>
                </div>
                <ExternalLink size={14} className="text-zinc-800 group-hover:text-white transition-colors duration-300" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer Section */}
        <div className="mt-24 flex flex-col items-center space-y-10">
          <div className="flex gap-10 text-zinc-600">
            {website.links.slice(0, 5).map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                className="hover:text-red-600 transition-all duration-300 hover:scale-110"
              >
                <PlatformIcon name={link.name} size={18} />
              </a>
            ))}
          </div>
          
          <div className="text-center space-y-3 opacity-20 hover:opacity-100 transition-opacity duration-700">
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-400">
              Powered by {settings.siteName}
            </p>
            <div className="h-px w-12 bg-zinc-800 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistWebsitePage;