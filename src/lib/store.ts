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
  updateUser: (id: string, data: Partial<User>) => void;
  addRelease: (release: Omit<Release, 'id' | 'createdAt' | 'streams'>) => void;
  updateReleaseStatus: (id: string, status: string) => void;
  updateReleaseStreams: (id: string, count: number) => void;
  updateSettings: (settings: any) => void;
  updateFields: (fields: any[]) => void;
  updateStatuses: (statuses: any[]) => void;
  updateLoginConfig: (config: any) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      users: [
        { id: '1', login: 'admin', role: 'admin', artistName: 'Адмін', createdAt: new Date().toISOString() },
        { id: '2', login: 'artist@demo.com', role: 'artist', artistName: 'Demo Artist', createdAt: new Date().toISOString() }
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
          audioUrl: '', 
          status: 'Опубліковано', 
          streams: 12540, 
          createdAt: new Date().toISOString() 
        },
        { 
          id: 'r2', 
          userId: '2', 
          title: 'Neon Dreams', 
          artist: 'Demo Artist', 
          genre: 'Pop', 
          releaseDate: '2024-06-01', 
          coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80', 
          audioUrl: '', 
          status: 'На модерації', 
          streams: 0, 
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

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      
      updateUser: (id, data) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
      })),

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

      updateReleaseStreams: (id, count) => set((state) => ({
        releases: state.releases.map(r => r.id === id ? { ...r, streams: r.streams + count } : r)
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