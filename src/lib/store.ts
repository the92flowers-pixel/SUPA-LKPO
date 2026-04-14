"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

interface User {
  id: string;
  login: string;
  role: 'admin' | 'artist';
  artistName?: string;
  balance: number;
  isVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  session: any | null;
  setAuth: (user: User | null, session: any | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      setAuth: (user, session) => set({ user, session }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
    }),
    { name: 'zhurba-auth-v2' }
  )
);

interface DataState {
  releases: any[];
  users: any[];
  smartLinks: any[];
  artistWebsites: any[];
  isLoading: boolean;
  
  fetchInitialData: (userId: string, role: string) => Promise<void>;
  subscribeToChanges: (userId: string, role: string) => () => void;
  
  // Методи оновлення (вони тепер просто викликають Supabase, а Realtime оновить UI)
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  releases: [],
  users: [],
  smartLinks: [],
  artistWebsites: [],
  isLoading: false,

  fetchInitialData: async (userId, role) => {
    set({ isLoading: true });
    try {
      // 1. Отримуємо артиста, якщо це не адмін
      let artistId = null;
      if (role !== 'admin') {
        const { data: artist } = await supabase.from('artists').select('id').eq('user_id', userId).single();
        artistId = artist?.id;
      }

      // 2. Завантажуємо релізи
      let releasesQuery = supabase.from('releases').select('*, artists(name), tracks(*)');
      if (role !== 'admin' && artistId) {
        releasesQuery = releasesQuery.eq('artist_id', artistId);
      }
      const { data: releases } = await releasesQuery;

      // 3. Завантажуємо смартлінки
      let linksQuery = supabase.from('smart_links').select('*');
      if (role !== 'admin' && artistId) {
        linksQuery = linksQuery.eq('artist_id', artistId);
      }
      const { data: links } = await linksQuery;

      // 4. Завантажуємо користувачів (тільки для адміна)
      let usersData = [];
      if (role === 'admin') {
        const { data: profiles } = await supabase.from('profiles').select('*');
        usersData = profiles || [];
      }

      set({ 
        releases: releases || [], 
        smartLinks: links || [],
        users: usersData,
        isLoading: false 
      });
    } catch (error) {
      console.error("Data fetch error:", error);
      set({ isLoading: false });
    }
  },

  subscribeToChanges: (userId, role) => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'releases' }, () => get().fetchInitialData(userId, role))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'smart_links' }, () => get().fetchInitialData(userId, role))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => get().fetchInitialData(userId, role))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  updateReleaseStatus: async (id, status) => {
    await supabase.from('releases').update({ status }).eq('id', id);
  }
}));

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));