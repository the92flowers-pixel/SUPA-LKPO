import { create } from 'zustand';
import { supabase, Profile, Release, SmartLink, ArtistWebsite, Transaction, WithdrawalRequest, QuarterlyReport, Status, Field, LabelSocial, AppConfig } from './supabase';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setAuth: (user: Profile | null) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setAuth: (user) => set({ user, isLoading: false }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ user: profile || null, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ user: null, isLoading: false });
    }
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
  addRelease: (data: Partial<Release>) => Promise<void>;
  updateRelease: (id: string, data: Partial<Release>) => Promise<void>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateReleaseStreams: (id: string, count: number, date: string) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;

  // Smart Links
  fetchSmartLinks: (userId?: string) => Promise<void>;
  addSmartLink: (data: Partial<SmartLink>) => Promise<void>;
  updateSmartLink: (id: string, data: Partial<SmartLink>) => Promise<void>;
  deleteSmartLink: (id: string) => Promise<void>;

  // Artist Websites
  fetchArtistWebsites: (userId?: string) => Promise<void>;
  addArtistWebsite: (data: Partial<ArtistWebsite>) => Promise<void>;
  updateArtistWebsite: (id: string, data: Partial<ArtistWebsite>) => Promise<void>;
  deleteArtistWebsite: (id: string) => Promise<void>;

  // Users
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, data: Partial<Profile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Transactions
  fetchTransactions: (userId?: string) => Promise<void>;
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  
  // Withdrawal Requests
  fetchWithdrawalRequests: () => Promise<void>;
  addWithdrawalRequest: (data: Partial<WithdrawalRequest>) => Promise<void>;
  updateWithdrawalStatus: (id: string, status: WithdrawalRequest['status'], comment?: string) => Promise<void>;

  // Reports
  fetchReports: (userId?: string) => Promise<void>;
  addReport: (data: Partial<QuarterlyReport>) => Promise<void>;
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
      const { data, error } = await query;
      if (!error && data) set({ releases: data });
    } catch (e) { console.error(e); }
  },

  addRelease: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newRelease, error } = await supabase
      .from('releases')
      .insert({ ...data, user_id: user.id, streams: 0, history: [] })
      .select()
      .single();
    if (!error && newRelease) {
      set((state) => ({ releases: [newRelease, ...state.releases] }));
    }
  },

  updateRelease: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('releases')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (!error && updated) {
      set((state) => ({ releases: state.releases.map(r => r.id === id ? updated : r) }));
    }
  },

  updateReleaseStatus: async (id, status) => {
    await get().updateRelease(id, { status });
  },

  updateReleaseStreams: async (id, count, date) => {
    const release = get().releases.find(r => r.id === id);
    if (!release) return;
    const newHistory = [...(release.history || []), { date, count }];
    await get().updateRelease(id, { streams: release.streams + count, history: newHistory });
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
      const { data, error } = await query;
      if (!error && data) set({ smartLinks: data });
    } catch (e) { console.error(e); }
  },

  addSmartLink: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newLink, error } = await supabase
      .from('smart_links')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (!error && newLink) {
      set((state) => ({ smartLinks: [...state.smartLinks, newLink] }));
    }
  },

  updateSmartLink: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('smart_links')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (!error && updated) {
      set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? updated : l) }));
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
      const { data, error } = await query;
      if (!error && data) set({ artistWebsites: data });
    } catch (e) { console.error(e); }
  },

  addArtistWebsite: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newSite, error } = await supabase
      .from('artist_websites')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (!error && newSite) {
      set((state) => ({ artistWebsites: [...state.artistWebsites, newSite] }));
    }
  },

  updateArtistWebsite: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('artist_websites')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (!error && updated) {
      set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? updated : s) }));
    }
  },

  deleteArtistWebsite: async (id) => {
    await supabase.from('artist_websites').delete().eq('id', id);
    set((state) => ({ artistWebsites: state.artistWebsites.filter(s => s.id !== id) }));
  },

  // USERS
  fetchUsers: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) set({ users: data });
    } catch (e) { console.error(e); }
  },

  updateUser: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (!error && updated) {
      set((state) => ({ users: state.users.map(u => u.id === id ? updated : u) }));
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
      const { data, error } = await query;
      if (!error && data) set({ transactions: data });
    } catch (e) { console.error(e); }
  },

  addTransaction: async (data) => {
    const { data: newTx, error } = await supabase
      .from('transactions')
      .insert(data)
      .select()
      .single();
    if (!error && newTx) {
      set((state) => ({ transactions: [newTx, ...state.transactions] }));
      // Update user balance
      if (data.type === 'deposit' && data.user_id) {
        const user = get().users.find(u => u.id === data.user_id);
        if (user) {
          await get().updateUser(data.user_id, { balance: user.balance + (data.amount || 0) });
        }
      }
    }
  },

  // WITHDRAWAL REQUESTS
  fetchWithdrawalRequests: async () => {
    try {
      const { data, error } = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      if (!error && data) set({ withdrawalRequests: data });
    } catch (e) { console.error(e); }
  },

  addWithdrawalRequest: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newReq, error } = await supabase
      .from('withdrawal_requests')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (!error && newReq) {
      set((state) => ({ withdrawalRequests: [newReq, ...state.withdrawalRequests] }));
      // Deduct from balance
      const profile = get().users.find(u => u.id === user.id);
      if (profile) {
        await get().updateUser(user.id, { balance: profile.balance - (data.amount || 0) });
      }
    }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    const req = get().withdrawalRequests.find(r => r.id === id);
    if (!req) return;

    await supabase.from('withdrawal_requests').update({ status, admin_comment: comment }).eq('id', id);
    
    // If rejected, return money to user
    if (status === 'rejected') {
      const user = get().users.find(u => u.id === req.user_id);
      if (user) {
        await get().updateUser(req.user_id, { balance: user.balance + req.amount });
      }
    }

    set((state) => ({ 
      withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, admin_comment: comment } : r)
    }));
  },

  // REPORTS
  fetchReports: async (userId) => {
    try {
      let query = supabase.from('quarterly_reports').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) set({ quarterlyReports: data });
    } catch (e) { console.error(e); }
  },

  addReport: async (data) => {
    const { data: newReport, error } = await supabase
      .from('quarterly_reports')
      .insert(data)
      .select()
      .single();
    if (!error && newReport) {
      set((state) => ({ quarterlyReports: [newReport, ...state.quarterlyReports] }));
    }
  },

  deleteReport: async (id) => {
    await supabase.from('quarterly_reports').delete().eq('id', id);
    set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) }));
  },

  // STATUSES
  fetchStatuses: async () => {
    try {
      const { data, error } = await supabase.from('statuses').select('*').order('sort_order');
      if (!error && data) set({ statuses: data });
    } catch (e) { console.error(e); }
  },

  updateStatuses: async (statuses) => {
    set({ statuses });
  },

  addStatus: async (status) => {
    const { data: newStatus, error } = await supabase.from('statuses').insert(status).select().single();
    if (!error && newStatus) {
      set((state) => ({ statuses: [...state.statuses, newStatus] }));
    }
  },

  deleteStatus: async (id) => {
    await supabase.from('statuses').delete().eq('id', id);
    set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) }));
  },

  // FIELDS
  fetchFields: async () => {
    try {
      const { data, error } = await supabase.from('fields').select('*').order('sort_order');
      if (!error && data) set({ fields: data });
    } catch (e) { console.error(e); }
  },

  updateFields: async (fields) => {
    set({ fields });
  },

  addField: async (field) => {
    const { data: newField, error } = await supabase.from('fields').insert(field).select().single();
    if (!error && newField) {
      set((state) => ({ fields: [...state.fields, newField] }));
    }
  },

  deleteField: async (id) => {
    await supabase.from('fields').delete().eq('id', id);
    set((state) => ({ fields: state.fields.filter(f => f.id !== id) }));
  },

  // CONFIG
  fetchConfig: async () => {
    try {
      const { data, error } = await supabase.from('app_config').select('*').single();
      if (!error && data) {
        set({
          settings: data.settings,
          homePageConfig: data.home_page,
          adminPanelConfig: data.admin_panel,
          loginPageConfig: data.login_page,
          labelSocials: data.label_socials || [],
          fields: data.fields || [],
          statuses: data.statuses || [],
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