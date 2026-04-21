"use client";

import React, { useState, useMemo } from 'react';
import { 
  Music, 
  Plus, 
  Search, 
  ExternalLink, 
  Link2, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  Globe, 
  BarChart3,
  Loader2,
  Upload,
  AlertCircle,
  Play
} from 'lucide-react';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/ui/ImageUploader';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const PLATFORMS_LIST = [
  { name: "Spotify", icon: "spotify" },
  { name: "Apple Music", icon: "apple" },
  { name: "YouTube", icon: "youtube" },
  { name: "YouTube Music", icon: "youtube" },
  { name: "SoundCloud", icon: "soundcloud" },
  { name: "Deezer", icon: "deezer" },
  { name: "iTunes", icon: "apple" },
];

const Releases: React.FC = () => {
  const { user } = useAuthStore();
  const { releases, smartLinks, addSmartLink, updateSmartLink, deleteSmartLink, deleteRelease, statuses } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [isSmartLinkModalOpen, setIsSmartLinkModalOpen] = useState(false);
  
  // Smart Link Form State - Real-time preview
  const [formData, setFormData] = useState<{
    slug: string;
    title: string;
    artist: string;
    coverUrl: string;
    avatarLocal: string;
    platforms: { id: string; name: string; url: string; icon: string }[];
  }>({
    slug: '',
    title: '',
    artist: '',
    coverUrl: '',
    avatarLocal: '',
    platforms: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const userReleases = useMemo(() => 
    releases.filter(r => r.userId === user?.id), 
    [releases, user]
  );

  const filteredReleases = useMemo(() => 
    userReleases.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [userReleases, searchQuery]
  );

  const handleCreateSmartLink = (release: any) => {
    const existing = smartLinks.find(l => l.releaseId === release.id);
    setSelectedRelease(release);
    
    if (existing) {
      setFormData({
        slug: existing.slug || '',
        title: existing.title || release.title,
        artist: existing.artist || release.artist,
        coverUrl: existing.coverUrl || release.coverUrl,
        avatarLocal: existing.avatarLocal || '',
        platforms: existing.platforms || getDefaultPlatforms(),
      });
    } else {
      setFormData({
        slug: release.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50),
        title: release.title,
        artist: release.artist,
        coverUrl: release.coverUrl || '',
        avatarLocal: release.coverImageLocal || '',
        platforms: getDefaultPlatforms(),
      });
    }
    setIsSmartLinkModalOpen(true);
  };

  const getDefaultPlatforms = () => {
    return PLATFORMS_LIST.map((p, i) => ({
      id: `platform-${Date.now()}-${i}`,
      name: p.name,
      url: '',
      icon: p.icon,
    }));
  };

  // Handle cover upload for smart link
  const handleCoverUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatarLocal: url, coverUrl: url }));
  };

  const handleCoverDelete = () => {
    setFormData(prev => ({ ...prev, avatarLocal: '', coverUrl: '' }));
  };

  const updatePlatformUrl = (index: number, url: string) => {
    setFormData(prev => {
      const newPlatforms = [...prev.platforms];
      newPlatforms[index] = { ...newPlatforms[index], url };
      return { ...prev, platforms: newPlatforms };
    });
  };

  const saveSmartLink = async () => {
    if (!formData.slug) {
      showError('Вкажіть адресу посилання');
      return;
    }

    setIsSaving(true);
    try {
      const existing = smartLinks.find(l => l.releaseId === selectedRelease.id);
      const linkData = {
        releaseId: selectedRelease.id,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        title: formData.title || selectedRelease.title,
        artist: formData.artist || selectedRelease.artist,
        coverUrl: formData.avatarLocal || formData.coverUrl,
        avatarLocal: formData.avatarLocal,
        platforms: formData.platforms.filter(p => p.url.trim() !== ''),
      };

      if (existing) {
        await updateSmartLink(existing.id, linkData);
        showSuccess('Смартлінк оновлено');
      } else {
        await addSmartLink(linkData);
        showSuccess('Смартлінк створено');
      }
      setIsSmartLinkModalOpen(false);
    } catch (error) {
      console.error('Error saving smart link:', error);
      showError('Помилка при збереженні');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей реліз?')) return;
    try {
      await deleteRelease(id);
      showSuccess('Реліз видалено');
    } catch (error) {
      showError('Помилка при видаленні');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Посилання скопійовано');
  };

  const getStatusColor = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    if (!status) return 'bg-zinc-500/10 text-zinc-500';
    switch (status.color) {
      case 'green': return 'bg-green-500/10 text-green-500';
      case 'yellow': return 'bg-yellow-500/10 text-yellow-500';
      case 'red': return 'bg-red-500/10 text-red-500';
      case 'blue': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-zinc-500/10 text-zinc-500';
    }
  };

  // Get platform color
  const getPlatformColor = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spotify')) return '#1DB954';
    if (lowerName.includes('apple')) return '#FA243C';
    if (lowerName.includes('youtube')) return '#FF0000';
    if (lowerName.includes('soundcloud')) return '#FF3300';
    if (lowerName.includes('deezer')) return '#EF5466';
    return '#ef4444';
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Каталог релізів</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування вашою музикою ({userReleases.length})</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <Input 
            placeholder="Пошук за назвою..." 
            className="bg-black/40 border-white/5 pl-10 h-12 rounded-none text-[10px] font-bold uppercase tracking-widest" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredReleases.map((release) => {
          const hasSmartLink = smartLinks.some(l => l.releaseId === release.id);
          const link = smartLinks.find(l => l.releaseId === release.id);
          const displayCover = release.coverImageLocal || release.coverUrl || FALLBACK_IMAGE;

          return (
            <Card key={release.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden flex flex-col group hover:border-red-700/30 transition-all duration-500">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={displayCover} 
                  alt={release.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className={cn("border-none text-[9px] font-black uppercase tracking-widest rounded-none px-3 py-1", getStatusColor(release.status))}>
                    {release.status}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black rounded-none text-[10px] font-black uppercase tracking-widest"
                    onClick={() => handleCreateSmartLink(release)}
                  >
                    <Link2 size={14} className="mr-2" /> {hasSmartLink ? 'Редагувати лінк' : 'Створити лінк'}
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">{release.title}</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{release.artist}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white h-8 w-8">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest focus:bg-red-900/20 focus:text-red-500 cursor-pointer">
                        <Edit2 size={14} className="mr-2" /> Редагувати
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-[10px] font-black uppercase tracking-widest text-red-900 focus:bg-red-900/20 focus:text-red-500 cursor-pointer"
                        onClick={() => handleDeleteRelease(release.id)}
                      >
                        <Trash2 size={14} className="mr-2" /> Видалити
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Стріми</p>
                    <p className="text-sm font-black text-white tracking-tighter">{release.streams.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Жанр</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase truncate">{release.genre}</p>
                  </div>
                </div>

                {hasSmartLink && (
                  <div className="mt-6 p-3 bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe size={12} className="text-red-700 shrink-0" />
                      <span className="text-[9px] font-mono text-zinc-500 truncate">/s/{link?.slug}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white" onClick={() => copyToClipboard(`${window.location.origin}/s/${link?.slug}`)}>
                        <Copy size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white" onClick={() => window.open(`/s/${link?.slug}`, '_blank')}>
                        <ExternalLink size={12} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredReleases.length === 0 && (
          <div className="col-span-full py-24 text-center border border-dashed border-white/5">
            <Music className="mx-auto text-zinc-800 mb-4" size={48} />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Релізів не знайдено</h3>
            <p className="text-zinc-600 mt-2 text-xs font-bold uppercase tracking-widest">Почніть з завантаження вашого першого треку</p>
          </div>
        )}
      </div>

      {/* Smart Link Builder Modal with Live Preview */}
      <Dialog open={isSmartLinkModalOpen} onOpenChange={setIsSmartLinkModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-none p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Смартлінк</DialogTitle>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Створіть єдину сторінку для всіх стрімінгових платформ
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Cover Upload with Square Validation */}
              <ImageUploader 
                bucket="smartlinks"
                userId={user?.id || ''}
                entityType="smartlinks"
                currentUrl={formData.avatarLocal || formData.coverUrl}
                onUpload={handleCoverUpload}
                onDelete={handleCoverDelete}
                label="Обкладинка (квадратна, мін. 1400x1400px)"
                className="max-w-sm mx-auto lg:mx-0"
                aspectRatio="square"
              />

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Slug</Label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 h-12">
                  <span className="text-zinc-600 text-xs font-mono">/s/</span>
                  <input 
                    value={formData.slug} 
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').substring(0, 50) }))}
                    className="bg-transparent border-none focus:ring-0 text-white text-xs font-mono flex-1"
                    placeholder="назва-релізу"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Платформи</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {formData.platforms.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5">
                      <div 
                        className="w-8 h-8 flex items-center justify-center text-sm shrink-0"
                        style={{ color: getPlatformColor(p.name) }}
                      >
                        <Music size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-24 shrink-0">{p.name}</span>
                      <Input 
                        value={p.url} 
                        onChange={(e) => updatePlatformUrl(idx, e.target.value)}
                        className="flex-1 bg-transparent border-white/5 h-8 text-xs"
                        placeholder="Вставте посилання..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Play size={14} /> Попередній перегляд
              </Label>
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none overflow-hidden">
                {/* Mini preview */}
                <div className="aspect-square bg-gradient-to-b from-white/5 to-transparent relative">
                  <img 
                    src={formData.avatarLocal || formData.coverUrl || FALLBACK_IMAGE} 
                    className="w-full h-full object-cover opacity-80" 
                    alt="Cover Preview"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-black uppercase truncate">{formData.title || 'Назва треку'}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">{formData.artist || 'Артист'}</p>
                  </div>
                  <div className="space-y-1">
                    {formData.platforms.filter(p => p.url.trim()).slice(0, 4).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px] text-zinc-400">
                        <Check size={10} className="text-green-500" />
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-white/5 pt-6">
            <Button variant="ghost" onClick={() => setIsSmartLinkModalOpen(false)} className="rounded-none text-[10px] font-black uppercase tracking-widest">Скасувати</Button>
            <Button 
              onClick={saveSmartLink}
              disabled={isSaving || !formData.slug}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
              Зберегти смартлінк
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Releases;