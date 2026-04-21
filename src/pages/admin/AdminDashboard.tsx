import React, { useMemo } from 'react';
import { 
  Users, 
  Music, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  Globe,
  ShieldCheck
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

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

const AdminDashboard = () => {
  const { users, releases } = useDataStore();

  const stats = useMemo(() => {
    const totalArtists = users.filter(u => u.role === 'artist').length;
    const totalReleases = releases.length;
    const totalStreams = releases.reduce((acc, r) => acc + r.streams, 0);
    const pendingModeration = releases.filter(r => r.status === 'На модерації').length;

    return { totalArtists, totalReleases, totalStreams, pendingModeration };
  }, [users, releases]);

  const chartData = useMemo(() => {
    // Group releases by genre for a bar chart
    const genreMap: Record<string, number> = {};
    releases.forEach(r => {
      genreMap[r.genre] = (genreMap[r.genre] || 0) + 1;
    });
    return Object.entries(genreMap).map(([name, value]) => ({ name, value }));
  }, [releases]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Глобальний огляд</h1>
        <p className="text-slate-400 mt-1">Статистика всієї платформи ЖУРБА MUSIC</p>
      </div>

      {/* Global KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Всього артистів</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.totalArtists}</div>
            <p className="text-[10px] text-green-400 flex items-center mt-1 font-bold">
              <ArrowUpRight size={12} className="mr-1" /> +3 за тиждень
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Всього релізів</CardTitle>
            <Music className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.totalReleases}</div>
            <p className="text-[10px] text-green-400 flex items-center mt-1 font-bold">
              <ArrowUpRight size={12} className="mr-1" /> +12% зростання
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Загальні стріми</CardTitle>
            <TrendingUp className="h-4 w-4 text-fuchsia-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.totalStreams.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Сумарно по всіх платформах</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Очікують модерації</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.pendingModeration}</div>
            <p className="text-[10px] text-amber-500 mt-1 font-bold">Потребують уваги</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Genre Distribution Chart */}
        <Card className="lg:col-span-2 bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 size={20} className="text-violet-500" />
              Популярність жанрів
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe size={20} className="text-blue-500" />
              Статус систем
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">API Дистрибуції</span>
                <Badge className="bg-green-500/10 text-green-500 border-none">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">База даних</span>
                <Badge className="bg-green-500/10 text-green-500 border-none">Stable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Сховище файлів</span>
                <Badge className="bg-green-500/10 text-green-500 border-none">99.9%</Badge>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="p-4 bg-violet-500/5 rounded-xl border border-violet-500/10">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase mb-2">
                  <ShieldCheck size={14} /> Безпека
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
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