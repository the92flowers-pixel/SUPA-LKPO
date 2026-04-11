import React, { useState } from 'react';
import { Music, Search, Filter, MoreVertical, Play, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Releases = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const releases = [
    { 
      id: 1, 
      title: 'Нічна варта', 
      artist: 'Артист', 
      genre: 'Hip-Hop', 
      date: '12.05.2024', 
      status: 'Опубліковано',
      streams: 5201,
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'
    },
    { 
      id: 2, 
      title: 'Світанок', 
      artist: 'Артист', 
      genre: 'Pop', 
      date: '14.05.2024', 
      status: 'На модерації',
      streams: 850,
      coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop'
    },
    { 
      id: 3, 
      title: 'Журба', 
      artist: 'Артист', 
      genre: 'Sad Rap', 
      date: '15.05.2024', 
      status: 'На модерації',
      streams: 2100,
      coverUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop'
    },
    { 
      id: 4, 
      title: 'Останній трамвай', 
      artist: 'Артист', 
      genre: 'Rock', 
      date: '01.04.2024', 
      status: 'Опубліковано',
      streams: 12400,
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
    },
  ];

  const filteredReleases = releases.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мої релізи</h1>
          <p className="text-gray-500">Керування вашим музичним каталогом</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              placeholder="Пошук релізу..." 
              className="pl-10 bg-[#1a1a1a] border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10">
            <Filter size={18} className="mr-2" />
            Фільтри
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReleases.map((release) => (
          <Card key={release.id} className="bg-[#1a1a1a] border-white/5 overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={release.coverUrl} 
                alt={release.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button size="icon" className="rounded-full bg-violet-600 hover:bg-violet-700">
                  <Play size={20} />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full border-white/20 hover:bg-white/10">
                  <Info size={20} />
                </Button>
              </div>
              <Badge className={cn(
                "absolute top-3 right-3 border-none",
                release.status === 'Опубліковано' ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
              )}>
                {release.status}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate">{release.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{release.genre} • {release.date}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                    <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                      <ExternalLink size={14} className="mr-2" /> Смарт-лінк
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                      <Info size={14} className="mr-2" /> Статистика
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Стріми</span>
                <span className="text-sm font-bold text-violet-400">{release.streams.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Releases;