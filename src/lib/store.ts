import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialStatuses, initialFields, initialLoginPageContent } from './mockData';

interface StreamHistory {
  date: string;
  count: number;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'royalty' | 'payout';
  description: string;
  date: string;
}

interface User {
  id: string;
  login: string;
  password?: string;
  role: 'admin' | 'artist';
  artistName?: string;
  balance: number;
  createdAt: string;
  [key: string]: any;
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
  history: StreamHistory[];
  createdAt: string;
  [key: string]: any;
}

interface DataState {
  users: User[];
  releases: Release[];
  transactions: Transaction[];
  statuses: any[];
  fields: any[];
  settings: any;
  loginPageConfig: any;
  
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  addRelease: (release: any) => void;
  updateReleaseStatus: (id: string, status: string) => void;
  updateReleaseStreams: (id: string, count: number, date: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateSettings: (settings: any) => void;
  updateFields: (fields: any[]) => void;
  updateStatuses: (statuses: any[]) => void;
  updateLoginConfig: (config: any) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      users: [
        { id: '1', login: 'admin', role: 'admin', artistName: 'Адмін', balance: 0, createdAt: new Date().toISOString() },
        { id: '2', login: 'artist@demo.com', role: 'artist', artistName: 'Demo Artist', balance: 1250.50, createdAt: new Date().toISOString() }
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
          history: [
            { date: '2024-05-01', count: 1200 },
            { date: '2024-05-10', count: 4500 },
            { date: '2024-05-20', count: 6840 }
          ],
          createdAt: new Date().toISOString() 
        }
      ],
      transactions: [
        { id: 't1', userId: '2', amount: 1250.50, type: 'royalty', description: 'Роялті за травень 2024', date: '2024-06-01' }
      ],
      statuses: initialStatuses,
      fields: initialFields,
      settings: {
        siteName: 'ЖУРБА MUSIC',
        contactEmail: 'support@zhurba.music',
        registrationEnabled: true,
        maintenanceMode: false
      },
      loginPageConfig: initialLoginPageContent,

      addUser: (user) => set((state) => ({ users: [...state.users, { ...user, balance: 0 }] })),
      
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
            streams: 0,
            history: []
          }
        ] 
      })),

      updateReleaseStatus: (id, status) => set((state) => ({
        releases: state.releases.map(r => r.id === id ? { ...r, status } : r)
      })),

      updateReleaseStreams: (id, count, date) => set((state) => ({
        releases: state.releases.map(r => {
          if (r.id === id) {
            const existingDateIndex = r.history.findIndex(h => h.date === date);
            let newHistory = [...r.history];
            if (existingDateIndex >= 0) newHistory[existingDateIndex].count += count;
            else {
              newHistory.push({ date, count });
              newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
            return { ...r, streams: r.streams + count, history: newHistory };
          }
          return r;
        })
      })),

      addTransaction: (tx) => set((state) => {
        const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
        return {
          transactions: [newTx, ...state.transactions],
          users: state.users.map(u => u.id === tx.userId 
            ? { ...u, balance: u.balance + (tx.type === 'royalty' ? tx.amount : -tx.amount) } 
            : u
          )
        };
      }),

      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      updateFields: (fields) => set({ fields }),
      updateStatuses: (statuses) => set({ statuses }),
      updateLoginConfig: (config) => set({ loginPageConfig: config }),
    }),
    {
      name: 'zhurba-db-v4',
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
      name: 'zhurba-auth-v4',
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