import { create } from 'zustand';

// --- Auth Store ---
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
  logout: () => set({ user: null, isLoading: false }),
}));

// --- UI Store ---
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// --- Data Store ---
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
  
  // Actions
  fetchInitialData: (userId: string, role: string) => Promise<void>;
  subscribeToChanges: (userId: string, role: string) => () => void;
  
  updateUser: (id: string, data: any) => void;
  deleteUser: (id: string) => void;
  
  updateRelease: (id: string, data: any) => void;
  updateReleaseStatus: (id: string, status: string) => void;
  updateReleaseStreams: (id: string, count: number, date: string) => void;
  
  addSmartLink: (data: any) => void;
  updateSmartLink: (id: string, data: any) => void;
  deleteSmartLink: (id: string) => void;
  
  addArtistWebsite: (data: any) => void;
  updateArtistWebsite: (id: string, data: any) => void;
  deleteArtistWebsite: (id: string) => void;
  
  addWithdrawalRequest: (data: any) => void;
  updateWithdrawalStatus: (id: string, status: string, comment?: string) => void;
  addTransaction: (data: any) => void;
  
  addReport: (data: any) => void;
  deleteReport: (id: string) => void;
  
  updateStatuses: (statuses: any[]) => void;
  addStatus: (status: any) => void;
  deleteStatus: (id: string) => void;
  
  updateFields: (fields: any[]) => void;
  addField: (field: any) => void;
  deleteField: (id: string) => void;
  
  updateLabelSocials: (links: any[]) => void;
  updateLoginConfig: (config: any) => void;
  updateSettings: (settings: any) => void;
  updateHomeConfig: (config: any) => void;
  updateAdminConfig: (config: any) => void;
}

export const useDataStore = create<DataState>((set) => ({
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

  fetchInitialData: async () => {},
  subscribeToChanges: () => () => {},

  updateUser: (id, data) => set((state) => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
  deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) })),

  updateRelease: (id, data) => set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, ...data } : r) })),
  updateReleaseStatus: (id, status) => set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, status } : r) })),
  updateReleaseStreams: (id, count, date) => set((state) => ({
    releases: state.releases.map(r => r.id === id ? { 
      ...r, 
      streams: r.streams + count, 
      history: [...(r.history || []), { date, count }] 
    } : r)
  })),

  addSmartLink: (data) => set((state) => ({ smartLinks: [...state.smartLinks, data] })),
  updateSmartLink: (id, data) => set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? { ...l, ...data } : l) })),
  deleteSmartLink: (id) => set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) })),

  addArtistWebsite: (data) => set((state) => ({ artistWebsites: [...state.artistWebsites, data] })),
  updateArtistWebsite: (id, data) => set((state) => ({ artistWebsites: state.artistWebsites.map(w => w.id === id ? { ...w, ...data } : w) })),
  deleteArtistWebsite: (id) => set((state) => ({ artistWebsites: state.artistWebsites.filter(w => w.id !== id) })),

  addWithdrawalRequest: (data) => set((state) => ({ withdrawalRequests: [...state.withdrawalRequests, { ...data, id: Math.random().toString(), status: 'pending', createdAt: new Date().toISOString() }] })),
  updateWithdrawalStatus: (id, status) => set((state) => ({ withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status } : r) })),
  addTransaction: (data) => set((state) => ({ transactions: [...state.transactions, { ...data, id: Math.random().toString(), createdAt: new Date().toISOString() }] })),

  addReport: (data) => set((state) => ({ quarterlyReports: [...state.quarterlyReports, { ...data, id: Math.random().toString() }] })),
  deleteReport: (id) => set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) })),

  updateStatuses: (statuses) => set({ statuses }),
  addStatus: (status) => set((state) => ({ statuses: [...state.statuses, { ...status, id: Math.random() }] })),
  deleteStatus: (id) => set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) })),

  updateFields: (fields) => set({ fields }),
  addField: (field) => set((state) => ({ fields: [...state.fields, { ...field, id: Math.random() }] })),
  deleteField: (id) => set((state) => ({ fields: state.fields.filter(f => f.id !== id) })),

  updateLabelSocials: (labelSocials) => set({ labelSocials }),
  updateLoginConfig: (loginPageConfig) => set({ loginPageConfig }),
  updateSettings: (settings) => set({ settings }),
  updateHomeConfig: (homePageConfig) => set({ homePageConfig }),
  updateAdminConfig: (adminPanelConfig) => set({ adminPanelConfig }),
}));