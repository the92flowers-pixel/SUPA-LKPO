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
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { releases } = useDataStore();

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
    if (sortedDates.length === 0) return [];
    return sortedDates.map(date => ({
      name: date.split('-').slice(1).reverse().join('.'),
      streams: historyMap[date]
    }));
  }, [userReleases]);

  const releaseList = useMemo(() => {
    return [...userReleases]
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 5);
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
          <CardContent className="h-[350px] pt-6 flex items-center justify-center">
            {lineData.length > 0 ? (
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
            ) : (
              <div className="text-center space-y-4">
                <AlertCircle className="mx-auto text-zinc-800" size={40} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 max-w-[200px] leading-relaxed">
                  Очікуйте надходження приблизної аналітики протягом 30 днів.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Розподіл за релізами</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {releaseList.length > 0 ? (
              <div className="space-y-6">
                {releaseList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-700">
                        0{i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider">{item.title}</p>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{item.genre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-700 tracking-tighter">{item.streams.toLocaleString()}</p>
                      <p className="text-[8px] text-zinc-800 uppercase font-black tracking-widest">Streams</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800">No Data Available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;