"use client";

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { 
  Instagram, Send, Youtube, Globe, Music, Cloud, 
  Disc, Apple, Twitter, MessageCircle, ExternalLink, 
  Link as LinkIcon, PlayCircle, Headphones, Sparkles, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Platform icons mapping
const PlatformIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('instagram')) return <Instagram size={size} />;
  if (lowerName.includes('telegram')) return <Send size={size} />;
  if (lowerName.includes('youtube')) return <Youtube size={size} />;
  if (lowerName.includes('spotify')) return <Music size={size} className="text-[#1DB954]" />;
  if (lowerName.includes('apple') || lowerName.includes('itunes')) return <Apple size={size} className="text-[#FA243C]" />;
  if (lowerName.includes('tiktok')) return <MessageCircle size={size} />;
  if (lowerName.includes('soundcloud')) return <Cloud size={size} className="text-[#FF3300]" />;
  if (lowerName.includes('twitter') || lowerName.includes('x.com')) return <Twitter size={size} />;
  if (lowerName.includes('deezer')) return <Disc size={size} className="text-[#EF5466]" />;
  if (lowerName.includes('bandcamp')) return <Headphones size={size} />;
  if (lowerName.includes('soundcloud')) return <Cloud size={size} />;
  if (lowerName.includes('website') || lowerName.includes('site')) return <Globe size={size} />;
  
  return <LinkIcon size={size} />;
};

// Get platform accent color
const getPlatformColor = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('spotify')) return '#1DB954';
  if (lowerName.includes('apple') || lowerName.includes('itunes')) return '#FA243C';
  if (lowerName.includes('youtube')) return '#FF0000';
  if (lowerName.includes('soundcloud')) return '#FF3300';
  if (lowerName.includes('deezer')) return '#EF5466';
  if (lowerName.includes('instagram')) return '#E4405F';
  if (lowerName.includes('telegram')) return '#26A5E4';
  if (lowerName.includes('tiktok')) return '#00F2EA';
  if (lowerName.includes('twitter')) return '#1DA1F2';
  return '#ef4444';
};

const ArtistWebsitePage: React.FC = () => {
  const { slug } = useParams();
  const { artistWebsites, settings, labelSocials } = useDataStore();
  
  const website = useMemo(() => 
    artistWebsites.find(w => w.slug === slug),
    [artistWebsites, slug]
  );

  if (!website) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-black uppercase tracking-[0.3em]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-white/5 flex items-center justify-center mb-4">
            <Sparkles className="text-red-700" size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest">404</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Сторінку не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden selection:bg-red-700/50">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[500px] mx-auto px-6 py-16 sm:py-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-16 w-full">
          {/* Avatar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-700/30 to-transparent blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/10 relative z-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] group-hover:border-red-700/30 transition-all duration-500">
              <img 
                src={website.siteAvatarLocal || website.photoUrl || "https://jurbamusic.iceiy.com/profileavatar.png"} 
                className="w-full h-full object-cover" 
                alt={website.stageName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://jurbamusic.iceiy.com/profileavatar.png";
                }}
              />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-700/10 to-transparent animate-pulse" />
          </div>
          
          {/* Artist Name & Bio */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-lg">
              {website.stageName}
            </h1>
            <div className="h-0.5 w-12 bg-gradient-to-r from-red-700 to-transparent mx-auto" />
            <p className="text-zinc-400 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] max-w-xs mx-auto leading-relaxed">
              {website.bio || 'Ваш улюблений артист'}
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="w-full space-y-3">
          {website.links
            .filter(link => link.url && link.url.trim() !== '')
            .map((link, index) => (
            <a 
              key={link.id || index} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block w-full"
            >
              <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 backdrop-blur-xl py-5 px-6 sm:px-8 transition-all duration-500 group-hover:scale-[1.02] group-active:scale-[0.98] relative overflow-hidden">
                {/* Gradient on hover */}
                <div 
                  className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: getPlatformColor(link.name) }}
                />
                
                <div className="flex items-center gap-5 relative z-10">
                  <div 
                    className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ color: getPlatformColor(link.name) }}
                  >
                    <PlatformIcon name={link.name} />
                  </div>
                  <span className="font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs text-zinc-300 group-hover:text-white transition-colors">
                    {link.name}
                  </span>
                </div>
                <ExternalLink 
                  size={14} 
                  className="text-zinc-700 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" 
                />
              </div>
            </a>
          ))}

          {website.links.filter(link => link.url && link.url.trim() !== '').length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                Посилання скоро з'являться
              </p>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-24 flex flex-col items-center space-y-12 w-full">
          {/* Social Icons */}
          <div className="flex gap-8 text-zinc-600">
            {labelSocials.slice(0, 5).map((social, index) => (
              <a 
                key={social.id || index} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-all duration-300 hover:scale-125 hover:rotate-6"
                title={social.name}
              >
                <PlatformIcon name={social.name} size={18} />
              </a>
            ))}
          </div>
          
          {/* Powered By */}
          <div className="text-center space-y-3 opacity-30 hover:opacity-60 transition-opacity duration-700">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-500">
              Powered by {settings.siteName}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700/20 to-transparent" />
    </div>
  );
};

export default ArtistWebsitePage;