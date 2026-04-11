import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Music, Share2, Play, ExternalLink, ChevronRight, Copy, Check } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';

const SmartLink = () => {
  const { id } = useParams();
  const { releases } = useDataStore();
  const [copied, setCopied] = React.useState(false);
  const release = releases.find(r => r.id === id);

  if (!release) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Реліз не знайдено</h1>
          <Link to="/" className="text-violet-500 hover:underline">Повернутися на головну</Link>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showSuccess('Посилання скопійовано!');
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { name: 'Spotify', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', color: '#1DB954' },
    { name: 'Apple Music', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', color: '#FA243C' },
    { name: 'YouTube Music', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg', color: '#FF0000' },
    { name: 'Deezer', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Deezer_logo.svg', color: '#FF0000' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blur */}
      <div 
        className="absolute inset-0 opacity-20 blur-[100px] scale-150"
        style={{ 
          backgroundImage: `url(${release.coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Cover Art */}
        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">{release.title}</h1>
          <p className="text-xl text-violet-400 font-medium">{release.artist}</p>
        </div>

        {/* Platform Links */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={platform.icon} alt={platform.name} className="w-6 h-6 object-contain brightness-200" />
                </div>
                <span className="font-bold text-lg">{platform.name}</span>
              </div>
              <Button variant="ghost" className="rounded-full bg-white/5 group-hover:bg-violet-600 group-hover:text-white transition-all">
                Слухати
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-bold tracking-widest uppercase">
            <Music size={16} />
            <span>ЖУРБА MUSIC DISTRIBUTION</span>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-white/10 hover:bg-white/5"
              onClick={handleCopy}
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
              <Share2 size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLink;