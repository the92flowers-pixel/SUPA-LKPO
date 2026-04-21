import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Info,
  Calendar,
  Hash,
  FileAudio,
  ShieldCheck,
  User,
  Clock
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { releases, smartLinks, addSmartLink, updateSmartLink, updateReleaseStatus, statuses, fields } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [isSmartLinkModalOpen, setIsSmartLinkModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingRelease, setViewingRelease] = useState<any>(null);
  
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

  const releaseFields = fields.filter(f => f.section === 'release');

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

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей реліз? Статус буде змінено на "Видаляється", і адміністратор отримає запит.')) return;
    try {
      await updateReleaseStatus(id, 'Видаляється');
      showSuccess('Запит на видалення відправлено');
    } catch (error) {
      showError('Помилка при відправці запиту');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Посилання скопійовано');
  };

  const getStatusColor = (statusName: string) => {
    if (statusName === 'Видаляється') return 'bg-red-900/20 text-red-500 border-red-900/30';
    
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

  const handleViewDetails = (release: any) => {
    setViewingRelease(release);
    setIsDetailsModalOpen(true);
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
          const isDeleting = release.status === 'Видаляється';
          const isRejected = statuses.find(s => s.name === release.status)?.color === 'red';

          return (
            <Card key={release.id} className={cn(
              "bg-black/40 border-white/5 rounded-none overflow-hidden flex flex-col group hover:border-red-700/30 transition-all duration-500",
              isDeleting && "opacity-60 grayscale"
            )}>
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
                {!isDeleting && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black rounded-none text-[10px] font-black uppercase tracking-widest"
                      onClick={() => handleViewDetails(release)}
                    >
                      <Info size={14} className="mr-2" /> Деталі
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black rounded-none text-[10px] font-black uppercase tracking-widest"
                      onClick={() => handleCreateSmartLink(release)}
                    >
                      <Link2 size={14} className="mr-2" /> {hasSmartLink ? 'Смартлінк' : 'Створити лінк'}
                    </Button>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">{release.title}</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{release.artist}</p>
                  </div>
                  {!isDeleting && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white h-8 w-8">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                        <DropdownMenuItem 
                          className="text-[10px] font-black uppercase tracking-widest focus:bg-red-900/20 focus:text-red-500 cursor-pointer"
                          onClick={() => navigate(`/edit-release/${release.id}`)}
                        >
                          <Edit2 size={14} className="mr-2" /> Редагувати
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-[10px] font-black uppercase tracking-widest text-red-900 focus:bg-red-900/20 focus:text-red-500 cursor-pointer"
                          onClick={() => handleDeleteRequest(release.id)}
                        >
                          <Trash2 size={14} className="mr-2" /> Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {isRejected && release.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-900/10 border border-red-900/20">
                    <p className="text-[8px] font-black uppercase text-red-700 mb-1">Зауваження модератора:</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{release.rejection_reason}</p>
                  </div>
                )}

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

                {hasSmartLink && !isDeleting && (
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

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-none p-0">
          {viewingRelease && (
            <div className="flex flex-col">
              <div className="relative h-48 sm:h-64 overflow-hidden">
                <img 
                  src={viewingRelease.coverImageLocal || viewingRelease.coverUrl || FALLBACK_IMAGE} 
                  className="w-full h-full object-cover blur-xl opacity-30 scale-110" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 shadow-2xl border border-white/10">
                    <img 
                      src={viewingRelease.coverImageLocal || viewingRelease.coverUrl || FALLBACK_IMAGE} 
                      className="w-full h-full object-cover" 
                      alt={viewingRelease.title} 
                    />
                  </div>
                  <div className="pb-2">
                    <Badge className={cn("mb-3 border-none text-[9px] font-black uppercase tracking-widest rounded-none", getStatusColor(viewingRelease.status))}>
                      {viewingRelease.status}
                    </Badge>
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none">{viewingRelease.title}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">{viewingRelease.artist}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Жанр</p>
                      <p className="text-xs font-bold text-white uppercase">{viewingRelease.genre}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Дата виходу</p>
                      <p className="text-xs font-bold text-white uppercase">{new Date(viewingRelease.releaseDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Лейбл</p>
                      <p className="text-xs font-bold text-white uppercase">{viewingRelease.label || 'ЖУРБА MUSIC'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 flex items-center gap-2">
                      <Music size={14} /> Трекліст та Метадані
                    </h4>
                    <div className="space-y-4">
                      {viewingRelease.tracks?.map((track: any, idx: number) => (
                        <div key={idx} className="p-5 bg-white/5 border border-white/5 space-y-4 group hover:bg-white/[0.07] transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-zinc-700">{idx + 1}</span>
                              <span className="text-sm font-black text-white uppercase tracking-wider">{track.title}</span>
                            </div>
                            {track.explicit && <Badge variant="outline" className="text-[8px] border-red-900/30 text-red-700 uppercase font-black">Explicit</Badge>}
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-1"><User size={10} /> Артист</p>
                              <p className="text-[10px] font-bold text-zinc-300 uppercase">{track.artist || viewingRelease.artist}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-1"><FileAudio size={10} /> Файл</p>
                              <p className="text-[10px] font-mono text-zinc-400 truncate">{track.fileName || '—'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-1"><Clock size={10} /> Preview</p>
                              <p className="text-[10px] font-bold text-zinc-300">{track.previewStart || '0'} сек</p>
                            </div>
                            <div className="space-y-1 col-span-2 sm:col-span-1">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Композитор</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">{track.composer || '—'}</p>
                            </div>
                            <div className="space-y-1 col-span-2">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Автор тексту</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">{track.lyricist || '—'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Fields Display */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Додаткова інформація</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {releaseFields.map(field => (
                        <div key={field.id} className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">{field.label}</p>
                          <p className="text-xs font-bold text-zinc-300">{viewingRelease[field.name] || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-white/5 border border-white/5 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <Hash size={16} />
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase tracking-widest">UPC</p>
                          <p className="text-[10px] font-mono text-white">{viewingRelease.upc || 'Очікується...'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500">
                        <Hash size={16} />
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase tracking-widest">ISRC</p>
                          <p className="text-[10px] font-mono text-white">{viewingRelease.isrc || 'Очікується...'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-4">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <ShieldCheck size={16} className="text-green-600" />
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase tracking-widest">Авторські права</p>
                          <p className="text-[10px] font-bold text-white uppercase">Підтверджено</p>
                        </div>
                      </div>
                      {viewingRelease.releaseUrl && (
                        <Button 
                          variant="outline" 
                          className="w-full border-white/10 text-[9px] font-black uppercase tracking-widest h-10 rounded-none"
                          onClick={() => window.open(viewingRelease.releaseUrl, '_blank')}
                        >
                          <ExternalLink size={12} className="mr-2" /> Файли релізу
                        </Button>
                      )}
                    </div>
                  </div>

                  {viewingRelease.description && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Опис</p>
                      <p className="text-xs text-zinc-400 leading-relaxed italic">{viewingRelease.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-8 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-none"
                >
                  Закрити
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Smart Link Modal */}
      <Dialog open={isSmartLinkModalOpen} onOpenChange={setIsSmartLinkModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Налаштування Смартлінка</DialogTitle>
            <DialogDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Створіть єдину сторінку для всіх стрімінгових платформ
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 py-6">
            <ImageUploader 
              bucket="smartlinks"
              path={`smartlinks/${user?.id}`}
              currentLocalUrl={avatarLocal}
              currentExternalUrl={coverUrl}
              onUpload={(url) => setAvatarLocal(url)}
              onExternalUrlChange={(url) => setCoverUrl(url)}
              onRemove={() => setAvatarLocal('')}
              label="Обкладинка смартлінка"
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