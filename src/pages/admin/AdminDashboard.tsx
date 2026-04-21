import React, { useMemo } from 'react';
import { 
  Users, 
  Music, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  BarChart3,
  Globe,
  ShieldCheck,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#ef4444', '#dc2626', '#991b1b', '#7f1d1d'];

const AdminDashboard = () => {
  const { users, releases, statuses } = useDataStore();

  const stats = useMemo(() => {
    const totalArtists = users.filter(u => u.role === 'artist').length;
    const totalReleases = releases.length;
    const totalStreams = releases.reduce((acc, r) => acc + r.streams, 0);
    
    const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';
    const pendingModeration = releases.filter(r => r.status === defaultStatus).length;
    const pendingDeletion = releases.filter(r => r.status === 'Видаляється').length;

    return { totalArtists, totalReleases, totalStreams, pendingModeration, pendingDeletion };
  }, [users, releases, statuses]);

  const chartData = useMemo(() => {
    const genreMap: Record<string, number> = {};
    releases.forEach(r => {
      genreMap[r.genre] = (genreMap[r.genre] || 0) + 1;
    });
    return Object.entries(genreMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [releases]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Глобальний огляд</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Статистика всієї платформи ЖУРБА MUSIC</p>
      </div>

      {/* Global KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Всього артистів</CardTitle>
            <Users className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter">{stats.totalArtists}</div>
            <p className="text-[9px] text-zinc-600 flex items-center mt-4 font-black uppercase tracking-widest">
              <ArrowUpRight size={12} className="mr-1 text-red-700" /> Активні профілі
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Всього релізів</CardTitle>
            <Music className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter">{stats.totalReleases}</div>
            <p className="text-[9px] text-zinc-600 mt-4 font-black uppercase tracking-widest">У каталозі лейбла</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">На модерації</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter">{stats.pendingModeration}</div>
            <p className="text-[9px] text-amber-500 mt-4 font-black uppercase tracking-widest">Потребують перевірки</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl border-red-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">На видалення</CardTitle>
            <Trash2 className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter">{stats.pendingDeletion}</div>
            <p className="text-[9px] text-red-700 mt-4 font-black uppercase tracking-widest">Запити від артистів</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Genre Distribution Chart */}
        <Card className="lg:col-span-2 bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
              <BarChart3 size={18} className="text-red-700" />
              Популярність жанрів
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1f1f1f', borderRadius: '0px' }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
              <Globe size={18} className="text-red-700" />
              Статус систем
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">API Дистрибуції</span>
                <Badge className="bg-green-500/10 text-green-500 border-none rounded-none text-[8px] font-black uppercase">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">База даних</span>
                <Badge className="bg-green-500/10 text-green-500 border-none rounded-none text-[8px] font-black uppercase">Stable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Сховище файлів</span>
                <Badge className="bg-green-500/10 text-green-500 border-none rounded-none text-[8px] font-black uppercase">99.9%</Badge>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <div className="p-5 bg-red-900/5 border border-red-900/10">
                <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase mb-3 tracking-widest">
                  <ShieldCheck size={14} /> Безпека
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium uppercase tracking-wider">
                  Всі системи працюють у штатному режимі. Останній бекап: 2 години тому.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;