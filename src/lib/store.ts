import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { initialLoginPageContent, initialStatuses, initialFields } from './mockData';

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
    { name: 'zhurba-auth-supabase' }
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

interface DataState {
  settings: any;
  homePageConfig: any;
  adminPanelConfig: any;
  loginPageConfig: any;
  labelSocials: any[];
  
  releases: any[];
  users: any[];
  fields: any[];
  statuses: any[];
  smartLinks: any[];
  artistWebsites: any[];
  transactions: any[];
  withdrawalRequests: any[];
  quarterlyReports: any[];
  
  isLoading: boolean;
  
  fetchInitialData: (userId: string, role: string) => Promise<void>;
  updateAdminConfig: (config: any) => void;
  updateSettings: (settings: any) => void;
  updateHomeConfig: (config: any) => void;
  updateLoginConfig: (config: any) => void;
  updateLabelSocials: (socials: any[]) => void;
  
  updateUser: (id: string, data: any) => void;
  deleteUser: (id: string) => void;
  updateRelease: (id: string, data: any) => void;
  updateReleaseStatus: (id: string, status: string) => void;
  updateReleaseStreams: (id: string, count: number, date: string) => void;
  addSmartLink: (link: any) => void;
  updateSmartLink: (id: string, data: any) => void;
  deleteSmartLink: (id: string) => void;
  addArtistWebsite: (website: any) => void;
  updateArtistWebsite: (id: string, data: any) => void;
  deleteArtistWebsite: (id: string) => void;
  addStatus: (status: any) => void;
  updateStatuses: (statuses: any[]) => void;
  deleteStatus: (id: number) => void;
  addField: (field: any) => void;
  updateFields: (fields: any[]) => void;
  deleteField: (id: number) => void;
  addWithdrawalRequest: (req: any) => void;
  updateWithdrawalStatus: (id: string, status: string, comment: string) => void;
  addTransaction: (tx: any) => void;
  addReport: (report: any) => void;
  deleteReport: (id: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      settings: { siteName: "ЖУРБА MUSIC", contactEmail: "support@jurba.com", registrationEnabled: true },
      homePageConfig: {
        heroTitle: "Твоя музика. Скрізь.",
        heroSubtitle: "Дистрибуція на 150+ платформ. 100% роялті.",
        buttonText: "Почати зараз",
        primaryColor: "#b91c1c"
      },
      adminPanelConfig: { sidebarColor: "#000000", accentColor: "#b91c1c", logoText: "ЖУРБА" },
      loginPageConfig: initialLoginPageContent,
      labelSocials: [],
      
      releases: [],
      users: [],
      fields: initialFields,
      statuses: initialStatuses,
      smartLinks: [],
      artistWebsites: [],
      transactions: [],
      withdrawalRequests: [],
      quarterlyReports: [],
      
      isLoading: false,

      fetchInitialData: async (userId, role) => {
        set({ isLoading: true });
        try {
          // Завантаження релізів з приєднанням імені артиста
          let releasesQuery = supabase
            .from('releases')
            .select('*, artists(name)');
          
          if (role !== 'admin') {
            const { data: artist } = await supabase.from('artists').select('id').eq('user_id', userId).single();
            if (artist) {
              releasesQuery = releasesQuery.eq('artist_id', artist.id);
            } else {
              set({ releases: [] });
            }
          }
          
          const { data: releases } = await releasesQuery;
          if (releases) {
            const mappedReleases = releases.map(r => ({
              id: r.id,
              title: r.title,
              artist: r.artists?.name || 'Unknown',
              genre: r.genre,
              releaseDate: r.release_date,
              coverUrl: r.cover_url,
              status: r.status,
              streams: r.streams || 0,
              history: r.history || [],
              userId: userId,
              createdAt: r.created_at
            }));
            set({ releases: mappedReleases });
          }

          // Завантаження користувачів для адміна
          if (role === 'admin') {
            const { data: profiles } = await supabase.from('profiles').select('*');
            if (profiles) {
              set({ users: profiles.map(p => ({
                id: p.id,
                login: p.email,
                role: p.role,
                artistName: p.full_name,
                balance: p.balance || 0,
                isVerified: p.is_verified || false,
                createdAt: p.created_at
              })) });
            }
          }

          const { data: smartLinks } = await supabase.from('smart_links').select('*');
          if (smartLinks) set({ smartLinks });

          const { data: websites } = await supabase.from('artist_websites').select('*');
          if (websites) set({ artistWebsites: websites });

        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateAdminConfig: (config) => set({ adminPanelConfig: config }),
      updateSettings: (settings) => set({ settings }),
      updateHomeConfig: (config) => set({ homePageConfig: config }),
      updateLoginConfig: (config) => set({ loginPageConfig: config }),
      updateLabelSocials: (labelSocials) => set({ labelSocials }),

      updateUser: (id, data) => set((state) => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) })),
      updateRelease: (id, data) => set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, ...data } : r) })),
      updateReleaseStatus: (id, status) => set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, status } : r) })),
      updateReleaseStreams: (id, count, date) => set((state) => ({ 
        releases: state.releases.map(r => r.id === id ? { 
          ...r, 
          streams: (r.streams || 0) + count,
          history: [...(r.history || []), { date, count }]
        } : r) 
      })),
      addSmartLink: (link) => set((state) => ({ smartLinks: [...state.smartLinks, link] })),
      updateSmartLink: (id, data) => set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? { ...l, ...data } : l) })),
      deleteSmartLink: (id) => set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) })),
      addArtistWebsite: (website) => set((state) => ({ artistWebsites: [...state.artistWebsites, website] })),
      updateArtistWebsite: (id, data) => set((state) => ({ artistWebsites: state.artistWebsites.map(w => w.id === id ? { ...w, ...data } : w) })),
      deleteArtistWebsite: (id) => set((state) => ({ artistWebsites: state.artistWebsites.filter(w => w.id !== id) })),
      addStatus: (status) => set((state) => ({ statuses: [...state.statuses, { ...status, id: Date.now() }] })),
      updateStatuses: (statuses) => set({ statuses }),
      deleteStatus: (id) => set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) })),
      addField: (field) => set((state) => ({ fields: [...state.fields, { ...field, id: Date.now() }] })),
      updateFields: (fields) => set({ fields }),
      deleteField: (id) => set((state) => ({ fields: state.fields.filter(f => f.id !== id) })),
      addWithdrawalRequest: (req) => set((state) => ({ withdrawalRequests: [...state.withdrawalRequests, { ...req, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() }] })),
      updateWithdrawalStatus: (id, status, comment) => set((state) => ({ withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, adminComment: comment } : r) })),
      addTransaction: (tx) => set((state) => ({ transactions: [...state.transactions, { ...tx, id: Date.now().toString(), createdAt: new Date().toISOString() }] })),
      addReport: (report) => set((state) => ({ quarterlyReports: [...state.quarterlyReports, { ...report, id: Date.now().toString() }] })),
      deleteReport: (id) => set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) })),
    }),
    { name: 'zhurba-settings-supabase' }
  )
);