import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialStatuses, initialFields, initialLoginPageContent } from './mockData';

interface SmartLinkPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface SmartLink {
  id: string;
  releaseId: string;
  slug: string;
  title: string;
  artist: string;
  coverUrl: string;
  platforms: SmartLinkPlatform[];
  createdAt: string;
}

interface LabelSocials {
  instagram: string;
  telegram: string;
  youtube: string;
  website: string;
}

interface User {
  id: string;
  login: string;
  password?: string;
  role: 'admin' | 'artist';
  artistName?: string;
  balance: number;
  isVerified: boolean;
  createdAt: string;
  [key: string]: any;
}

interface DataState {
  users: User[];
  releases: any[];
  statuses: any[];
  fields: any[];
  settings: any;
  loginPageConfig: any;
  homePageConfig: any;
  adminPanelConfig: any;
  smartLinks: SmartLink[];
  labelSocials: LabelSocials;
  
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addRelease: (release: any) => void;
  updateRelease: (id: string, data: Partial<any>) => void;
  updateReleaseStatus: (id: string, status: string) => void;
  updateReleaseStreams: (id: string, count: number, date: string) => void;
  updateSettings: (settings: any) => void;
  updateFields: (fields: any[]) => void;
  addField: (field: any) => void;
  deleteField: (id: number) => void;
  updateStatuses: (statuses: any[]) => void;
  updateLoginConfig: (config: any) => void;
  updateHomeConfig: (config: any) => void;
  updateAdminConfig: (config: any) => void;
  
  addSmartLink: (link: SmartLink) => void;
  updateSmartLink: (id: string, data: Partial<SmartLink>) => void;
  deleteSmartLink: (id: string) => void;
  updateLabelSocials: (socials: LabelSocials) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      users: [
        { id: '1', login: 'admin', password: 'admin2', role: 'admin', artistName: 'Адмін', balance: 0, isVerified: true, createdAt: new Date().toISOString() },
        { id: '2', login: 'artist@demo.com', password: 'password', role: 'artist', artistName: 'Demo Artist', balance: 0, isVerified: false, createdAt: new Date().toISOString() }
      ],
      releases: [
        { 
          id: 'r1', 
          userId: '2', 
          title: 'Midnight City', 
          artist: 'Demo Artist', 
          genre: 'Electronic', 
          releaseDate: '2024-05-20', 
          coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80', 
          audioUrl: 'https://example.com/audio.mp3', 
          status: 'Опубліковано', 
          streams: 12540, 
          history: [{ date: '2024-05-20', count: 12540 }],
          createdAt: new Date().toISOString() 
        }
      ],
      statuses: initialStatuses,
      fields: initialFields,
      settings: {
        siteName: 'ЖУРБА MUSIC',
        contactEmail: 'support@zhurba.music',
        registrationEnabled: true,
      },
      loginPageConfig: initialLoginPageContent,
      homePageConfig: {
        heroTitle: "МУЗИКА ТВОЄЇ ДУШІ.",
        heroSubtitle: "Ми — прихисток для справжнього мистецтва. 150+ платформ, 100% роялті та повна свобода самовираження.",
        buttonText: "Почати шлях",
        primaryColor: "#b91c1c",
        accentText: "Melancholy & Power"
      },
      adminPanelConfig: {
        sidebarColor: "#000000",
        accentColor: "#b91c1c",
        logoText: "ЖУРБА"
      },
      smartLinks: [],
      labelSocials: {
        instagram: 'https://instagram.com/zhurba',
        telegram: 'https://t.me/zhurba',
        youtube: 'https://youtube.com/zhurba',
        website: 'https://zhurba.music'
      },

      addUser: (user) => set((state) => ({ users: [...state.users, { ...user, isVerified: false }] })),
      updateUser: (id, data) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),
      addRelease: (release) => set((state) => ({ 
        releases: [...state.releases, { ...release, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), streams: 0, history: [] }] 
      })),
      updateRelease: (id, data) => set((state) => ({
        releases: state.releases.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      updateReleaseStatus: (id, status) => set((state) => ({
        releases: state.releases.map(r => r.id === id ? { ...r, status } : r)
      })),
      updateReleaseStreams: (id, count, date) => set((state) => ({
        releases: state.releases.map(r => {
          if (r.id === id) {
            const newHistory = [...r.history, { date, count }];
            return { ...r, streams: r.streams + count, history: newHistory };
          }
          return r;
        })
      })),
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      updateFields: (fields) => set({ fields }),
      addField: (field) => set((state) => ({ fields: [...state.fields, { ...field, id: Date.now() }] })),
      deleteField: (id) => set((state) => ({ fields: state.fields.filter(f => f.id !== id) })),
      updateStatuses: (statuses) => set({ statuses }),
      updateLoginConfig: (config) => set({ loginPageConfig: config }),
      updateHomeConfig: (config) => set({ homePageConfig: config }),
      updateAdminConfig: (config) => set({ adminPanelConfig: config }),
      
      addSmartLink: (link) => set((state) => ({ smartLinks: [...state.smartLinks, link] })),
      updateSmartLink: (id, data) => set((state) => ({
        smartLinks: state.smartLinks.map(l => l.id === id ? { ...l, ...data } : l)
      })),
      deleteSmartLink: (id) => set((state) => ({
        smartLinks: state.smartLinks.filter(l => l.id !== id)
      })),
      updateLabelSocials: (socials) => set({ labelSocials: socials }),
    }),
    { name: 'zhurba-db-v7' }
  )
);

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'zhurba-auth-v7' }
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