import React, { useState } from 'react';
import { Check, X, Play, MoreVertical, ExternalLink, Music, Info, Calendar, Tag, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { showSuccess } from '@/utils/toast';

const Moderation = () => {
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  const tracks = [
    { 
      id: 1, 
      title: 'Нічна варта', 
      artist: 'Артист А', 
      genre: 'Hip-Hop', 
      date: '12.05.2024', 
      status: 'На модерації',
      audioUrl: '#',
      upc: '123456789012',
      isrc: 'UA-A01-24-00001',
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'
    },
    { 
      id: 2, 
      title: 'Світанок', 
      artist: 'Артист Б', 
      genre: 'Pop', 
      date: '14.05.2024', 
      status: 'На модерації',
      audioUrl: '#',
      upc: '123456789013',
      isrc: 'UA-A01-24-00002',
      coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop'
    },
    { 
      id: 3, 
      title: 'Журба', 
      artist: 'Артист В', 
      genre: 'Sad Rap', 
      date: '15.05.2024', 
      status: 'На модерації',
      audioUrl: '#',
      upc: '123456789014',
      isrc: 'UA-A01-24-00003',
      coverUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop'
    },
  ];

  const handleAction = (id: number, action: string) => {
    showSuccess(`Трек #${id} ${action === 'approve' ? 'схвалено' : 'відхилено'}`);
    setSelectedTrack(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Черга модерації</h1>
        <p className="text-gray-500">Перевірка нових релізів від артистів</p>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Реліз</th>
                <th className="px-6 py-4">Артист</th>
                <th className="px-6 py-4">Жанр</th>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center overflow-hidden border border-white/5">
                        {track.coverUrl ? (
                          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music size={20} className="text-violet-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-xs text-gray-500">ID: ZH-MOD-{track.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{track.artist}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{track.genre}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{track.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 px-3 border-white/10 hover:bg-white/5"
                        onClick={() => setSelectedTrack(track)}
                      >
                        <Info size={16} className="mr-1" /> Деталі
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 h-8 px-3"
                        onClick={() => handleAction(track.id, 'approve')}
                      >
                        <Check size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 px-3"
                        onClick={() => handleAction(track.id, 'reject')}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Moderation Detail Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Перевірка релізу</DialogTitle>
            <DialogDescription className="text-gray-500">
              Ретельно перевірте всі дані перед публікацією на стрімінгові платформи
            </DialogDescription>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/5">
                  <img src={selectedTrack.coverUrl} alt={selectedTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5 space-y-4">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Аудіофайл</p>
                  <div className="flex items-center gap-4">
                    <Button size="icon" className="rounded-full bg-violet-600">
                      <Play size={20} />
                    </Button>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-violet-500" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">0:45 / 3:12</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><User size={12} /> Артист</p>
                    <p className="font-medium">{selectedTrack.artist}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Tag size={12} /> Жанр</p>
                    <p className="font-medium">{selectedTrack.genre}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12} /> Дата</p>
                    <p className="font-medium">{selectedTrack.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Music size={12} /> Тип</p>
                    <p className="font-medium">Single</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">UPC</span>
                    <span className="font-mono">{selectedTrack.upc}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ISRC</span>
                    <span className="font-mono">{selectedTrack.isrc}</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-500 font-medium mb-1">Нотатка модератора</p>
                  <textarea 
                    className="w-full bg-transparent border-none text-sm text-gray-300 focus:ring-0 p-0 resize-none h-20"
                    placeholder="Додайте коментар для артиста (у разі відхилення)..."
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTrack(null)} className="border-white/10">
              Скасувати
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction(selectedTrack.id, 'reject')}
            >
              <X size={18} className="mr-2" /> Відхилити
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleAction(selectedTrack.id, 'approve')}
            >
              <Check size={18} className="mr-2" /> Схвалити реліз
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Moderation;