import React, { useState, useEffect } from 'react';
import { Check, X, Music, Info, User, Clock, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const Moderation = () => {
  const { releases, updateReleaseStatus, statuses, fetchReleases, users, fetchUsers } = useDataStore();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReleases();
    fetchUsers();
  }, [fetchReleases, fetchUsers]);

  const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';
  const publishedStatus = statuses.find(s => s.color === 'green')?.name || 'Опубліковано';
  const rejectedStatus = statuses.find(s => s.color === 'red')?.name || 'Відхилено';

  const pendingReleases = releases.filter(r => r.status === defaultStatus);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!selectedTrack) return;
    
    setIsLoading(true);
    try {
      const newStatus = action === 'approve' ? publishedStatus : rejectedStatus;
      await updateReleaseStatus(id, newStatus);
      showSuccess(`Реліз ${action === 'approve' ? 'схвалено та опубліковано' : 'відхилено'}`);
      setSelectedTrack(null);
      setModeratorNote('');
    } catch (error) {
      showError('Помилка при оновленні статусу');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.artistName || user?.login || 'Невідомий';
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Модерація</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Перевірка нових релізів ({pendingReleases.length})</p>
        </div>
        <Button 
          onClick={() => fetchReleases()} 
          variant="outline" 
          className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none"
        >
          <RefreshCw size={14} className="mr-2" /> Оновити
        </Button>
      </div>

      {pendingReleases.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Черга пуста</h3>
          <p className="text-zinc-600 mt-2 text-xs font-bold uppercase tracking-widest">
            Наразі немає релізів, що потребують перевірки
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pendingReleases.map((track) => (
            <Card key={track.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={track.coverUrl || FALLBACK_IMAGE} 
                  alt={track.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-500/20 text-amber-500 border-none text-[9px] font-black uppercase tracking-widest rounded-none">
                    <Clock size={10} className="mr-1" /> На модерації
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">{track.title}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{track.artist}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <User size={14} /> {getUserName(track.userId)}
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest">{track.genre || 'Другое'}</div>
                </div>

                {track.performer && (
                  <div className="text-xs text-zinc-600">
                    <span className="text-[9px] uppercase font-black tracking-widest">Виконавець: </span>
                    {track.performer}
                  </div>
                )}

                {track.releaseUrl && (
                  <div className="p-3 bg-white/5 border border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Посилання</p>
                    <a 
                      href={track.releaseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-red-500 hover:text-red-400 underline flex items-center gap-1"
                    >
                      <ExternalLink size={10} />
                      Переглянути
                    </a>
                  </div>
                )}

                {track.streams > 0 && (
                  <div className="p-3 bg-white/5 border border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Стріми</p>
                    <p className="text-sm font-black text-red-700">{track.streams.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-6 pt-0 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white rounded-none text-[10px] font-black uppercase tracking-widest"
                  onClick={() => {
                    setSelectedTrack(track);
                    setModeratorNote('');
                  }}
                >
                  <Info size={14} className="mr-2" /> Деталі
                </Button>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-none"
                    onClick={() => handleAction(track.id, 'approve')}
                  >
                    <Check size={16} />
                  </Button>
                  <Button 
                    className="flex-1 bg-red-900 hover:bg-red-800 text-white rounded-none"
                    onClick={() => handleAction(track.id, 'reject')}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Moderation Detail Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter">Перевірка релізу</DialogTitle>
                <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                  ID: {selectedTrack?.id?.slice(0, 8)}
                </DialogDescription>
              </div>
              <Badge className="bg-amber-500/20 text-amber-500 border-none text-[10px] font-black uppercase tracking-widest rounded-none">
                <Clock size={12} className="mr-1" /> На модерації
              </Badge>
            </div>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="aspect-square rounded-none overflow-hidden border border-white/5 shadow-2xl">
                  <img 
                    src={selectedTrack.coverUrl || FALLBACK_IMAGE} 
                    alt={selectedTrack.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </div>
                
                <div className="p-4 bg-white/5 border border-white/5 rounded-none">
                  <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">Інформація</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase">Артист</p>
                      <p className="text-sm font-bold text-white">{selectedTrack.artist}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase">Виконавець</p>
                      <p className="text-sm font-bold text-white">{selectedTrack.performer || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase">Композитор</p>
                      <p className="text-sm font-bold text-white">{selectedTrack.composer || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase">Жанр</p>
                      <p className="text-sm font-bold text-white">{selectedTrack.genre || 'Другое'}</p>
                    </div>
                  </div>
                </div>

                {selectedTrack.releaseUrl && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-none">
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Посилання на реліз</p>
                    <a 
                      href={selectedTrack.releaseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-red-500 hover:text-red-400 underline break-all flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      {selectedTrack.releaseUrl}
                    </a>
                  </div>
                )}

                <div className="p-4 bg-white/5 border border-white/5 rounded-none">
                  <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Користувач</p>
                  <p className="text-sm font-bold text-white">{getUserName(selectedTrack.userId)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1 border-b border-white/5 pb-4">
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Назва</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight">{selectedTrack.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Дата релізу</p>
                    <p className="text-sm font-bold text-white">{selectedTrack.releaseDate || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Лейбл</p>
                    <p className="text-sm font-bold text-white">{selectedTrack.label || '—'}</p>
                  </div>
                </div>

                {selectedTrack.isrc && (
                  <div className="space-y-1 border-b border-white/5 pb-4">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">ISRC</p>
                    <p className="text-sm font-bold text-white font-mono">{selectedTrack.isrc}</p>
                  </div>
                )}

                {selectedTrack.description && (
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Опис</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{selectedTrack.description}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                    Нотатка модератора
                  </label>
                  <Textarea 
                    value={moderatorNote}
                    onChange={(e) => setModeratorNote(e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none min-h-[80px] text-xs focus:ring-0 focus:border-red-700"
                    placeholder="Додайте коментар для артиста (опціонально)..."
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTrack(null)} 
              className="border-white/10 text-white rounded-none text-[10px] font-black uppercase tracking-widest h-12"
            >
              Скасувати
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction(selectedTrack?.id, 'reject')}
              disabled={isLoading}
              className="bg-red-900 hover:bg-red-800 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-8 h-12"
            >
              <X size={16} className="mr-2" /> Відхилити
            </Button>
            <Button 
              onClick={() => handleAction(selectedTrack?.id, 'approve')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-8 h-12"
            >
              <Check size={16} className="mr-2" /> Схвалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Moderation;