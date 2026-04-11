import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Plus, History, Search, Calendar as CalendarIcon, User, Music, Check, ChevronsUpDown } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const months = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

const Statistics = () => {
  const { releases, users, updateReleaseStreams } = useDataStore();
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [artistOpen, setArtistOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  
  const { register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      count: '',
      month: (new Date().getMonth()).toString(),
      year: new Date().getFullYear().toString()
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Get unique artists who have releases
  const artists = useMemo(() => {
    const artistIds = new Set(releases.map(r => r.userId));
    return users.filter(u => artistIds.has(u.id));
  }, [users, releases]);

  // Filter tracks based on selected artist
  const artistTracks = useMemo(() => {
    if (!selectedArtistId) return [];
    return releases.filter(r => r.userId === selectedArtistId && r.status === 'Опубліковано');
  }, [selectedArtistId, releases]);

  const onSubmit = (data: any) => {
    if (!selectedTrackId) {
      showError('Будь ласка, оберіть трек');
      return;
    }
    
    const count = parseInt(data.count);
    const dateStr = `${data.year}-${(parseInt(data.month) + 1).toString().padStart(2, '0')}-01`;
    
    // Update streams
    updateReleaseStreams(selectedTrackId, count, dateStr);
    
    showSuccess('Статистику успішно оновлено!');
    reset({ 
      count: '',
      month: data.month,
      year: data.year 
    });
    setSelectedTrackId("");
  };

  const filteredReleases = releases.filter(r => 
    r.status === 'Опубліковано' && (
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Керування статистикою</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Оновлення даних про прослуховування</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-1 bg-black/40 border-white/5 rounded-none shadow-2xl h-fit">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
              <Plus size={18} className="text-red-700" />
              Додати дані
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Артист</Label>
                <Popover open={artistOpen} onOpenChange={setArtistOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-black/40 border-white/5 rounded-none h-12 text-white hover:bg-white/5"
                    >
                      {selectedArtistId
                        ? artists.find((a) => a.id === selectedArtistId)?.artistName || artists.find((a) => a.id === selectedArtistId)?.login
                        : "Пошук артиста..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-[#0a0a0a] border-white/5 rounded-none">
                    <Command className="bg-transparent text-white">
                      <CommandInput placeholder="Введіть ім'я..." className="h-12 border-none focus:ring-0" />
                      <CommandList>
                        <CommandEmpty className="p-4 text-xs text-zinc-600 uppercase font-bold">Артиста не знайдено</CommandEmpty>
                        <CommandGroup>
                          {artists.map((artist) => (
                            <CommandItem
                              key={artist.id}
                              value={artist.artistName || artist.login}
                              onSelect={() => {
                                setSelectedArtistId(artist.id);
                                setSelectedTrackId("");
                                setArtistOpen(false);
                              }}
                              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-red-900/10"
                            >
                              <Check className={cn("h-4 w-4 text-red-700", selectedArtistId === artist.id ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase tracking-widest">{artist.artistName || artist.login}</span>
                                <span className="text-[9px] text-zinc-600 font-mono">{artist.login}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Трек</Label>
                <Popover open={trackOpen} onOpenChange={setTrackOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={!selectedArtistId}
                      className="w-full justify-between bg-black/40 border-white/5 rounded-none h-12 text-white hover:bg-white/5 disabled:opacity-30"
                    >
                      {selectedTrackId
                        ? artistTracks.find((t) => t.id === selectedTrackId)?.title
                        : "Оберіть трек..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-[#0a0a0a] border-white/5 rounded-none">
                    <Command className="bg-transparent text-white">
                      <CommandInput placeholder="Назва треку..." className="h-12 border-none focus:ring-0" />
                      <CommandList>
                        <CommandEmpty className="p-4 text-xs text-zinc-600 uppercase font-bold">Треків не знайдено</CommandEmpty>
                        <CommandGroup>
                          {artistTracks.map((track) => (
                            <CommandItem
                              key={track.id}
                              value={track.title}
                              onSelect={() => {
                                setSelectedTrackId(track.id);
                                setTrackOpen(false);
                              }}
                              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-red-900/10"
                            >
                              <Check className={cn("h-4 w-4 text-red-700", selectedTrackId === track.id ? "opacity-100" : "opacity-0")} />
                              <span className="text-xs font-bold uppercase tracking-widest">{track.title}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Місяць</Label>
                  <Select onValueChange={(v) => setValue('month', v)} defaultValue={watch('month')}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {months.map((m, i) => (
                        <SelectItem key={i} value={i.toString()} className="focus:bg-red-900/20 focus:text-red-500">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Рік</Label>
                  <Select onValueChange={(v) => setValue('year', v)} defaultValue={watch('year')}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {years.map(y => (
                        <SelectItem key={y} value={y} className="focus:bg-red-900/20 focus:text-red-500">{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="count" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Кількість нових стрімів</Label>
                <Input 
                  id="count" 
                  type="number" 
                  {...register('count', { required: true })} 
                  className="bg-black/40 border-white/5 rounded-none h-12 text-white"
                  placeholder="0"
                />
              </div>

              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest h-14 rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]">
                Оновити дані
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
              <History size={18} className="text-red-700" />
              Поточні показники
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <Input 
                placeholder="Пошук..." 
                className="bg-black/40 border-white/5 pl-10 h-10 text-[10px] font-bold uppercase tracking-widest rounded-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Трек</th>
                  <th className="px-8 py-5">Артист</th>
                  <th className="px-8 py-5">Останнє оновлення</th>
                  <th className="px-8 py-5 text-right">Всього стрімів</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReleases.length > 0 ? (
                  filteredReleases.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 text-xs font-bold text-white uppercase tracking-wider">{r.title}</td>
                      <td className="px-8 py-6 text-[10px] font-black text-red-800 uppercase tracking-widest">{r.artist}</td>
                      <td className="px-8 py-6 text-[10px] text-zinc-600 font-mono">
                        {r.history.length > 0 ? r.history[r.history.length - 1].date : '—'}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-white font-black text-sm tracking-tighter">{r.streams.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest">
                      Нічого не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;