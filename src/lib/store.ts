import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialStatuses, initialFields, initialLoginPageContent } from './mockData';

interface User {
  id: string;
  login: string;
  password?: string;
  role: 'admin' | 'artist';
  artistName?: string;
  createdAt: string;
}

interface Release {
  id: string;
  userId: string;
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  coverUrl: string;
  audioUrl: string;
  status: string;
  streams: number;
  createdAt: string;
}

interface DataState {
  users: User[];
  releases: Release[];
  statuses: any[];
  fields: any[];
  settings: any;
  loginPageConfig: any;
  
  // Actions
  addUser: (user: User) => void;
  addRelease: (release: Omit<Release, 'id' | 'createdAt' | 'streams'>) => void;
  updateReleaseStatus: (id: string, status: string) => void;
  updateSettings: (settings: any) => void;
  updateFields: (fields: any[]) => void;
  updateStatuses: (statuses: any[]) => void;
  updateLoginConfig: (config: any) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      users: [
        { id: '1', login: 'admin', role: 'admin', artistName: 'Адмін', createdAt: new Date().toISOString() }
      ],
      releases: [],
      statuses: initialStatuses,
      fields: initialFields,
      settings: {
        siteName: 'ЖУРБА MUSIC',
        contactEmail: 'support@zhurba.music',
        registrationEnabled: true,
      },
      loginPageConfig: initialLoginPageContent,

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      
      addRelease: (release) => set((state) => ({ 
        releases: [
          ...state.releases, 
          { 
            ...release, 
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            streams: 0
          }
        ] 
      })),

      updateReleaseStatus: (id, status) => set((state) => ({
        releases: state.releases.map(r => r.id === id ? { ...r, status } : r)
      })),

      updateSettings: (settings) => set({ settings }),
      updateFields: (fields) => set({ fields }),
      updateStatuses: (statuses) => set({ statuses }),
      updateLoginConfig: (config) => set({ loginPageConfig: config }),
    }),
    {
      name: 'zhurba-db',
    }
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
    {
      name: 'zhurba-auth',
    }
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