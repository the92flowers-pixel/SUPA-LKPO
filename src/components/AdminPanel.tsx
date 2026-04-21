"use client";

import React, { useState, useEffect } from 'react';
import { Music, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';

interface Release {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  streams: number;
  status: string;
}

const AdminPanel = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const { data, error } = await supabase
          .from('releases')
          .select('id, title, artist, cover_url, streams, status')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) setReleases(data);
      } catch (error) {
        console.error('Error fetching releases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleases();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500">Доступ тільки для адміністраторів</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-red-700" size={24} />
          Останні релізи
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-red-700 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {releases.map((release) => (
            <Card key={release.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden group">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={release.cover_url || "https://jurbamusic.iceiy.com/releasepreview.png"} 
                  alt={release.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`
                    text-[8px] font-black uppercase tracking-widest border-none rounded-none
                    ${release.status === 'Опубліковано' ? 'bg-green-500/80 text-white' : 'bg-amber-500/80 text-white'}
                  `}>
                    {release.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-white uppercase tracking-wider truncate">{release.title}</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{release.artist}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Streams</span>
                  <span className="text-sm font-black text-red-700">{release.streams.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {releases.length === 0 && !isLoading && (
        <div className="text-center py-12 border border-dashed border-white/5">
          <Music className="mx-auto text-zinc-800 mb-4" size={48} />
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Релізів поки що немає</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;