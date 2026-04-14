"use client";

import React, { useState } from 'react';
import { Check, X, Play, Music, Info, Calendar, Tag, User, Clock, Loader2 } from 'lucide-react';
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
import { showSuccess, showError } from '@/utils/toast';

const Moderation = () => {
  const { releases, updateReleaseStatus, statuses, fields } = useDataStore();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';
  const pendingReleases = releases.filter(r => r.status === defaultStatus);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' 
      ? (statuses.find(s => s.color === 'green')?.name || 'Опубліковано')
      : (statuses.find(s => s.color === 'red')?.name || 'Відхилено');
    
    setIsProcessing(id);
    try {
      await updateReleaseStatus(id, newStatus);
      showSuccess(`Реліз ${action === 'approve' ? 'схвалено' : 'відхилено'}`);
      setSelectedTrack(null);
    } catch (error: any) {
      showError(error.message || "Помилка при оновленні статусу");
    } finally {
      setIsProcessing(null);
    }
  };

  const releaseFields = fields.filter(f => f.section === 'release');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Черга модерації</h1>
        <p className="text-slate-400 mt-1">Перевірка нових релізів від артистів ({pendingReleases.length})</p>
      </div>

      {pendingReleases.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-dashed border-white/10">
          <Clock className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white">Черга порожня</h3>
          <p className="text-gray-500 mt-2">Наразі немає релізів, що потребують перевірки.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingReleases.map((track) => (
            <Card key={track.id} className="bg-[#1a1a1a] border-white/5 overflow-hidden flex flex-col group hover:border-violet-500/30 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={track.cover_image_url || track.coverUrl} 
                  alt={track.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <Badge className="absolute top-3 right-3 bg-amber-500 text-black border-none font-bold">
                  <Clock size={12} className="mr-1" /> Очікує
                </Badge>
              </div>
              
              <CardContent className="p-5 flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white truncate">{track.title}</h3>
                  <p className="text-violet-400 font-medium text-sm">{track.artist}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Tag size={14} /> {track.genre}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={14} /> {track.release_date || track.releaseDate}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white"
                  onClick={() => setSelectedTrack(track)}
                >
                  <Info size={16} className="mr-2" /> Деталі
                </Button>
                <div className="flex gap-2">
                  <Button 
                    disabled={isProcessing === track.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(track.id, 'approve')}
                  >
                    {isProcessing === track.id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  </Button>
                  <Button 
                    disabled={isProcessing === track.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleAction(track.id, 'reject')}
                  >
                    {isProcessing === track.id ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Перевірка релізу</DialogTitle>
            <DialogDescription className="text-slate-400">
              Ретельно перевірте всі дані перед публікацією
            </DialogDescription>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                  <img src={selectedTrack.cover_image_url || selectedTrack.coverUrl} alt={selectedTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5 space-y-4">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Аудіофайл</p>
                  <div className="flex items-center gap-4">
                    <Button size="icon" className="rounded-full bg-violet-600 hover:bg-violet-700" onClick={() => window.open(selectedTrack.audio_file_url || selectedTrack.audioUrl, '_blank')}>
                      <Play size={20} />
                    </Button>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-violet-500" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">Прев'ю</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-4">
                  {releaseFields.map(field => (
                    <div key={field.id} className="space-y-1 border-b border-white/5 pb-2">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{field.label}</p>
                      <p className="font-medium text-white">{selectedTrack[field.name] || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTrack(null)} className="border-white/10 text-white">
              Скасувати
            </Button>
            <Button 
              variant="destructive" 
              disabled={isProcessing === selectedTrack?.id}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction(selectedTrack?.id, 'reject')}
            >
              {isProcessing === selectedTrack?.id ? <Loader2 className="animate-spin mr-2" size={18} /> : <X size={18} className="mr-2" />} Відхилити
            </Button>
            <Button 
              disabled={isProcessing === selectedTrack?.id}
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction(selectedTrack?.id, 'approve')}
            >
              {isProcessing === selectedTrack?.id ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check size={18} className="mr-2" />} Схвалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Moderation;