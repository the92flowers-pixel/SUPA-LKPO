"use client";

import React, { useState, useEffect } from 'react';
import { Music, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Release {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  streams: number;
  status: string;
}

const ArtistDashboard = () => {
  const { user } = useAuthStore();
  const { releases, transactions } = useDataStore();
  const [isLoading, setIsLoading] = useState(true);

  const userReleases = releases.filter(r => r.userId === user?.id);
  const totalStreams = userReleases.reduce((acc, r) => acc + r.streams, 0);
  const balance = user?.balance || 0;

  if (user?.role !== 'artist') {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500">Доступ тільки для артистів</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-white/5 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Мої релізи</CardTitle>
            <Music className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{userReleases.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Всього стрімів</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{totalStreams.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Баланс</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{balance.toLocaleString()} ₴</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Мої останні релізи</CardTitle>
        </CardHeader>
        <CardContent>
          {userReleases.length > 0 ? (
            <div className="space-y-4">
              {userReleases.slice(0, 5).map((release) => (
                <div key={release.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5">
                  <img 
                    src={release.coverUrl || "https://jurbamusic.iceiy.com/releasepreview.png"} 
                    alt={release.title}
                    className="w-12 h-12 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white uppercase tracking-wider truncate">{release.title}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{release.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-700">{release.streams.toLocaleString()}</p>
                    <p className="text-[8px] text-zinc-600 uppercase">Streams</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="mx-auto text-zinc-800 mb-4" size={32} />
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">У вас поки що немає релізів</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistDashboard;