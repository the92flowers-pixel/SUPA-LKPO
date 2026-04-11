import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Play, Info, ExternalLink, Music, Link as LinkIcon } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Мої релізи</h1>
          <p className="text-gray-500">Керування вашим музичним каталогом</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input placeholder="Пошук релізу..." className="pl-10 bg-[#1a1a1a] border-white/10 text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="outline" className="border-white/10 text-white"><Filter size={18} className="mr-2" />Фільтри</Button>
        </div>
      </div>

      {filteredReleases.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-dashed border-white/10">
          <Music className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white">У вас ще немає релізів</h3>
          <p className="text-gray-500 mt-2">Створіть свій перший реліз, щоб почати дистрибуцію.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReleases.map((release) => (
            <Card key={release.id} className="bg-[#1a1a1a] border-white/5 overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button size="icon" className="rounded-full bg-violet-600"><Play size={20} /></Button>
                  <Button size="icon" variant="outline" className="rounded-full border-white/20" onClick={() => navigate(`/s/${release.id}`)}><LinkIcon size={20} /></Button>
                </div>
                <Badge className={cn("absolute top-3 right-3 border-none", release.status === 'Опубліковано' ? "bg-green-500 text-white" : "bg-yellow-500 text-black")}>{release.status}</Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate text-white">{release.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{release.genre} • {release.releaseDate}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white"><MoreVertical size={16} /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/s/${release.id}`)}><ExternalLink size={14} className="mr-2" /> Смарт-лінк</DropdownMenuItem>
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
      )}
    </div>
  );
};

export default Releases;