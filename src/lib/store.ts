import { create } from 'zustand';
import { supabase } from './supabase';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  setAuth: (user: any | null, session: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setAuth: (user) => set({ user, isLoading: false }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },
}));

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

interface DataState {
  releases: any[];
  smartLinks: any[];
  fields: any[];
  users: any[];
  artistWebsites: any[];
  transactions: any[];
  withdrawalRequests: any[];
  quarterlyReports: any[];
  statuses: any[];
  labelSocials: any[];
  settings: any;
  homePageConfig: any;
  adminPanelConfig: any;
  loginPageConfig: any;
  
  fetchInitialData: (userId: string, role: string) => Promise<void>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  addWithdrawalRequest: (data: any) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  releases: [],
  smartLinks: [],
  fields: [],
  users: [],
  artistWebsites: [],
  transactions: [],
  withdrawalRequests: [],
  quarterlyReports: [],
  statuses: [],
  labelSocials: [],
  settings: { siteName: "ЖУРБА MUSIC", registrationEnabled: true },
  homePageConfig: { heroTitle: "Твоя музика.", heroSubtitle: "Дистрибуція нового покоління.", buttonText: "Приєднатися", primaryColor: "#ef4444" },
  adminPanelConfig: { logoText: "ЖУРБА", accentColor: "#ef4444" },
  loginPageConfig: { socialIcons: ["Spotify", "Apple"] },

  fetchInitialData: async (userId, role) => {
    const isAdmin = role === 'admin';
    
    // Завантаження релізів
    let releasesQuery = supabase.from('releases').select('*');
    if (!isAdmin) releasesQuery = releasesQuery.eq('user_id', userId);
    const { data: releases } = await releasesQuery;
    
    // Завантаження транзакцій
    let transQuery = supabase.from('transactions').select('*');
    if (!isAdmin) transQuery = transQuery.eq('user_id', userId);
    const { data: transactions } = await transQuery;

    // Завантаження сайтів
    let sitesQuery = supabase.from('artist_websites').select('*');
    if (!isAdmin) sitesQuery = sitesQuery.eq('user_id', userId);
    const { data: websites } = await sitesQuery;

    // Завантаження конфігурацій (завжди доступні)
    const { data: config } = await supabase.from('app_config').select('*').single();

    set({ 
      releases: releases || [], 
      transactions: transactions || [],
      artistWebsites: websites || [],
      settings: config?.settings || get().settings,
      homePageConfig: config?.home_page || get().homePageConfig,
      adminPanelConfig: config?.admin_panel || get().adminPanelConfig
    });
  },

  updateReleaseStatus: async (id, status) => {
    const { error } = await supabase.from('releases').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        releases: state.releases.map(r => r.id === id ? { ...r, status } : r)
      }));
    }
  },

  updateUser: async (id, data) => {
    const { error } = await supabase.auth.updateUser({ data });
    if (!error) {
      set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
      }));
    }
  },

  addWithdrawalRequest: async (data) => {
    const { data: req, error } = await supabase.from('withdrawal_requests').insert(data).select().single();
    if (!error) {
      set((state) => ({
        withdrawalRequests: [...state.withdrawalRequests, req]
      }));
    }
  }
}));