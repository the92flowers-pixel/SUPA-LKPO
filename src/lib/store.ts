import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabaseApi } from './supabase-fetch';

interface DataState {
  users: any[];
  releases: any[];
  statuses: any[];
  fields: any[];
  settings: any;
  loginPageConfig: any;
  homePageConfig: any;
  adminPanelConfig: any;
  smartLinks: any[];
  artistWebsites: any[];
  labelSocials: any[];
  transactions: any[];
  withdrawalRequests: any[];
  quarterlyReports: any[];
  
  fetchInitialData: (jwt: string) => Promise<void>;
  
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addRelease: (release: any) => Promise<void>;
  updateRelease: (id: string, data: any) => Promise<void>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateReleaseStreams: (id: string, count: number, date: string) => Promise<void>;
  updateSettings: (keyOrData: string | any, value?: any) => Promise<void>;
  updateLoginConfig: (data: any) => Promise<void>;
  updateHomeConfig: (data: any) => Promise<void>;
  updateAdminConfig: (data: any) => Promise<void>;
  updateLabelSocials: (data: any) => Promise<void>;
  addField: (field: any) => Promise<void>;
  updateFields: (fields: any[]) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addStatus: (status: any) => Promise<void>;
  updateStatuses: (statuses: any[]) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
  addSmartLink: (link: any) => Promise<void>;
  updateSmartLink: (id: string, data: any) => Promise<void>;
  deleteSmartLink: (id: string) => Promise<void>;
  addArtistWebsite: (website: any) => Promise<void>;
  updateArtistWebsite: (id: string, data: any) => Promise<void>;
  deleteArtistWebsite: (id: string) => Promise<void>;
  addTransaction: (tx: any) => Promise<void>;
  addWithdrawalRequest: (req: any) => Promise<void>;
  updateWithdrawalStatus: (id: string, status: string, comment?: string) => Promise<void>;
  addReport: (report: any) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  getUserBalance: (userId: string) => number;
}

