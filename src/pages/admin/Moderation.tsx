import React, { useState } from 'react';
import { Check, X, Play, Music, Info, Calendar, Tag, User, Clock } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-white">Черга модерації</h1>
        <p className="text-slate-400 mt-1">Перевірка нових релізів від артистів</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <Card key={track.id} className="bg-[#1a1a1a] border-white/5 overflow-hidden flex flex-col group hover:border-violet-500/30 transition-all duration-300">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={track.coverUrl} 
                alt={track.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
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
                  <Calendar size={14} /> {track.date}
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAction(track.id, 'approve')}
                >
                  <Check size={18} />
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleAction(track.id, 'reject')}
                >
                  <X size={18} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Moderation Detail Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Перевірка релізу</DialogTitle>
            <DialogDescription className="text-slate-400">
              Ретельно перевірте всі дані перед публікацією на стрімінгові платформи
            </DialogDescription>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                  <img src={selectedTrack.coverUrl} alt={selectedTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5 space-y-4">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Аудіофайл</p>
                  <div className="flex items-center gap-4">
                    <Button size="icon" className="rounded-full bg-violet-600 hover:bg-violet-700">
                      <Play size={20} />
                    </Button>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-violet-500" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">0:45 / 3:12</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><User size={12} /> Артист</p>
                    <p className="font-medium text-white">{selectedTrack.artist}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Tag size={12} /> Жанр</p>
                    <p className="font-medium text-white">{selectedTrack.genre}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> Дата</p>
                    <p className="font-medium text-white">{selectedTrack.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Music size={12} /> Тип</p>
                    <p className="font-medium text-white">Single</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">UPC</span>
                    <span className="font-mono text-slate-200">{selectedTrack.upc}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">ISRC</span>
                    <span className="font-mono text-slate-200">{selectedTrack.isrc}</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-500 font-bold mb-2 uppercase tracking-wider">Нотатка модератора</p>
                  <textarea 
                    className="w-full bg-transparent border-none text-sm text-slate-300 focus:ring-0 p-0 resize-none h-20 placeholder:text-slate-600"
                    placeholder="Додайте коментар для артиста (у разі відхилення)..."
                  />
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
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction(selectedTrack.id, 'reject')}
            >
              <X size={18} className="mr-2" /> Відхилити
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
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