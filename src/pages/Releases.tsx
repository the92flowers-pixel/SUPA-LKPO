import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Play, Info, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Releases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { releases } = useDataStore();

  const userReleases = releases.filter(r => r.userId === user?.id);
  const filteredReleases = userReleases.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Каталог</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування вашою спадщиною</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <Input 
              placeholder="Пошук у темряві..." 
              className="pl-12 bg-black/40 border-white/5 text-white rounded-none h-12 focus:border-red-900/50 transition-all" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <Button variant="outline" className="border-white/5 text-zinc-400 rounded-none h-12 px-6 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest">
            <Filter size={14} className="mr-2" />
            Фільтр
          </Button>
        </div>
      </div>

      {filteredReleases.length === 0 ? (
        <div className="text-center py-32 bg-black/20 rounded-none border border-dashed border-white/5">
          <Music className="mx-auto text-zinc-800 mb-6" size={64} />
          <h3 className="text-xl font-black text-zinc-500 uppercase tracking-widest">Порожнеча</h3>
          <p className="text-zinc-700 mt-2 text-xs uppercase font-bold tracking-tighter">Ви ще не створили жодного релізу</p>
          <Button 
            className="mt-8 bg-red-900/20 text-red-500 border border-red-900/30 hover:bg-red-900/40 rounded-none px-10"
            onClick={() => navigate('/new-release')}
          >
            Створити перший реліз
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredReleases.map((release) => (
            <Card key={release.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden group hover:border-red-900/30 transition-all duration-500 shadow-2xl">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={release.coverUrl} 
                  alt={release.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0" 
                />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                  <Button size="icon" className="rounded-none bg-red-700 hover:bg-red-800 shadow-[0_0_20px_rgba(185,28,28,0.4)]">
                    <Play size={20} fill="currentColor" />
                  </Button>
                </div>
                <Badge className={cn(
                  "absolute top-4 right-4 border-none rounded-none px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                  release.status === 'Опубліковано' ? "bg-green-900/20 text-green-500" : "bg-red-900/20 text-red-500"
                )}>
                  {release.status}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="overflow-hidden">
                    <h3 className="font-black truncate text-white text-sm uppercase tracking-wider">{release.title}</h3>
                    <p className="text-[10px] text-zinc-600 truncate mt-1 font-bold uppercase tracking-widest">
                      {release.genre} • {release.releaseDate}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 hover:text-white">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/5 text-white rounded-none shadow-2xl">
                      <DropdownMenuItem className="cursor-pointer text-[10px] font-bold uppercase tracking-widest py-3">
                        <Info size={14} className="mr-3 text-red-700" /> Деталі
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em]">Стріми</span>
                  <span className="text-xs font-black text-red-700 tracking-tighter">{release.streams.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Releases;