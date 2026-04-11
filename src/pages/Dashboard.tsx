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

const COLORS = ['#991b1b', '#7f1d1d', '#450a0a', '#18181b', '#27272a'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const { releases } = useDataStore();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  const userReleases = useMemo(() => 
    releases.filter(r => r.userId === user?.id), 
    [releases, user]
  );

  const totalStreams = useMemo(() => 
    userReleases.reduce((acc, r) => acc + r.streams, 0), 
    [userReleases]
  );

  const topRelease = useMemo(() => {
    if (userReleases.length === 0) return null;
    return [...userReleases].sort((a, b) => b.streams - a.streams)[0];
  }, [userReleases]);

  const lineData = useMemo(() => {
    const historyMap: Record<string, number> = {};
    userReleases.forEach(release => {
      release.history?.forEach(h => {
        historyMap[h.date] = (historyMap[h.date] || 0) + h.count;
      });
    });
    const sortedDates = Object.keys(historyMap).sort();
    if (sortedDates.length === 0) return [{ name: 'Empty', streams: 0 }];
    return sortedDates.map(date => ({
      name: date.split('-').slice(1).reverse().join('.'),
      streams: historyMap[date]
    }));
  }, [userReleases]);

  const pieData = useMemo(() => {
    if (userReleases.length === 0) return [];
    const top4 = [...userReleases]
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 4)
      .map(r => ({ name: r.title, value: r.streams }));
    const total = top4.reduce((acc, item) => acc + item.value, 0) || 1;
    return top4.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }, [userReleases]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Дашборд</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваша музична імперія</p>
        </div>
        <Badge variant="outline" className="px-6 py-2 border-red-900/30 text-red-500 font-black uppercase tracking-widest bg-red-900/5 rounded-none">
          {new Date().toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Всього стрімів</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white tracking-tighter">{totalStreams.toLocaleString()}</div>
            <p className="text-[9px] text-red-500 flex items-center mt-4 font-black uppercase tracking-widest">
              <ArrowUpRight size={12} className="mr-1" /> Live Data
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Активні релізи</CardTitle>
            <Music className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white tracking-tighter">{userReleases.length}</div>
            <p className="text-[9px] text-zinc-600 mt-4 font-black uppercase tracking-widest">Global Distribution</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Топ реліз</CardTitle>
            <Star className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white tracking-tighter truncate">
              {topRelease ? topRelease.title : '—'}
            </div>
            <p className="text-[9px] text-red-500 mt-4 font-black uppercase tracking-widest">
              {topRelease ? `${topRelease.streams.toLocaleString()} Streams` : 'No Data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Динаміка прослуховувань</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1f1f1f', borderRadius: '0px' }}
                  itemStyle={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="streams" stroke="#991b1b" strokeWidth={3} dot={{ r: 4, fill: '#991b1b', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#dc2626' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Розподіл за релізами</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={10} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #1f1f1f', borderRadius: '0px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 pr-10 min-w-[160px]">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[120px]">
                        {item.name} <span className="text-red-800 ml-2">{item.percentage}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest">No Data Available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;