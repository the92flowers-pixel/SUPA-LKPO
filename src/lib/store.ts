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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error", e);
    }
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
  
  fetchInitialData: (userId?: string, role?: string) => Promise<void>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateRelease: (id: string, data: any) => Promise<void>;
  updateReleaseStreams: (id: string, count: number, date: string) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addWithdrawalRequest: (data: any) => Promise<void>;
  updateWithdrawalStatus: (id: string, status: string, comment: string) => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  addSmartLink: (data: any) => Promise<void>;
  updateSmartLink: (id: string, data: any) => Promise<void>;
  deleteSmartLink: (id: string) => Promise<void>;
  addArtistWebsite: (data: any) => Promise<void>;
  updateArtistWebsite: (id: string, data: any) => Promise<void>;
  deleteArtistWebsite: (id: string) => Promise<void>;
  addReport: (data: any) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  updateStatuses: (statuses: any[]) => Promise<void>;
  addStatus: (status: any) => Promise<void>;
  deleteStatus: (id: number) => Promise<void>;
  updateFields: (fields: any[]) => Promise<void>;
  addField: (field: any) => Promise<void>;
  deleteField: (id: number) => Promise<void>;
  updateLabelSocials: (socials: any[]) => Promise<void>;
  updateLoginConfig: (config: any) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  updateHomeConfig: (config: any) => Promise<void>;
  updateAdminConfig: (config: any) => Promise<void>;
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
  homePageConfig: { heroTitle: "Твоя музика. Твоя влада.", heroSubtitle: "Дистрибуція нового покоління для незалежних артистів.", buttonText: "Приєднатися", primaryColor: "#ef4444" },
  adminPanelConfig: { logoText: "ЖУРБА", accentColor: "#ef4444" },
  loginPageConfig: { socialIcons: ["Spotify", "Apple"] },

  fetchInitialData: async (userId, role) => {
    try {
      const isAdmin = role === 'admin';
      
      // Публічні дані (завжди намагаємось завантажити)
      const { data: config } = await supabase.from('app_config').select('*').maybeSingle();
      
      if (config) {
        set({ 
          settings: config.settings || get().settings,
          homePageConfig: config.home_page || get().homePageConfig,
          adminPanelConfig: config.admin_panel || get().adminPanelConfig,
          loginPageConfig: config.login_page || get().loginPageConfig,
          fields: config.fields || [],
          statuses: config.statuses || [],
          labelSocials: config.label_socials || []
        });
      }

      // Дані користувача (тільки якщо авторизований)
      if (userId) {
        const { data: releases } = await (isAdmin ? supabase.from('releases').select('*') : supabase.from('releases').select('*').eq('user_id', userId));
        const { data: smartLinks } = await supabase.from('smart_links').select('*');
        const { data: transactions } = await (isAdmin ? supabase.from('transactions').select('*') : supabase.from('transactions').select('*').eq('user_id', userId));
        const { data: websites } = await (isAdmin ? supabase.from('artist_websites').select('*') : supabase.from('artist_websites').select('*').eq('user_id', userId));
        const { data: withdrawals } = await (isAdmin ? supabase.from('withdrawal_requests').select('*') : supabase.from('withdrawal_requests').select('*').eq('user_id', userId));
        const { data: reports } = await (isAdmin ? supabase.from('quarterly_reports').select('*') : supabase.from('quarterly_reports').select('*').eq('user_id', userId));

        set({ 
          releases: releases || [], 
          smartLinks: smartLinks || [],
          transactions: transactions || [],
          artistWebsites: websites || [],
          withdrawalRequests: withdrawals || [],
          quarterlyReports: reports || []
        });
      }
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    }
  },

  updateReleaseStatus: async (id, status) => {
    try {
      await supabase.from('releases').update({ status }).eq('id', id);
      set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, status } : r) }));
    } catch (e) { console.error(e); }
  },

  updateRelease: async (id, data) => {
    try {
      await supabase.from('releases').update(data).eq('id', id);
      set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, ...data } : r) }));
    } catch (e) { console.error(e); }
  },

  updateReleaseStreams: async (id, count, _date) => {
    set((state) => ({
      releases: state.releases.map(r => r.id === id ? { ...r, streams: (r.streams || 0) + count } : r)
    }));
  },

  updateUser: async (id, data) => {
    try {
      set((state) => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) }));
    } catch (e) { console.error(e); }
  },

  deleteUser: async (id) => {
    set((state) => ({ users: state.users.filter(u => u.id !== id) }));
  },

  addWithdrawalRequest: async (data) => {
    try {
      const { data: req } = await supabase.from('withdrawal_requests').insert(data).select().single();
      if (req) set((state) => ({ withdrawalRequests: [...state.withdrawalRequests, req] }));
    } catch (e) { console.error(e); }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    try {
      await supabase.from('withdrawal_requests').update({ status, admin_comment: comment }).eq('id', id);
      set((state) => ({ withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, admin_comment: comment } : r) }));
    } catch (e) { console.error(e); }
  },

  addTransaction: async (data) => {
    try {
      const { data: tx } = await supabase.from('transactions').insert(data).select().single();
      if (tx) set((state) => ({ transactions: [...state.transactions, tx] }));
    } catch (e) { console.error(e); }
  },

  addSmartLink: async (data) => {
    try {
      const { data: link } = await supabase.from('smart_links').insert(data).select().single();
      if (link) set((state) => ({ smartLinks: [...state.smartLinks, link] }));
    } catch (e) { console.error(e); }
  },

  updateSmartLink: async (id, data) => {
    try {
      await supabase.from('smart_links').update(data).eq('id', id);
      set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? { ...l, ...data } : l) }));
    } catch (e) { console.error(e); }
  },

  deleteSmartLink: async (id) => {
    try {
      await supabase.from('smart_links').delete().eq('id', id);
      set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) }));
    } catch (e) { console.error(e); }
  },

  addArtistWebsite: async (data) => {
    try {
      const { data: site } = await supabase.from('artist_websites').insert(data).select().single();
      if (site) set((state) => ({ artistWebsites: [...state.artistWebsites, site] }));
    } catch (e) { console.error(e); }
  },

  updateArtistWebsite: async (id, data) => {
    try {
      await supabase.from('artist_websites').update(data).eq('id', id);
      set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? { ...s, ...data } : s) }));
    } catch (e) { console.error(e); }
  },

  deleteArtistWebsite: async (id) => {
    try {
      await supabase.from('artist_websites').delete().eq('id', id);
      set((state) => ({ artistWebsites: state.artistWebsites.filter(s => s.id !== id) }));
    } catch (e) { console.error(e); }
  },

  addReport: async (data) => {
    try {
      const { data: report } = await supabase.from('quarterly_reports').insert(data).select().single();
      if (report) set((state) => ({ quarterlyReports: [...state.quarterlyReports, report] }));
    } catch (e) { console.error(e); }
  },

  deleteReport: async (id) => {
    try {
      await supabase.from('quarterly_reports').delete().eq('id', id);
      set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) }));
    } catch (e) { console.error(e); }
  },

  updateStatuses: async (statuses) => {
    try {
      await supabase.from('app_config').update({ statuses }).eq('id', 1);
      set({ statuses });
    } catch (e) { console.error(e); }
  },

  addStatus: async (status) => {
    const newStatuses = [...get().statuses, { ...status, id: Date.now() }];
    await get().updateStatuses(newStatuses);
  },

  deleteStatus: async (id) => {
    const newStatuses = get().statuses.filter(s => s.id !== id);
    await get().updateStatuses(newStatuses);
  },

  updateFields: async (fields) => {
    try {
      await supabase.from('app_config').update({ fields }).eq('id', 1);
      set({ fields });
    } catch (e) { console.error(e); }
  },

  addField: async (field) => {
    const newFields = [...get().fields, { ...field, id: Date.now() }];
    await get().updateFields(newFields);
  },

  deleteField: async (id) => {
    const newFields = get().fields.filter(f => f.id !== id);
    await get().updateFields(newFields);
  },

  updateLabelSocials: async (labelSocials) => {
    try {
      await supabase.from('app_config').update({ label_socials: labelSocials }).eq('id', 1);
      set({ labelSocials });
    } catch (e) { console.error(e); }
  },

  updateLoginConfig: async (loginPageConfig) => {
    try {
      await supabase.from('app_config').update({ login_page: loginPageConfig }).eq('id', 1);
      set({ loginPageConfig });
    } catch (e) { console.error(e); }
  },

  updateSettings: async (settings) => {
    try {
      await supabase.from('app_config').update({ settings }).eq('id', 1);
      set({ settings });
    } catch (e) { console.error(e); }
  },

  updateHomeConfig: async (homePageConfig) => {
    try {
      await supabase.from('app_config').update({ home_page: homePageConfig }).eq('id', 1);
      set({ homePageConfig });
    } catch (e) { console.error(e); }
  },

  updateAdminConfig: async (adminPanelConfig) => {
    try {
      await supabase.from('app_config').update({ admin_panel: adminPanelConfig }).eq('id', 1);
      set({ adminPanelConfig });
    } catch (e) { console.error(e); }
  }
}));