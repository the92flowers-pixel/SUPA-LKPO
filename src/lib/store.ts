import { create } from 'zustand';
import { supabase, toAppProfile, AppUser, Release, SmartLink, ArtistWebsite, Transaction, WithdrawalRequest, QuarterlyReport, Status, Field, LabelSocial, AppConfig } from './supabase';

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  setAuth: (user: AppUser | null, token?: string) => void;
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
  users: AppUser[];
  artistWebsites: ArtistWebsite[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  quarterlyReports: QuarterlyReport[];
  labelSocials: LabelSocial[];
  settings: { siteName: string; registrationEnabled: boolean; contactEmail: string };
  homePageConfig: { heroTitle: string; heroSubtitle: string; buttonText: string; primaryColor: string };
  adminPanelConfig: { logoText: string; accentColor: string };
  loginPageConfig: { logoText: string; welcomeTitle: string; welcomeSubtitle: string; socialIcons: string[] };
  isLoading: boolean;

  init: () => Promise<void>;
  
  fetchReleases: (userId?: string, role?: string) => Promise<void>;
  addRelease: (releaseData: Partial<Release>) => Promise<void>;
  updateRelease: (id: string, releaseData: Partial<Release>) => Promise<void>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateReleaseStreams: (id: string, count: number, date: string) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;

  fetchSmartLinks: (userId?: string) => Promise<void>;
  addSmartLink: (linkData: Partial<SmartLink>) => Promise<void>;
  updateSmartLink: (id: string, linkData: Partial<SmartLink>) => Promise<void>;
  deleteSmartLink: (id: string) => Promise<void>;

  fetchArtistWebsites: (userId?: string) => Promise<void>;
  addArtistWebsite: (websiteData: Partial<ArtistWebsite>) => Promise<void>;
  updateArtistWebsite: (id: string, websiteData: Partial<ArtistWebsite>) => Promise<void>;
  deleteArtistWebsite: (id: string) => Promise<void>;

  fetchUsers: () => Promise<void>;
  updateUser: (id: string, userData: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  fetchTransactions: (userId?: string) => Promise<void>;
  addTransaction: (txData: Partial<Transaction>) => Promise<void>;
  
  fetchWithdrawalRequests: () => Promise<void>;
  addWithdrawalRequest: (reqData: Partial<WithdrawalRequest>) => Promise<void>;
  updateWithdrawalStatus: (id: string, status: 'paid' | 'rejected', comment?: string) => Promise<void>;

  fetchReports: (userId?: string) => Promise<void>;
  addReport: (reportData: Partial<QuarterlyReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;

  fetchStatuses: () => Promise<void>;
  updateStatuses: (statuses: Status[]) => Promise<void>;
  addStatus: (status: Status) => Promise<void>;
  deleteStatus: (id: number) => Promise<void>;

  fetchFields: () => Promise<void>;
  updateFields: (fields: Field[]) => Promise<void>;
  addField: (field: Field) => Promise<void>;
  deleteField: (id: number) => Promise<void>;

  fetchConfig: () => Promise<void>;
  updateLabelSocials: (socials: LabelSocial[]) => Promise<void>;
  updateLoginConfig: (config: { logoText: string; welcomeTitle: string; welcomeSubtitle: string; socialIcons: string[] }) => Promise<void>;
  updateSettings: (settings: { siteName: string; registrationEnabled: boolean; contactEmail: string }) => Promise<void>;
  updateHomeConfig: (config: { heroTitle: string; heroSubtitle: string; buttonText: string; primaryColor: string }) => Promise<void>;
  updateAdminConfig: (config: { logoText: string; accentColor: string }) => Promise<void>;
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

  fetchReleases: async (userId, role) => {
    try {
      let query = supabase.from('releases').select('*').order('created_at', { ascending: false });
      if (role !== 'admin' && userId) {
        query = query.eq('user_id', userId);
      }
      const result = await query;
      if (!result.error && result.data) {
        set({ releases: result.data.map(r => ({
          ...r,
          userId: r.user_id,
          artist: r.artist || r.title?.split(' - ')[0] || '',
          releaseDate: r.release_date,
          coverUrl: r.cover_url,
          createdAt: r.created_at,
        })) });
      }
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
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        artist: result.data.artist || result.data.title?.split(' - ')[0] || '',
        releaseDate: result.data.release_date,
        coverUrl: result.data.cover_url,
        createdAt: result.data.created_at,
      };
      set((state) => ({ releases: [mapped, ...state.releases] }));
    }
  },

  updateRelease: async (id, releaseData) => {
    const result = await supabase.from('releases').update(releaseData).eq('id', id).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        artist: result.data.artist || result.data.title?.split(' - ')[0] || '',
        releaseDate: result.data.release_date,
        coverUrl: result.data.cover_url,
        createdAt: result.data.created_at,
      };
      set((state) => ({ releases: state.releases.map(r => r.id === id ? mapped : r) }));
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

  fetchSmartLinks: async (userId) => {
    try {
      let query = supabase.from('smart_links').select('*');
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) {
        set({ smartLinks: result.data.map(l => ({
          ...l,
          userId: l.user_id,
          releaseId: l.release_id,
          coverUrl: l.cover_url,
          createdAt: l.created_at,
        })) });
      }
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
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        releaseId: result.data.release_id,
        coverUrl: result.data.cover_url,
        createdAt: result.data.created_at,
      };
      set((state) => ({ smartLinks: [...state.smartLinks, mapped] }));
    }
  },

  updateSmartLink: async (id, linkData) => {
    const result = await supabase.from('smart_links').update(linkData).eq('id', id).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        releaseId: result.data.release_id,
        coverUrl: result.data.cover_url,
        createdAt: result.data.created_at,
      };
      set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? mapped : l) }));
    }
  },

  deleteSmartLink: async (id) => {
    await supabase.from('smart_links').delete().eq('id', id);
    set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) }));
  },

  fetchArtistWebsites: async (userId) => {
    try {
      let query = supabase.from('artist_websites').select('*');
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) {
        set({ artistWebsites: result.data.map(w => ({
          ...w,
          userId: w.user_id,
          stageName: w.title || w.slug,
          photoUrl: w.photo_url,
          links: w.links || w.socials || [],
          createdAt: w.created_at,
        })) });
      }
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
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        stageName: result.data.title || result.data.slug,
        photoUrl: result.data.photo_url,
        links: result.data.links || result.data.socials || [],
        createdAt: result.data.created_at,
      };
      set((state) => ({ artistWebsites: [...state.artistWebsites, mapped] }));
    }
  },

  updateArtistWebsite: async (id, websiteData) => {
    const result = await supabase.from('artist_websites').update(websiteData).eq('id', id).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        stageName: result.data.title || result.data.slug,
        photoUrl: result.data.photo_url,
        links: result.data.links || result.data.socials || [],
        createdAt: result.data.created_at,
      };
      set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? mapped : s) }));
    }
  },

  deleteArtistWebsite: async (id) => {
    await supabase.from('artist_websites').delete().eq('id', id);
    set((state) => ({ artistWebsites: state.artistWebsites.filter(s => s.id !== id) }));
  },

  fetchUsers: async () => {
    try {
      const result = await supabase.from('profiles').select('*');
      if (!result.error && result.data) {
        set({ users: result.data.map(p => toAppProfile(p)) });
      }
    } catch (e) { console.error(e); }
  },

  updateUser: async (id, userData) => {
    const dbData: any = {};
    if (userData.artistName !== undefined) dbData.full_name = userData.artistName;
    if (userData.role !== undefined) dbData.role = userData.role;
    if (userData.isVerified !== undefined) dbData.is_verified = userData.isVerified;
    if (userData.bio !== undefined) dbData.bio = userData.bio;
    
    const result = await supabase.from('profiles').update(dbData).eq('id', id).select().single();
    if (!result.error && result.data) {
      const appUser = toAppProfile(result.data);
      set((state) => ({ users: state.users.map(u => u.id === id ? appUser : u) }));
    }
  },

  deleteUser: async (id) => {
    await supabase.from('profiles').delete().eq('id', id);
    set((state) => ({ users: state.users.filter(u => u.id !== id) }));
  },

  fetchTransactions: async (userId) => {
    try {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) {
        set({ transactions: result.data.map(t => ({
          ...t,
          userId: t.user_id,
          createdAt: t.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addTransaction: async (txData) => {
    const result = await supabase.from('transactions').insert(txData).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        createdAt: result.data.created_at,
      };
      set((state) => ({ transactions: [mapped, ...state.transactions] }));
    }
  },

  fetchWithdrawalRequests: async () => {
    try {
      const result = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      if (!result.error && result.data) {
        set({ withdrawalRequests: result.data.map(r => ({
          ...r,
          userId: r.user_id,
          createdAt: r.created_at,
        })) });
      }
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
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        createdAt: result.data.created_at,
      };
      set((state) => ({ withdrawalRequests: [mapped, ...state.withdrawalRequests] }));
    }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    await supabase.from('withdrawal_requests').update({ status, admin_comment: comment }).eq('id', id);
    set((state) => ({ 
      withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, admin_comment: comment } : r)
    }));
  },

  fetchReports: async (userId) => {
    try {
      let query = supabase.from('quarterly_reports').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const result = await query;
      if (!result.error && result.data) {
        set({ quarterlyReports: result.data.map(r => ({
          ...r,
          userId: r.user_id,
          fileUrl: r.file_url || r.fileUrl,
          createdAt: r.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addReport: async (reportData) => {
    const result = await supabase.from('quarterly_reports').insert(reportData).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        userId: result.data.user_id,
        fileUrl: result.data.file_url || result.data.fileUrl,
        createdAt: result.data.created_at,
      };
      set((state) => ({ quarterlyReports: [mapped, ...state.quarterlyReports] }));
    }
  },

  deleteReport: async (id) => {
    await supabase.from('quarterly_reports').delete().eq('id', id);
    set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) }));
  },

  fetchStatuses: async () => {
    try {
      const result = await supabase.from('statuses').select('*').order('sort_order');
      if (!result.error && result.data) {
        set({ statuses: result.data.map(s => ({
          ...s,
          order: s.sort_order || s.order,
          isDefault: s.is_default || s.isDefault,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  updateStatuses: async (statuses) => set({ statuses }),

  addStatus: async (status) => {
    const dbData = { ...status, sort_order: status.order, is_default: status.isDefault };
    delete (dbData as any).order;
    delete (dbData as any).isDefault;
    const result = await supabase.from('statuses').insert(dbData).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        order: result.data.sort_order,
        isDefault: result.data.is_default,
      };
      set((state) => ({ statuses: [...state.statuses, mapped] }));
    }
  },

  deleteStatus: async (id) => {
    await supabase.from('statuses').delete().eq('id', id);
    set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) }));
  },

  fetchFields: async () => {
    try {
      const result = await supabase.from('fields').select('*').order('sort_order');
      if (!result.error && result.data) {
        set({ fields: result.data.map(f => ({
          ...f,
          order: f.sort_order || f.order,
          section: f.section || (f.name?.includes('artist') ? 'profile' : 'release'),
          visible: f.visible !== false,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  updateFields: async (fields) => set({ fields }),

  addField: async (field) => {
    const dbData = { ...field, sort_order: field.order };
    delete (dbData as any).order;
    const result = await supabase.from('fields').insert(dbData).select().single();
    if (!result.error && result.data) {
      const mapped = {
        ...result.data,
        order: result.data.sort_order,
      };
      set((state) => ({ fields: [...state.fields, mapped] }));
    }
  },

  deleteField: async (id) => {
    await supabase.from('fields').delete().eq('id', id);
    set((state) => ({ fields: state.fields.filter(f => f.id !== id) }));
  },

  fetchConfig: async () => {
    try {
      const result = await supabase.from('app_config').select('*').single();
      if (!result.error && result.data) {
        set({
          settings: result.data.settings,
          homePageConfig: result.data.home_page,
          adminPanelConfig: result.data.admin_panel,
          loginPageConfig: result.data.login_page || { logoText: 'ЖУРБА MUSIC', welcomeTitle: 'Ласкаво просимо', welcomeSubtitle: 'Увійдіть', socialIcons: [] },
          labelSocials: (result.data.label_socials || result.data.labelSocials || []).map((s: any) => ({
            id: s.id || Date.now().toString(),
            name: s.name || s.platform,
            url: s.url,
          })),
          fields: (result.data.fields || []).map((f: any) => ({
            ...f,
            order: f.sort_order || f.order || 0,
            section: f.section || (f.name?.includes('artist') ? 'profile' : 'release'),
            visible: f.visible !== false,
          })),
          statuses: (result.data.statuses || []).map((s: any) => ({
            ...s,
            order: s.sort_order || s.order || 0,
            isDefault: s.is_default || s.isDefault || false,
          })),
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