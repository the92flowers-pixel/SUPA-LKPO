import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialStatuses, initialFields, initialLoginPageContent } from './mockData';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'admin_adjust';
  status: 'pending' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  contactInfo: string;
  confirmationAgreed: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminComment?: string;
  createdAt: string;
}

interface QuarterlyReport {
  id: string;
  userId: string;
  quarter: number;
  year: number;
  fileUrl: string;
  fileName?: string;
  createdAt: string;
}

interface User {
  id: string;
  login: string;
  role: 'admin' | 'artist';
  artistName?: string;
  balance: number;
  isVerified: boolean;
  createdAt: string;
  [key: string]: any;
}

interface SocialLink {
  id: string;
  name: string;
  url: string;
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
  smartLinks: any[];
  artistWebsites: any[];
  labelSocials: SocialLink[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  quarterlyReports: QuarterlyReport[];
  
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
  addStatus: (status: any) => void;
  deleteStatus: (id: number) => void;
  updateLoginConfig: (config: any) => void;
  updateHomeConfig: (config: any) => void;
  updateAdminConfig: (config: any) => void;
  addSmartLink: (link: any) => void;
  updateSmartLink: (id: string, data: Partial<any>) => void;
  deleteSmartLink: (id: string) => void;
  addArtistWebsite: (website: any) => void;
  updateArtistWebsite: (id: string, data: Partial<any>) => void;
  deleteArtistWebsite: (id: string) => void;
  updateLabelSocials: (socials: SocialLink[]) => void;

  // Finance Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateWithdrawalStatus: (id: string, status: WithdrawalRequest['status'], comment?: string) => void;
  
  // Reports Actions
  addReport: (report: Omit<QuarterlyReport, 'id' | 'createdAt'>) => void;
  deleteReport: (id: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      users: [
        { id: '1', login: 'admin', role: 'admin', artistName: 'Адмін', balance: 0, isVerified: true, createdAt: new Date().toISOString() },
        { id: '2', login: 'artist@demo.com', role: 'artist', artistName: 'Demo Artist', balance: 1250, isVerified: false, createdAt: new Date().toISOString() }
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
      homePageConfig: {
        heroTitle: "МУЗИКА ТВОЄЇ ДУШІ.",
        heroSubtitle: "Ми — прихисток для справжнього мистецтва. 150+ платформ, 100% роялті та повна свобода самовираження.",
        buttonText: "Почати шлях",
        primaryColor: "#b91c1c",
      },
      adminPanelConfig: {
        sidebarColor: "#000000",
        accentColor: "#b91c1c",
        logoText: "ЖУРБА"
      },
      smartLinks: [],
      artistWebsites: [],
      labelSocials: [
        { id: '1', name: 'Instagram', url: 'https://instagram.com/zhurba' },
        { id: '2', name: 'Telegram', url: 'https://t.me/zhurba' }
      ],
      transactions: [],
      withdrawalRequests: [],
      quarterlyReports: [],

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
      addStatus: (status) => set((state) => ({ statuses: [...state.statuses, { ...status, id: Date.now() }] })),
      deleteStatus: (id) => set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) })),
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
      addArtistWebsite: (website) => set((state) => ({ artistWebsites: [...state.artistWebsites, website] })),
      updateArtistWebsite: (id, data) => set((state) => ({
        artistWebsites: state.artistWebsites.map(w => w.id === id ? { ...w, ...data } : w)
      })),
      deleteArtistWebsite: (id) => set((state) => ({
        artistWebsites: state.artistWebsites.filter(w => w.id !== id)
      })),
      updateLabelSocials: (socials) => set({ labelSocials: socials }),

      // Finance Actions
      addTransaction: (t) => set((state) => {
        const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
        const updatedUsers = state.users.map(u => {
          if (u.id === t.userId) {
            const amount = t.type === 'withdrawal' ? -t.amount : t.amount;
            return { ...u, balance: u.balance + amount };
          }
          return u;
        });
        return { 
          transactions: [newTransaction, ...state.transactions],
          users: updatedUsers
        };
      }),

      addWithdrawalRequest: (req) => set((state) => {
        const newReq = { 
          ...req, 
          id: Math.random().toString(36).substr(2, 9), 
          status: 'pending' as const, 
          createdAt: new Date().toISOString() 
        };
        
        const updatedUsers = state.users.map(u => 
          u.id === req.userId ? { ...u, balance: u.balance - req.amount } : u
        );

        const newTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          userId: req.userId,
          amount: req.amount,
          type: 'withdrawal' as const,
          status: 'pending' as const,
          description: 'Заявка на вивід коштів',
          createdAt: new Date().toISOString()
        };

        return { 
          withdrawalRequests: [newReq, ...state.withdrawalRequests],
          users: updatedUsers,
          transactions: [newTransaction, ...state.transactions]
        };
      }),

      updateWithdrawalStatus: (id, status, comment) => set((state) => {
        const req = state.withdrawalRequests.find(r => r.id === id);
        if (!req) return state;

        let updatedUsers = [...state.users];
        let updatedTransactions = [...state.transactions];

        if (status === 'rejected') {
          updatedUsers = state.users.map(u => 
            u.id === req.userId ? { ...u, balance: u.balance + req.amount } : u
          );
          
          updatedTransactions = state.transactions.map(t => 
            (t.userId === req.userId && t.amount === req.amount && t.status === 'pending') 
            ? { ...t, status: 'cancelled' as const } 
            : t
          );
        } else if (status === 'paid') {
          updatedTransactions = state.transactions.map(t => 
            (t.userId === req.userId && t.amount === req.amount && t.status === 'pending') 
            ? { ...t, status: 'completed' as const } 
            : t
          );
        }

        return {
          withdrawalRequests: state.withdrawalRequests.map(r => 
            r.id === id ? { ...r, status, adminComment: comment } : r
          ),
          users: updatedUsers,
          transactions: updatedTransactions
        };
      }),

      // Reports Actions
      addReport: (report) => set((state) => ({
        quarterlyReports: [...state.quarterlyReports, { ...report, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }]
      })),
      deleteReport: (id) => set((state) => ({
        quarterlyReports: state.quarterlyReports.filter(r => r.id !== id)
      })),
    }),
    { 
      name: 'zhurba-db-v12',
      // Only persist non-sensitive configuration data
      partialize: (state) => ({
        statuses: state.statuses,
        fields: state.fields,
        settings: state.settings,
        loginPageConfig: state.loginPageConfig,
        homePageConfig: state.homePageConfig,
        adminPanelConfig: state.adminPanelConfig,
        labelSocials: state.labelSocials,
      }),
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
      name: 'zhurba-auth-v12',
      // Only persist the current user's basic info, never passwords
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          login: state.user.login,
          role: state.user.role,
          artistName: state.user.artistName,
          isVerified: state.user.isVerified,
        } : null,
        token: state.token,
      }),
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