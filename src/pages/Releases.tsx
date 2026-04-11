import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Play, Info, Music, Link as LinkIcon, Plus, Trash2, Globe, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const PLATFORMS_LIST = [
  "Apple Music",
  "Deezer",
  "iTunes",
  "SoundCloud",
  "Spotify",
  "YouTube",
  "YouTube Music"
];

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const Releases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [viewingRelease, setViewingRelease] = useState<any>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [platforms, setPlatforms] = useState([{ id: '1', name: 'Spotify', url: '' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [existingLinkId, setExistingLinkId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { releases, smartLinks, addSmartLink, updateSmartLink, fields } = useDataStore();

  const userReleases = releases.filter(r => r.userId === user?.id);
  const filteredReleases = userReleases.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenModal = (release: any) => {
    setSelectedRelease(release);
    const existingLink = smartLinks.find(l => l.releaseId === release.id);
    
    if (existingLink) {
      setIsEditing(true);
      setExistingLinkId(existingLink.id);
      setCustomSlug(existingLink.slug);
      setPlatforms(existingLink.platforms.length > 0 ? existingLink.platforms : [{ id: '1', name: 'Spotify', url: '' }]);
    } else {
      setIsEditing(false);
      setExistingLinkId(null);
      setCustomSlug(release.title.toLowerCase().replace(/\s+/g, '-'));
      setPlatforms([{ id: '1', name: 'Spotify', url: '' }]);
    }
  };

  const handleSaveSmartLink = () => {
    if (!customSlug) {
      showError('Вкажіть URL');
      return;
    }

    const isSlugTaken = smartLinks.some(l => l.slug === customSlug && l.id !== existingLinkId);
    if (isSlugTaken) {
      showError('Цей URL вже зайнятий. Оберіть інший.');
      return;
    }

    const linkData = {
      releaseId: selectedRelease.id,
      slug: customSlug,
      title: selectedRelease.title,
      artist: selectedRelease.artist,
      coverUrl: selectedRelease.coverUrl,
      platforms: platforms.filter(p => p.url !== '').map(p => ({ 
        ...p, 
        icon: p.name.toLowerCase().replace(/\s+/g, '-') 
      })),
    };

    if (isEditing && existingLinkId) {
      updateSmartLink(existingLinkId, linkData);
      showSuccess('Smart Link оновлено!');
    } else {
      addSmartLink({
        ...linkData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      });
      showSuccess('Smart Link створено!');
    }
    
    setSelectedRelease(null);
    window.open(`/s/${customSlug}`, '_blank');
  };

  const releaseFields = fields.filter(f => f.section === 'release');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Каталог</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування вашою спадщиною</p>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            placeholder="Пошук..." 
            className="bg-black/40 border-white/5 w-64 h-12 rounded-none" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredReleases.map((release) => (
          <Card key={release.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden group hover:border-red-900/30 transition-all duration-500">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={release.coverUrl} 
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" 
                alt="" 
              />
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-6">
                <Button onClick={() => handleOpenModal(release)} className="w-full bg-red-700 hover:bg-red-800 rounded-none text-[10px] font-black uppercase tracking-widest h-12">
                  <LinkIcon size={14} className="mr-2" /> 
                  {smartLinks.some(l => l.releaseId === release.id) ? 'Редагувати Link' : 'Smart Link'}
                </Button>
                <Button onClick={() => setViewingRelease(release)} variant="outline" className="w-full border-white/10 hover:bg-white/5 rounded-none text-[10px] font-black uppercase tracking-widest h-12">
                  <Eye size={14} className="mr-2" /> Деталі
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="font-black text-white text-sm uppercase tracking-wider truncate">{release.title}</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{release.genre}</p>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <Badge className="bg-white/5 text-zinc-500 border-none text-[9px] uppercase font-black">{release.status}</Badge>
                <span className="text-xs font-black text-red-700">{release.streams.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Smart Link Modal */}
      <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {isEditing ? 'Редагувати Smart Link' : 'Створити Smart Link'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Кастомний URL</Label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 h-12">
                <span className="text-zinc-600 text-xs font-mono">/s/</span>
                <input 
                  value={customSlug} 
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="bg-transparent border-none focus:ring-0 text-white text-xs font-mono flex-1"
                  placeholder="your-link-here"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Платформи</Label>
              {platforms.map((p, index) => (
                <div key={p.id} className="flex gap-3 items-end p-4 bg-white/5 border border-white/5 relative">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[9px] text-zinc-600 uppercase font-black">Платформа</Label>
                    <Select value={p.name} onValueChange={(val) => {
                      const newP = [...platforms];
                      newP[index].name = val;
                      setPlatforms(newP);
                    }}>
                      <SelectTrigger className="bg-black/40 border-white/5 h-10 text-xs rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                        {PLATFORMS_LIST.map(plat => (
                          <SelectItem key={plat} value={plat} className="text-xs">{plat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2] space-y-2">
                    <Label className="text-[9px] text-zinc-600 uppercase font-black">URL посилання</Label>
                    <Input value={p.url} onChange={(e) => {
                      const newP = [...platforms];
                      newP[index].url = e.target.value;
                      setPlatforms(newP);
                    }} className="bg-black/40 border-white/5 h-10 text-xs rounded-none" placeholder="URL (https://...)" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-900 h-10 w-10" onClick={() => setPlatforms(platforms.filter((_, i) => i !== index))}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full border-white/5 text-[10px] font-black uppercase tracking-widest h-10 rounded-none" onClick={() => setPlatforms([...platforms, { id: Date.now().toString(), name: 'Spotify', url: '' }])}>
                <Plus size={14} className="mr-2" /> Додати платформу
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSmartLink} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none">
              {isEditing ? 'Зберегти зміни' : 'Створити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Details Modal */}
      <Dialog open={!!viewingRelease} onOpenChange={() => setViewingRelease(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Інформація про реліз</DialogTitle>
          </DialogHeader>
          {viewingRelease && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="aspect-square border border-white/5 shadow-2xl">
                  <img 
                    src={viewingRelease.coverUrl} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                <div className="p-4 bg-white/5 border border-white/5 space-y-2">
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Статус дистрибуції</p>
                  <Badge className="bg-red-900/20 text-red-500 border-none text-[10px] font-black uppercase tracking-widest">
                    {viewingRelease.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {releaseFields.map(field => (
                    <div key={field.id} className="space-y-1 border-b border-white/5 pb-3">
                      <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">{field.label}</p>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">
                        {viewingRelease[field.name] || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingRelease(null)} className="bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none border border-white/5">
              Закрити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Releases;