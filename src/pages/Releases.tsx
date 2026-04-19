import React, { useState, useEffect } from 'react';
import { Search, Music, Link as LinkIcon, Plus, Trash2, Eye, Clock, CheckCircle, XCircle, AlertTriangle, FileAudio, Hash } from 'lucide-react';
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
  "Apple Music", "Deezer", "iTunes", "SoundCloud", "Spotify", "YouTube", "YouTube Music"
];

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

interface PlatformItem {
  id: string;
  name: string;
  url: string;
}

const Releases = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [viewingRelease, setViewingRelease] = useState<any>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [platforms, setPlatforms] = useState<PlatformItem[]>([{ id: '1', name: 'Spotify', url: '' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [existingLinkId, setExistingLinkId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { releases, smartLinks, addSmartLink, updateSmartLink, fetchReleases } = useDataStore();

  useEffect(() => {
    if (user) {
      fetchReleases(user.id, user.role);
    }
  }, [user, fetchReleases]);

  const filteredReleases = releases.filter(r => {
    const title = r.title || '';
    const artist = r.artist || '';
    const search = searchQuery.toLowerCase();
    
    const matchesSearch = title.toLowerCase().includes(search) || 
                          artist.toLowerCase().includes(search);

    if (user?.role === 'admin') {
      return matchesSearch;
    }
    
    return r.userId === user?.id && matchesSearch;
  });

  const userReleases = filteredReleases;

  const handleOpenModal = (release: any) => {
    setSelectedRelease(release);
    const existingLink = smartLinks.find(l => l.releaseId === release.id);
    
    if (existingLink) {
      setIsEditing(true);
      setExistingLinkId(existingLink.id);
      setCustomSlug(existingLink.slug);
      setPlatforms(existingLink.platforms.length > 0 ? existingLink.platforms.map(p => ({ id: p.id || Date.now().toString(), name: p.name, url: p.url })) : [{ id: '1', name: 'Spotify', url: '' }]);
    } else {
      setIsEditing(false);
      setExistingLinkId(null);
      setCustomSlug((release.title || '').toLowerCase().replace(/\s+/g, '-'));
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
      platforms: platforms.filter(p => p.url !== '').map(p => ({ ...p, icon: p.name.toLowerCase().replace(/\s+/g, '-') })),
    };

    if (isEditing && existingLinkId) {
      updateSmartLink(existingLinkId, linkData);
      showSuccess('Smart Link оновлено!');
    } else {
      addSmartLink({ ...linkData, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() });
      showSuccess('Smart Link створено!');
    }
    
    setSelectedRelease(null);
    window.open(`/s/${customSlug}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      'На модерації': { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Clock },
      'Опубліковано': { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle },
      'Відхилено': { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
      'Очікує видалення': { bg: 'bg-red-900/20', text: 'text-red-500', icon: AlertTriangle },
      'Видаляється': { bg: 'bg-zinc-800', text: 'text-zinc-400', icon: Trash2 },
    };
    const config = statusConfig[status] || statusConfig['На модерації'];
    const Icon = config.icon;
    return (
      <Badge className={cn("border-none text-[9px] uppercase font-black tracking-widest rounded-none px-3 py-1", config.bg, config.text)}>
        <Icon size={10} className="mr-1.5" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">Каталог</h1>
          <p className="text-zinc-500 mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
            {user?.role === 'admin' ? 'Всі релізи' : 'Ваші релізи'} ({userReleases.length})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <Input 
              placeholder="Пошук..." 
              className="bg-black/40 border-white/5 w-full sm:w-64 h-12 rounded-none pl-10 text-xs font-bold uppercase tracking-widest" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <Button 
            onClick={() => navigate('/new-release')}
            className="bg-red-700 hover:bg-red-800 rounded-none text-[10px] font-black uppercase tracking-widest h-12 px-6 shadow-[0_0_20px_rgba(185,28,28,0.2)]"
          >
            <Plus size={14} className="mr-2" />
            Новий реліз
          </Button>
        </div>
      </div>

      {userReleases.length === 0 ? (
        <div className="text-center py-16 sm:py-24 border border-dashed border-white/5 bg-white/[0.02]">
          <Music className="mx-auto text-zinc-800 mb-6" size={48} sm:size={56} />
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600">
            {searchQuery ? 'Нічого не знайдено' : 'Релізів ще немає'}
          </p>
          {!searchQuery && user?.role !== 'admin' && (
            <Button onClick={() => navigate('/new-release')} className="mt-8 bg-red-700 hover:bg-red-800 rounded-none text-[10px] font-black uppercase tracking-widest px-10 h-12">
              <Plus size={14} className="mr-2" />
              Створити перший реліз
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
          {userReleases.map((release) => (
            <Card key={release.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden group hover:border-red-700/40 transition-all duration-500 shadow-2xl">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={release.coverUrl || FALLBACK_IMAGE} 
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                  alt={release.title} 
                />
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                  {getStatusBadge(release.status)}
                </div>
                <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6 sm:p-8 backdrop-blur-sm">
                  <Button onClick={() => handleOpenModal(release)} className="w-full bg-red-700 hover:bg-red-800 rounded-none text-[10px] font-black uppercase tracking-widest h-12">
                    <LinkIcon size={14} className="mr-2" /> 
                    {smartLinks.some(l => l.releaseId === release.id) ? 'Редагувати Link' : 'Smart Link'}
                  </Button>
                  <Button onClick={() => setViewingRelease(release)} variant="outline" className="w-full border-white/10 hover:bg-white/10 rounded-none text-[10px] font-black uppercase tracking-widest h-12">
                    <Eye size={14} className="mr-2" /> Деталі
                  </Button>
                </div>
              </div>
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="min-w-0">
                  <h3 className="font-black text-white text-sm sm:text-base uppercase tracking-tighter leading-tight truncate group-hover:text-red-500 transition-colors">
                    {release.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1.5 truncate">
                    {release.artist}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[7px] sm:text-[8px] text-zinc-700 uppercase font-black tracking-widest">Жанр</p>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-black tracking-widest truncate block">{release.genre}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Smart Link Modal */}
      <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-none p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">
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
              <div className="space-y-3">
                {platforms.map((p, index) => (
                  <div key={p.id} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end p-4 bg-white/5 border border-white/5 relative">
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
                    <div className="flex-[2] space-y-2 flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] text-zinc-600 uppercase font-black">URL</Label>
                        <Input value={p.url} onChange={(e) => {
                          const newP = [...platforms];
                          newP[index].url = e.target.value;
                          setPlatforms(newP);
                        }} className="bg-black/40 border-white/5 h-10 text-xs rounded-none" placeholder="URL (https://...)" />
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-900 h-10 w-10 shrink-0" onClick={() => setPlatforms(platforms.filter((_, i) => i !== index))}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full border-white/5 text-[10px] font-black uppercase tracking-widest h-10 rounded-none" onClick={() => setPlatforms([...platforms, { id: Date.now().toString(), name: 'Spotify', url: '' }])}>
                <Plus size={14} className="mr-2" /> Додати платформу
              </Button>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setSelectedRelease(null)} className="w-full sm:w-auto rounded-none text-[10px] font-black uppercase tracking-widest">Скасувати</Button>
            <Button onClick={handleSaveSmartLink} className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none">
              {isEditing ? 'Зберегти зміни' : 'Створити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Details Modal */}
      <Dialog open={!!viewingRelease} onOpenChange={() => setViewingRelease(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto rounded-none p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">Інформація про реліз</DialogTitle>
          </DialogHeader>
          {viewingRelease && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 py-4 sm:py-6">
              <div className="space-y-6">
                <div className="aspect-square border border-white/5 shadow-2xl max-w-xs mx-auto md:max-w-none">
                  <img 
                    src={viewingRelease.coverUrl || FALLBACK_IMAGE} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} 
                    className="w-full h-full object-cover" 
                    alt={viewingRelease.title} 
                  />
                </div>
                <div className="p-4 bg-white/5 border border-white/5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Статус</p>
                    {getStatusBadge(viewingRelease.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Стріми</p>
                    <p className="text-base sm:text-lg font-black text-white">{viewingRelease.streams?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-1 border-b border-white/5 pb-3">
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Назва</p>
                  <p className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{viewingRelease.title}</p>
                </div>
                <div className="space-y-1 border-b border-white/5 pb-3">
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Артист</p>
                  <p className="text-xs sm:text-sm font-bold text-white">{viewingRelease.artist}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">UPC</p>
                    <p className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate">{viewingRelease.upc || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">ISRC</p>
                    <p className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate">{viewingRelease.isrc || '—'}</p>
                  </div>
                </div>
                <div className="space-y-1 border-b border-white/5 pb-3">
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Композитор</p>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{viewingRelease.composer || '—'}</p>
                </div>
                <div className="space-y-1 border-b border-white/5 pb-3">
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Лейбл</p>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{viewingRelease.label || 'ЖУРБА MUSIC'}</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-red-700">Треклист</p>
                  <div className="space-y-2">
                    {viewingRelease.tracks?.map((track: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-black text-zinc-600 shrink-0">{idx + 1}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-bold text-white uppercase truncate">{track.title}</p>
                            <p className="text-[7px] sm:text-[8px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                              <FileAudio size={10} /> {track.fileName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingRelease(null)} className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none border border-white/5">
              Закрити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Releases;