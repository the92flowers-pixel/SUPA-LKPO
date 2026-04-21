"use client";

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { 
  Instagram, Send, Youtube, Globe, Cloud, Disc, Apple, Twitter, 
  MessageCircle, ExternalLink, Music, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Platform icons with brand colors
const PlatformIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('spotify')) return <Music size={size} className="text-[#1DB954]" />;
  if (lowerName.includes('apple') || lowerName.includes('itunes')) return <Apple size={size} className="text-[#FA243C]" />;
  if (lowerName.includes('youtube') && !lowerName.includes('music')) return <Youtube size={size} className="text-[#FF0000]" />;
  if (lowerName.includes('youtube music')) return <Youtube size={size} className="text-[#FF0000]" />;
  if (lowerName.includes('soundcloud')) return <Cloud size={size} className="text-[#FF3300]" />;
  if (lowerName.includes('deezer')) return <Disc size={size} className="text-[#EF5466]" />;
  if (lowerName.includes('instagram')) return <Instagram size={size} />;
  if (lowerName.includes('telegram')) return <Send size={size} />;
  if (lowerName.includes('tiktok')) return <MessageCircle size={size} />;
  if (lowerName.includes('twitter')) return <Twitter size={size} />;
  
  return <Music size={size} />;
};

// Get brand color for platform
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

const SmartLinkPage: React.FC = () => {
  const { slug } = useParams();
  const { smartLinks, labelSocials, settings, incrementSmartLinkClicks } = useDataStore();
  
  const link = smartLinks.find(l => l.slug === slug);

  useEffect(() => {
    if (link) {
      incrementSmartLinkClicks(link.id);
    }
  }, [slug]);

  if (!link) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-black uppercase tracking-widest">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-white/5 flex items-center justify-center mb-4">
            <Music size={32} className="text-red-700" />
          </div>
          <h1 className="text-3xl font-black">404</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Link not found</p>
        </div>
      </div>
    );
  }

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
  };

  // Social icon for footer
  const SocialIcon = ({ name }: { name: string }) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('instagram')) return <Instagram size={18} />;
    if (lowerName.includes('telegram')) return <Send size={18} />;
    if (lowerName.includes('youtube')) return <Youtube size={18} />;
    if (lowerName.includes('twitter')) return <Twitter size={18} />;
    if (lowerName.includes('tiktok')) return <MessageCircle size={18} />;
    return <Globe size={18} />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-12 px-6 relative overflow-hidden selection:bg-red-700/50">
      {/* Background with blurred cover */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <img 
          src={link.coverUrl || "https://jurbamusic.iceiy.com/releasepreview.png"} 
          className="w-full h-full object-cover blur-[120px] scale-110" 
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).src = "https://jurbamusic.iceiy.com/releasepreview.png"; }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/60 to-[#050505] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] space-y-10">
        {/* Header with Cover */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Cover Art */}
          <div className="w-full aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-none overflow-hidden border border-white/10 relative">
            <img 
              src={link.coverUrl || "https://jurbamusic.iceiy.com/releasepreview.png"} 
              className="w-full h-full object-cover" 
              alt={link.title}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://jurbamusic.iceiy.com/releasepreview.png"; }}
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={28} className="text-white ml-1" fill="white" />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-lg">
              {link.title || 'Untitled Track'}
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-sm">
              {link.artist || 'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Platform Links */}
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-none overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {link.platforms && link.platforms.length > 0 ? (
              link.platforms.map((p: any, index: number) => (
                <div 
                  key={p.id || index} 
                  className="flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group"
                  onClick={() => p.url && handlePlatformClick(p.url)}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/10"
                      style={{ color: getPlatformColor(p.name) }}
                    >
                      <PlatformIcon name={p.name} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[11px] text-zinc-200 group-hover:text-white transition-colors">
                      {p.name}
                    </span>
                  </div>
                  {p.url ? (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlatformClick(p.url);
                      }}
                      className="bg-white/10 hover:bg-white text-white hover:text-black text-[9px] font-black uppercase tracking-widest px-6 h-9 rounded-none transition-all"
                    >
                      Слухати
                    </Button>
                  ) : (
                    <span className="text-[9px] text-zinc-700 uppercase font-black">Недоступно</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Платформи скоро з'являться
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Social Links */}
        <div className="flex flex-col items-center space-y-8">
          {/* Social Icons */}
          <div className="flex gap-8 text-zinc-500">
            {labelSocials.map((social) => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-all duration-300 hover:scale-110"
                title={social.name}
              >
                <SocialIcon name={social.name} />
              </a>
            ))}
          </div>
          
          {/* Powered By */}
          <div className="text-center opacity-30 hover:opacity-60 transition-opacity duration-700">
            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-[0.4em]">
              Powered by {settings.siteName}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative border */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700/20 to-transparent" />
    </div>
  );
};

export default SmartLinkPage;