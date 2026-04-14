import React from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/lib/store';
import { Instagram, Send, Youtube, Globe, Music, Cloud, Disc, Apple, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlatformIcon = ({ name }: { name: string }) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <Instagram size={20} />;
  if (lowerName.includes('telegram')) return <Send size={20} />;
  if (lowerName.includes('youtube')) return <Youtube size={20} />;
  if (lowerName.includes('spotify')) return <Music size={20} />;
  if (lowerName.includes('apple')) return <Apple size={20} />;
  if (lowerName.includes('tiktok')) return <MessageCircle size={20} />;
  if (lowerName.includes('soundcloud')) return <Cloud size={20} />;
  return <Globe size={20} />;
};

const ArtistWebsitePage = () => {
  const { slug } = useParams();
  const { artistWebsites } = useDataStore();
  
  const website = artistWebsites.find(w => w.slug === slug);

  if (!website) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-widest">404 | Website not found</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-[480px] space-y-10 flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white">
            <img src={website.photoUrl} className="w-full h-full object-cover" alt={website.stageName} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">{website.stageName}</h1>
            <p className="text-zinc-500 text-sm font-medium">{website.bio}</p>
          </div>
        </div>

        {/* Links */}
        <div className="w-full space-y-4">
          {website.links.map((link) => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-white hover:bg-zinc-50 border border-zinc-100 shadow-sm py-5 px-8 rounded-xl text-center font-bold text-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Footer Socials */}
        <div className="flex gap-6 text-zinc-400 pt-8">
          {website.links.slice(0, 5).map((link) => (
            <a key={link.id} href={link.url} target="_blank" className="hover:text-zinc-900 transition-colors">
              <PlatformIcon name={link.name} />
            </a>
          ))}
        </div>

        <div className="pt-12 opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">{website.stageName} © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistWebsitePage;