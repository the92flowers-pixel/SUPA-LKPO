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
  isLoading: boolean;
  setAuth: (user: User | null, session: any | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true, // Початковий стан завантаження
      setAuth: (user, session) => set({ user, session, isLoading: false }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isLoading: false });
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
  settings: {
    siteName: string;
    registrationEnabled: boolean;
    contactEmail: string;
  };
  homePageConfig: {
    heroTitle: string;
    heroSubtitle: string;
    buttonText: string;
    primaryColor: string;
  };
  adminPanelConfig: {
    logoText: string;
    accentColor: string;
  };
  labelSocials: any[];
  
  fetchInitialData: (userId: string, role: string) => Promise<void>;
  subscribeToChanges: (userId: string, role: string) => () => void;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateSettings: (settings: any) => void;
  updateHomeConfig: (config: any) => void;
  updateAdminConfig: (config: any) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  releases: [],
  users: [],
  smartLinks: [],
  artistWebsites: [],
  isLoading: false,
  labelSocials: [],
  
  settings: {
    siteName: "ЖУРБА MUSIC",
    registrationEnabled: true,
    contactEmail: "support@jurba.com"
  },
  homePageConfig: {
    heroTitle: "Твоя музика. Скрізь.",
    heroSubtitle: "Дистрибуція на 150+ стрімінгових платформ.",
    buttonText: "Приєднатися",
    primaryColor: "#b91c1c"
  },
  adminPanelConfig: {
    logoText: "ЖУРБА MUSIC",
    accentColor: "#b91c1c"
  },

  fetchInitialData: async (userId, role) => {
    set({ isLoading: true });
    try {
      let artistId = null;
      if (role !== 'admin') {
        const { data: artist } = await supabase.from('artists').select('id').eq('user_id', userId).single();
        artistId = artist?.id;
      }

      let releasesQuery = supabase.from('releases').select('*, artists(name), tracks(*)');
      if (role !== 'admin' && artistId) {
        releasesQuery = releasesQuery.eq('artist_id', artistId);
      }
      const { data: releases } = await releasesQuery;

      let linksQuery = supabase.from('smart_links').select('*');
      if (role !== 'admin' && artistId) {
        linksQuery = linksQuery.eq('artist_id', artistId);
      }
      const { data: links } = await linksQuery;

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
  },
  
  updateSettings: (settings) => set({ settings }),
  updateHomeConfig: (homePageConfig) => set({ homePageConfig }),
  updateAdminConfig: (adminPanelConfig) => set({ adminPanelConfig: (adminPanelConfig) => set({ adminPanelConfig })
}));

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));