export const useDataStore = create<DataState>()((set, get) => ({
  users: [], releases: [], statuses: [], fields: [], settings: {},
  loginPageConfig: {}, homePageConfig: {}, adminPanelConfig: {},
  smartLinks: [], artistWebsites: [], labelSocials: [],
  transactions: [], withdrawalRequests: [], quarterlyReports: [],

  fetchInitialData: async (jwt: string) => {
    const [u, r, s, f, st, sl, aw, tx, wr, rep] = await Promise.all([
      supabaseApi.profiles.list(jwt),
      supabaseApi.releases.list(jwt),
      supabaseApi.statuses.list(),
      supabaseApi.fields.list(),
      supabaseApi.settings.list(),
      supabaseApi.smartLinks.list(jwt),
      supabaseApi.artistWebsites.list(jwt),
      supabaseApi.transactions.list(jwt),
      supabaseApi.withdrawals.list(jwt),
      supabaseApi.reports.list(jwt)
    ]);

    const settingsMap: any = {};
    st.data?.forEach((item: any) => { settingsMap[item.key] = item.value; });

    set({
      users: u.data || [],
      releases: r.data || [],
      statuses: s.data || [],
      fields: f.data || [],
      settings: settingsMap,
      loginPageConfig: settingsMap.login_config || {},
      homePageConfig: settingsMap.home_config || {},
      adminPanelConfig: settingsMap.admin_config || {},
      labelSocials: settingsMap.label_socials || [],
      smartLinks: sl.data || [],
      artistWebsites: aw.data || [],
      transactions: tx.data || [],
      withdrawalRequests: wr.data || [],
      quarterlyReports: rep.data || []
    });
  },

  getUserBalance: (userId: string) => {
    return get().transactions
      .filter(t => t.user_id === userId && t.status === 'completed')
      .reduce((acc, t) => acc + Number(t.amount), 0);
  },

  updateUser: async (id, data) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.profiles.update(id, data, jwt);
    set(state => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) }));
  },

  deleteUser: async (id) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.profiles.delete(id, jwt);
    set(state => ({ users: state.users.filter(u => u.id !== id) }));
  },

  addRelease: async (release) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.releases.create(release, jwt);
    if (data) set(state => ({ releases: [data[0], ...state.releases] }));
  },

  updateRelease: async (id, data) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.releases.update(id, data, jwt);
    set(state => ({ releases: state.releases.map(r => r.id === id ? { ...r, ...data } : r) }));
  },

  updateReleaseStatus: async (id, status) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.releases.update(id, { status }, jwt);
    set(state => ({ releases: state.releases.map(r => r.id === id ? { ...r, status } : r) }));
  },

  updateReleaseStreams: async (id, count, date) => {
    const jwt = useAuthStore.getState().token!;
    const release = get().releases.find(r => r.id === id);
    const newHistory = [...(release.history || []), { date, count }];
    const newStreams = Number(release.streams || 0) + count;
    await supabaseApi.releases.update(id, { streams: newStreams, history: newHistory }, jwt);
    set(state => ({ releases: state.releases.map(r => r.id === id ? { ...r, streams: newStreams, history: newHistory } : r) }));
  },

  updateSettings: async (keyOrData, value) => {
    const jwt = useAuthStore.getState().token!;
    if (typeof keyOrData === 'string') {
      await supabaseApi.settings.update(keyOrData, value, jwt);
      set(state => ({ 
        settings: { ...state.settings, [keyOrData]: value },
        ...(keyOrData === 'login_config' ? { loginPageConfig: value } : {}),
        ...(keyOrData === 'home_config' ? { homePageConfig: value } : {}),
        ...(keyOrData === 'admin_config' ? { adminPanelConfig: value } : {}),
        ...(keyOrData === 'label_socials' ? { labelSocials: value } : {})
      }));
    } else {
      for (const [k, v] of Object.entries(keyOrData)) {
        await supabaseApi.settings.update(k, v, jwt);
      }
      set(state => ({ settings: { ...state.settings, ...keyOrData } }));
    }
  },

  updateLoginConfig: (data) => get().updateSettings('login_config', data),
  updateHomeConfig: (data) => get().updateSettings('home_config', data),
  updateAdminConfig: (data) => get().updateSettings('admin_config', data),
  updateLabelSocials: (data) => get().updateSettings('label_socials', data),

  addField: async (field) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.fields.create(field, jwt);
    if (data) set(state => ({ fields: [...state.fields, data[0]] }));
  },

  updateFields: async (fields) => {
    const jwt = useAuthStore.getState().token!;
    for (const f of fields) { await supabaseApi.fields.update(f.id, f, jwt); }
    set({ fields });
  },

  deleteField: async (id) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.fields.delete(id, jwt);
    set(state => ({ fields: state.fields.filter(f => f.id !== id) }));
  },

  addStatus: async (status) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.statuses.create(status, jwt);
    if (data) set(state => ({ statuses: [...state.statuses, data[0]] }));
  },

  updateStatuses: async (statuses) => {
    const jwt = useAuthStore.getState().token!;
    for (const s of statuses) { await supabaseApi.statuses.update(s.id, s, jwt); }
    set({ statuses });
  },

  deleteStatus: async (id) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.statuses.delete(id, jwt);
    set(state => ({ statuses: state.statuses.filter(s => s.id !== id) }));
  },

  addSmartLink: async (link) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.smartLinks.create(link, jwt);
    if (data) set(state => ({ smartLinks: [...state.smartLinks, data[0]] }));
  },

  updateSmartLink: async (id, data) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.smartLinks.update(id, data, jwt);
    set(state => ({ smartLinks: state.smartLinks.map(l => l.id === id ? { ...l, ...data } : l) }));
  },

  deleteSmartLink: async (id) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.smartLinks.delete(id, jwt);
    set(state => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) }));
  },

  addArtistWebsite: async (website) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.artistWebsites.create(website, jwt);
    if (data) set(state => ({ artistWebsites: [...state.artistWebsites, data[0]] }));
  },

  updateArtistWebsite: async (id, data) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.artistWebsites.update(id, data, jwt);
    set(state => ({ artistWebsites: state.artistWebsites.map(w => w.id === id ? { ...w, ...data } : w) }));
  },

  deleteArtistWebsite: async (id) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.artistWebsites.delete(id, jwt);
    set(state => ({ artistWebsites: state.artistWebsites.filter(w => w.id !== id) }));
  },

  addTransaction: async (tx) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.transactions.create(tx, jwt);
    if (data) set(state => ({ transactions: [data[0], ...state.transactions] }));
  },

  addWithdrawalRequest: async (req) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.withdrawals.create(req, jwt);
    if (data) {
      const newReq = data[0];
      const tx = { user_id: req.user_id, amount: -req.amount, type: 'withdrawal', status: 'pending', description: 'Заявка на вивід' };
      const txRes = await supabaseApi.transactions.create(tx, jwt);
      set(state => ({ 
        withdrawalRequests: [newReq, ...state.withdrawalRequests],
        transactions: txRes.data ? [txRes.data[0], ...state.transactions] : state.transactions
      }));
    }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.withdrawals.update(id, { status, admin_comment: comment }, jwt);
    set(state => ({ withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, admin_comment: comment } : r) }));
  },

  addReport: async (report) => {
    const jwt = useAuthStore.getState().token!;
    const { data } = await supabaseApi.reports.create(report, jwt);
    if (data) set(state => ({ quarterlyReports: [data[0], ...state.quarterlyReports] }));
  },

  deleteReport: async (id) => {
    const jwt = useAuthStore.getState().token!;
    await supabaseApi.reports.delete(id, jwt);
    set(state => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) }));
  }
})));

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        if (token) useDataStore.getState().fetchInitialData(token);
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'zhurba-auth-v15' }
  )
);

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));