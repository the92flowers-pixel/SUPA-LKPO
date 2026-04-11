import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Music, 
  Star, 
  ArrowUpRight, 
  PlayCircle,
  Info,
  Calendar,
  Tag,
  User as UserIcon,
  ExternalLink,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDataStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#d8b4fe', '#c084fc'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const { releases } = useDataStore();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  // Filter releases for the current user
  const userReleases = useMemo(() => 
    releases.filter(r => r.userId === user?.id), 
    [releases, user]
  );

  // Calculate KPI stats
  const totalStreams = useMemo(() => 
    userReleases.reduce((acc, r) => acc + r.streams, 0), 
    [userReleases]
  );

  const topRelease = useMemo(() => {
    if (userReleases.length === 0) return null;
    return [...userReleases].sort((a, b) => b.streams - a.streams)[0];
  }, [userReleases]);

  // Prepare chart data (mocking time series based on current streams for visual effect)
  const lineData = useMemo(() => [
    { name: '01.05', streams: Math.floor(totalStreams * 0.1) },
    { name: '05.05', streams: Math.floor(totalStreams * 0.3) },
    { name: '10.05', streams: Math.floor(totalStreams * 0.2) },
    { name: '15.05', streams: Math.floor(totalStreams * 0.5) },
    { name: '20.05', streams: Math.floor(totalStreams * 0.7) },
    { name: '25.05', streams: Math.floor(totalStreams * 0.6) },
    { name: '30.05', streams: totalStreams },
  ], [totalStreams]);

  const pieData = useMemo(() => {
    if (userReleases.length === 0) return [];
    const top4 = [...userReleases]
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 4)
      .map(r => ({ name: r.title, value: r.streams }));
    
    const othersValue = userReleases.length > 4 
      ? userReleases.slice(4).reduce((acc, r) => acc + r.streams, 0)
      : 0;

    if (othersValue > 0) {
      top4.push({ name: 'Інше', value: othersValue });
    }

    // Convert to percentages for the legend
    const total = top4.reduce((acc, item) => acc + item.value, 0) || 1;
    return top4.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }, [userReleases]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Дашборд</h1>
          <p className="text-slate-400 mt-1">Огляд вашої музичної діяльності</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 border-violet-500/30 text-violet-400 font-bold">
          Травень 2024
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a1a] border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Всього стрімів</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{totalStreams.toLocaleString()}</div>
            <p className="text-xs text-green-400 flex items-center mt-2 font-bold">
              <ArrowUpRight size={14} className="mr-1" />
              +12.5% від минулого місяця
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Активних релізів</CardTitle>
            <Music className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{userReleases.length}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Всі платформи доступні</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Топ реліз</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white truncate">
              {topRelease ? topRelease.title : 'Немає даних'}
            </div>
            <p className="text-xs text-violet-400 mt-2 font-bold">
              {topRelease ? `${topRelease.streams.toLocaleString()} прослуховувань` : 'Завантажте свій перший трек'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Динаміка прослуховувань</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="streams" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#1a1a1a' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Розподіл за релізами</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 pr-8 min-w-[140px]">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">
                        {item.name} <span className="text-slate-500 ml-1">{item.percentage}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full text-center text-slate-500 text-sm">Немає даних для відображення</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Releases Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Останні релізи</h2>
          <Button variant="link" className="text-violet-400 font-bold hover:text-violet-300" onClick={() => window.location.href = '/releases'}>Всі релізи</Button>
        </div>
        
        {userReleases.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-dashed border-white/10">
            <Music className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-white">У вас ще немає релізів</h3>
            <Button className="mt-4 bg-violet-600" onClick={() => window.location.href = '/new-release'}>Створити перший реліз</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReleases.slice(0, 3).map((track) => (
              <Card 
                key={track.id} 
                className="bg-[#1a1a1a] border-white/5 overflow-hidden group hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedTrack(track)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={track.coverUrl} 
                    alt={track.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <Badge className={cn(
                    "absolute top-3 right-3 border-none font-bold",
                    track.status === 'Опубліковано' ? "bg-green-500 text-white" : "bg-amber-500 text-black"
                  )}>
                    {track.status === 'Опубліковано' ? track.status : <><Clock size={12} className="mr-1" /> {track.status}</>}
                  </Badge>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-bold text-lg leading-tight">{track.title}</h3>
                    <p className="text-slate-300 text-sm font-medium">{track.artist}</p>
                  </div>
                </div>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Tag size={14} className="text-violet-500" /> {track.genre}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} className="text-violet-500" /> {track.releaseDate}</span>
                  </div>
                  <div className="text-violet-400 font-black text-sm">
                    {track.streams.toLocaleString()} <span className="text-[10px] text-slate-600 uppercase">Streams</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Track Details Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-white">
              <Music className="text-violet-500" />
              Деталі релізу
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Повна інформація про ваш трек та статус дистрибуції
            </DialogDescription>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-6">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                  <img src={selectedTrack.coverUrl} alt={selectedTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5 space-y-3">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Аудіо-прев'ю</p>
                  <div className="flex items-center gap-4">
                    <Button size="icon" className="rounded-full bg-violet-600 hover:bg-violet-700">
                      <PlayCircle size={24} />
                    </Button>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-violet-500" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">0:45 / 3:20</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <UserIcon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Артист</p>
                      <p className="font-bold text-white">{selectedTrack.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <Tag size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Жанр</p>
                      <p className="font-bold text-white">{selectedTrack.genre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Дата релізу</p>
                      <p className="font-bold text-white">{selectedTrack.date || selectedTrack.releaseDate}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Статус</span>
                    <Badge className={cn(
                      "font-bold border-none",
                      selectedTrack.status === 'Опубліковано' ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {selectedTrack.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Всього стрімів</span>
                    <span className="font-black text-violet-400 text-lg">{selectedTrack.streams.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">External ID</span>
                    <span className="text-xs font-mono text-slate-500">ZH-MOD-{selectedTrack.id}</span>
                  </div>
                </div>

                <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold">
                  <ExternalLink size={16} className="mr-2" />
                  Переглянути на платформах
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;