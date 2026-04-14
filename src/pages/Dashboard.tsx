"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Music, Star, ArrowUpRight, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataStore, useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { releases } = useDataStore();
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      // Отримуємо статистику стрімів для всіх треків користувача
      const { data } = await supabase
        .from('streams')
        .select('*, tracks!inner(release_id)')
        .order('created_at', { ascending: true });
        
      if (data) {
        const formatted = data.map(s => ({
          name: new Date(s.created_at).toLocaleDateString(),
          streams: s.stream_count
        }));
        setStats(formatted);
      }
    };
    fetchStats();
  }, [user]);

  const totalStreams = useMemo(() => 
    releases.reduce((acc, r) => acc + (r.streams || 0), 0), 
    [releases]
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Дашборд</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваша музична аналітика</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-black/40 border-white/5 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Всього стрімів</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{totalStreams.toLocaleString()}</div>
            <p className="text-[9px] text-red-500 mt-4 font-black uppercase tracking-widest">Live from Supabase</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-white/5 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Активні релізи</CardTitle>
            <Music className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{releases.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Динаміка прослуховувань</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] pt-6">
          {stats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} />
                <YAxis stroke="#3f3f46" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #1f1f1f' }} />
                <Line type="monotone" dataKey="streams" stroke="#991b1b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="text-zinc-800" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Дані про стріми оновлюються раз на 24 години</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;