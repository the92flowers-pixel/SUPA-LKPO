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
  X,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/ui/ImageUploader';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const PLATFORMS_LIST = [
  "Apple Music",
  "Deezer",
  "iTunes",
  "SoundCloud",
  "Spotify",
  "YouTube",
  "YouTube Music"
];

const Releases = () => {
  const { user } = useAuthStore();
  const { releases, smartLinks, addSmartLink, updateSmartLink, deleteSmartLink, deleteRelease, statuses } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [isSmartLinkModalOpen, setIsSmartLinkModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Smart Link Form State
  const [slug, setSlug] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [avatarLocal, setAvatarLocal] = useState('');
  const [platforms, setPlatforms] = useState<any[]>([]);
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
      setSlug(existing.slug);
      setCoverUrl(existing.coverUrl);
      setAvatarLocal(existing.avatarLocal || '');
      setPlatforms(existing.platforms || []);
    } else {
      setSlug(release.title.toLowerCase().replace(/\s+/g, '-'));
      setCoverUrl(release.coverUrl);
      setAvatarLocal(release.coverImageLocal || '');
      setPlatforms(PLATFORMS_LIST.map(p => ({ id: Date.now() + Math.random(), name: p, url: '', icon: p.toLowerCase().replace(/\s+/g, '-') })));
    }
    setIsSmartLinkModalOpen(true);
  };

  // Handle cover upload for smart link
  const handleCoverUpload = (url: string) => {
    setAvatarLocal(url);
    setCoverUrl(url);
  };

  const handleCoverDelete = () => {
    setAvatarLocal('');
    setCoverUrl('');
  };

  const saveSmartLink = async () => {
    if (!slug) {
      showError('Вкажіть адресу посилання');
      return;
    }

    setIsSaving(true);
    try {
      const existing = smartLinks.find(l => l.releaseId === selectedRelease.id);
      const linkData = {
        releaseId: selectedRelease.id,
        slug,
        title: selectedRelease.title,
        artist: selectedRelease.artist,
        coverUrl,
        avatarLocal,
        platforms: platforms.filter(p => p.url.trim() !== '')
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

      {/* Smart Link Modal with ImageUploader */}
      <Dialog open={isSmartLinkModalOpen} onOpenChange={setIsSmartLinkModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Налаштування Смартлінка</DialogTitle>
            <DialogDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Створіть єдину сторінку для всіх стрімінгових платформ
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 py-6">
            {/* Using ImageUploader for Smart Link cover */}
            <ImageUploader 
              bucket="smartlinks"
              userId={user?.id || ''}
              entityType="smartlinks"
              currentUrl={avatarLocal || coverUrl}
              onUpload={handleCoverUpload}
              onDelete={handleCoverDelete}
              label="Обкладинка смартлінка"
              className="max-w-sm mx-auto"
              aspectRatio="square"
            />

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Персональна адреса (URL Slug)</Label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 h-12">
                <span className="text-zinc-600 text-xs font-mono">/s/</span>
                <input 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="bg-transparent border-none focus:ring-0 text-white text-xs font-mono flex-1"
                  placeholder="назва-релізу"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на платформи</Label>
              <div className="grid grid-cols-1 gap-3">
                {platforms.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 group">
                    <div className="w-8 h-8 flex items-center justify-center text-zinc-500 group-hover:text-red-700 transition-colors">
                      <Music size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{p.name}</p>
                      <Input 
                        value={p.url} 
                        onChange={(e) => {
                          const newPlatforms = [...platforms];
                          newPlatforms[idx].url = e.target.value;
                          setPlatforms(newPlatforms);
                        }}
                        className="bg-transparent border-none h-6 p-0 text-xs focus:ring-0 text-white placeholder:text-zinc-800"
                        placeholder="Вставте посилання..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsSmartLinkModalOpen(false)} className="rounded-none text-[10px] font-black uppercase tracking-widest">Скасувати</Button>
            <Button 
              onClick={saveSmartLink}
              disabled={isSaving}
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