import { create } from 'zustand';
import { supabase, toAppProfile, Profile, Release, SmartLink, ArtistWebsite, Transaction, WithdrawalRequest, QuarterlyReport, Status, Field, LabelSocial, AppConfig } from './supabase';

interface AppUser {
  id: string;
  login: string;
  role: 'admin' | 'artist';
  artistName: string | null;
  balance: number;
  isVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  setAuth: (user: AppUser | null) => void;
  logout: () => Promise<void>;
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
  releases: Release[];
  smartLinks: SmartLink[];
  fields: Field[];
  statuses: Status[];
  users: Profile[];
  artistWebsites: ArtistWebsite[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  quarterlyReports: QuarterlyReport[];
  labelSocials: LabelSocial[];
  settings: AppConfig['settings'];
  homePageConfig: AppConfig['home_page'];
  adminPanelConfig: AppConfig['admin_panel'];
  loginPageConfig: AppConfig['login_page'];
  isLoading: boolean;

  // Init
  init: () => Promise<void>;
  
  // Releases
  fetchReleases: (userId?: string, role?: string) => Promise<void>;
  addRelease: (releaseData: Partial<Release>) => Promise<void>;
  updateRelease: (id: string, releaseData: Partial<Release>) => Promise<void>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateReleaseStreams: (id: string, count: number, date: string) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;

  // Smart Links
  fetchSmartLinks: (userId?: string) => Promise<void>;
  addSmartLink: (linkData: Partial<SmartLink>) => Promise<void>;
  updateSmartLink: (id: string, linkData: Partial<SmartLink>) => Promise<void>;
  deleteSmartLink: (id: string) => Promise<void>;

  // Artist Websites
  fetchArtistWebsites: (userId?: string) => Promise<void>;
  addArtistWebsite: (websiteData: Partial<ArtistWebsite>) => Promise<void>;
  updateArtistWebsite: (id: string, websiteData: Partial<ArtistWebsite>) => Promise<void>;
  deleteArtistWebsite: (id: string) => Promise<void>;

  // Users
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, userData: Partial<Profile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Transactions
  fetchTransactions: (userId?: string) => Promise<void>;
  addTransaction: (txData: Partial<Transaction>) => Promise<void>;
  
  // Withdrawal Requests
  fetchWithdrawalRequests: () => Promise<void>;
  addWithdrawalRequest: (reqData: Partial<WithdrawalRequest>) => Promise<void>;
  updateWithdrawalStatus: (id: string, status: WithdrawalRequest['status'], comment?: string) => Promise<void>;

  // Reports
  fetchReports: (userId?: string) => Promise<void>;
  addReport: (reportData: Partial<QuarterlyReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;

  // Statuses
  fetchStatuses: () => Promise<void>;
  updateStatuses: (statuses: Status[]) => Promise<void>;
  addStatus: (status: Status) => Promise<void>;
  deleteStatus: (id: number) => Promise<void>;

  // Fields
  fetchFields: () => Promise<void>;
  updateFields: (fields: Field[]) => Promise<void>;
  addField: (field: Field) => Promise<void>;
  deleteField: (id: number) => Promise<void>;

  // Config
  fetchConfig: () => Promise<void>;
  updateLabelSocials: (socials: LabelSocial[]) => Promise<void>;
  updateLoginConfig: (config: AppConfig['login_page']) => Promise<void>;
  updateSettings: (settings: AppConfig['settings']) => Promise<void>;
  updateHomeConfig: (config: AppConfig['home_page']) => Promise<void>;
  updateAdminConfig: (config: AppConfig['admin_panel']) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  releases: [],
  smartLinks: [],
  fields: [],
  statuses: [],
  users: [],
  artistWebsites: [],
  transactions: [],
  withdrawalRequests: [],
  quarterlyReports: [],
  labelSocials: [],
  settings: { siteName: "ЖУРБА MUSIC", registrationEnabled: true, contactEmail: "support@jurba.music" },
  homePageConfig: { heroTitle: "Твоя музика. Твоя влада.", heroSubtitle: "Дистрибуція нового покоління.", buttonText: "Приєднатися", primaryColor: "#ef4444" },
  adminPanelConfig: { logoText: "ЖУРБА", accentColor: "#ef4444" },
  loginPageConfig: { logoText: "ЖУРБА MUSIC", welcomeTitle: "Ласкаво просимо", welcomeSubtitle: "Увійдіть", socialIcons: ["Spotify", "Apple Music"] },
  isLoading: true,

  init: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchConfig(),
      get().fetchStatuses(),
      get().fetchFields(),
    ]);
    set({ isLoading: false });
  },

  // RELEASES
  fetchReleases: async (userId, role) => {
    try {
      let query = supabase.from('releases').select('*').order('created_at', { ascending: false });
      if (role !== 'admin' && userId) {
        query = query.eq('user_id', userId);
      }
      const result = await query;
      if (!result.error && result.data) set({ releases: result.data });
    } catch (e) { console.error(e); }
  },

  addRelease: async (releaseData) => {
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData?.user) return;
    const result = await supabase
      .from('releases')
      .insert({ ...releaseData, user_id: sessionData.user.id, streams: 0, history: [] })
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ releases: [result.data, ...state.releases] }));
    }
  },

  updateRelease: async (id, releaseData) => {
    const result = await supabase
      .from('releases')
      .update(releaseData)
      .eq('id', id)
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ releases: state.releases.map(r => r.id === id ? result.data : r) }));
    }
  },

  updateReleaseStatus: async (id, status) => {
    await get().updateRelease(id, { status } as Partial<Release>);
  },

  updateReleaseStreams: async (id, count, date) => {
    const release = get().releases.find(r => r.id === id);
    if (!release) return;
    const newHistory = [...(release.history || []), { date, count }];
    await get().updateRelease(id, { streams: release.streams + count, history: newHistory } as Partial<Release>);
  },

  deleteRelease: async (id) => {
    await supabase.from('releases').delete().eq('id', id);
    set((state) => ({ releases: state.releases.filter(r => r.id !== id) }));
  },

  // SMART LINKS
  fetchSmartLinks: async (userId) => {
    try {
      let query = supabase.from('smart_links').select('*');
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) set({ smartLinks: result.data });
    } catch (e) { console.error(e); }
  },

  addSmartLink: async (linkData) => {
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData?.user) return;
    const result = await supabase
      .from('smart_links')
      .insert({ ...linkData, user_id: sessionData.user.id })
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ smartLinks: [...state.smartLinks, result.data] }));
    }
  },

  updateSmartLink: async (id, linkData) => {
    const result = await supabase
      .from('smart_links')
      .update(linkData)
      .eq('id', id)
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? result.data : l) }));
    }
  },

  deleteSmartLink: async (id) => {
    await supabase.from('smart_links').delete().eq('id', id);
    set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) }));
  },

  // ARTIST WEBSITES
  fetchArtistWebsites: async (userId) => {
    try {
      let query = supabase.from('artist_websites').select('*');
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) set({ artistWebsites: result.data });
    } catch (e) { console.error(e); }
  },

  addArtistWebsite: async (websiteData) => {
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData?.user) return;
    const result = await supabase
      .from('artist_websites')
      .insert({ ...websiteData, user_id: sessionData.user.id })
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ artistWebsites: [...state.artistWebsites, result.data] }));
    }
  },

  updateArtistWebsite: async (id, websiteData) => {
    const result = await supabase
      .from('artist_websites')
      .update(websiteData)
      .eq('id', id)
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? result.data : s) }));
    }
  },

  deleteArtistWebsite: async (id) => {
    await supabase.from('artist_websites').delete().eq('id', id);
    set((state) => ({ artistWebsites: state.artistWebsites.filter(s => s.id !== id) }));
  },

  // USERS
  fetchUsers: async () => {
    try {
      const result = await supabase.from('profiles').select('*');
      if (!result.error && result.data) set({ users: result.data });
    } catch (e) { console.error(e); }
  },

  updateUser: async (id, userData) => {
    const result = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ users: state.users.map(u => u.id === id ? result.data : u) }));
    }
  },

  deleteUser: async (id) => {
    await supabase.from('profiles').delete().eq('id', id);
    set((state) => ({ users: state.users.filter(u => u.id !== id) }));
  },

  // TRANSACTIONS
  fetchTransactions: async (userId) => {
    try {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) set({ transactions: result.data });
    } catch (e) { console.error(e); }
  },

  addTransaction: async (txData) => {
    const result = await supabase
      .from('transactions')
      .insert(txData)
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ transactions: [result.data, ...state.transactions] }));
    }
  },

  // WITHDRAWAL REQUESTS
  fetchWithdrawalRequests: async () => {
    try {
      const result = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      if (!result.error && result.data) set({ withdrawalRequests: result.data });
    } catch (e) { console.error(e); }
  },

  addWithdrawalRequest: async (reqData) => {
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData?.user) return;
    const result = await supabase
      .from('withdrawal_requests')
      .insert({ ...reqData, user_id: sessionData.user.id })
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ withdrawalRequests: [result.data, ...state.withdrawalRequests] }));
    }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    await supabase.from('withdrawal_requests').update({ status, admin_comment: comment }).eq('id', id);
    set((state) => ({ 
      withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, admin_comment: comment } : r)
    }));
  },

  // REPORTS
  fetchReports: async (userId) => {
    try {
      let query = supabase.from('quarterly_reports').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) set({ quarterlyReports: result.data });
    } catch (e) { console.error(e); }
  },

  addReport: async (reportData) => {
    const result = await supabase
      .from('quarterly_reports')
      .insert(reportData)
      .select()
      .single();
    if (!result.error && result.data) {
      set((state) => ({ quarterlyReports: [result.data, ...state.quarterlyReports] }));
    }
  },

  deleteReport: async (id) => {
    await supabase.from('quarterly_reports').delete().eq('id', id);
    set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) }));
  },

  // STATUSES
  fetchStatuses: async () => {
    try {
      const result = await supabase.from('statuses').select('*').order('sort_order');
      if (!result.error && result.data) set({ statuses: result.data });
    } catch (e) { console.error(e); }
  },

  updateStatuses: async (statuses) => {
    set({ statuses });
  },

  addStatus: async (status) => {
    const result = await supabase.from('statuses').insert(status).select().single();
    if (!result.error && result.data) {
      set((state) => ({ statuses: [...state.statuses, result.data] }));
    }
  },

  deleteStatus: async (id) => {
    await supabase.from('statuses').delete().eq('id', id);
    set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) }));
  },

  // FIELDS
  fetchFields: async () => {
    try {
      const result = await supabase.from('fields').select('*').order('sort_order');
      if (!result.error && result.data) set({ fields: result.data });
    } catch (e) { console.error(e); }
  },

  updateFields: async (fields) => {
    set({ fields });
  },

  addField: async (field) => {
    const result = await supabase.from('fields').insert(field).select().single();
    if (!result.error && result.data) {
      set((state) => ({ fields: [...state.fields, result.data] }));
    }
  },

  deleteField: async (id) => {
    await supabase.from('fields').delete().eq('id', id);
    set((state) => ({ fields: state.fields.filter(f => f.id !== id) }));
  },

  // CONFIG
  fetchConfig: async () => {
    try {
      const result = await supabase.from('app_config').select('*').single();
      if (!result.error && result.data) {
        set({
          settings: result.data.settings,
          homePageConfig: result.data.home_page,
          adminPanelConfig: result.data.admin_panel,
          loginPageConfig: result.data.login_page,
          labelSocials: result.data.label_socials || [],
          fields: result.data.fields || [],
          statuses: result.data.statuses || [],
        });
      }
    } catch (e) { console.error(e); }
  },

  updateLabelSocials: async (labelSocials) => {
    await supabase.from('app_config').update({ label_socials: labelSocials }).eq('id', 1);
    set({ labelSocials });
  },

  updateLoginConfig: async (loginPageConfig) => {
    await supabase.from('app_config').update({ login_page: loginPageConfig }).eq('id', 1);
    set({ loginPageConfig });
  },

  updateSettings: async (settings) => {
    await supabase.from('app_config').update({ settings }).eq('id', 1);
    set({ settings });
  },

  updateHomeConfig: async (homePageConfig) => {
    await supabase.from('app_config').update({ home_page: homePageConfig }).eq('id', 1);
    set({ homePageConfig });
  },

  updateAdminConfig: async (adminPanelConfig) => {
    await supabase.from('app_config').update({ admin_panel: adminPanelConfig }).eq('id', 1);
    set({ adminPanelConfig });
  },
}));