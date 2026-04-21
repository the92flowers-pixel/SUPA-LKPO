import { create } from 'zustand';
import { supabase, toAppProfile, AppUser, Release, SmartLink, ArtistWebsite, Transaction, WithdrawalRequest, QuarterlyReport, Status, Field, LabelSocial, Task } from './supabase';

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
  tasks: Task[];
  settings: { siteName: string; registrationEnabled: boolean; contactEmail: string };
  homePageConfig: { heroTitle: string; heroSubtitle: string; buttonText: string; primaryColor: string };
  adminPanelConfig: { logoText: string; accentColor: string };
  loginPageConfig: { logoText: string; welcomeTitle: string; welcomeSubtitle: string; socialIcons: string[] };
  isLoading: boolean;

  init: () => Promise<void>;
  fetchReleases: (userId?: string, role?: string) => Promise<void>;
  addRelease: (releaseData: any) => Promise<Release | null>;
  updateRelease: (id: string, releaseData: any) => Promise<Release | null>;
  updateReleaseStatus: (id: string, status: string) => Promise<void>;
  updateReleaseStreams: (id: string, count: number, date: string) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;
  fetchSmartLinks: (userId?: string, role?: string) => Promise<void>;
  addSmartLink: (linkData: Partial<SmartLink>) => Promise<SmartLink | null>;
  updateSmartLink: (id: string, linkData: Partial<SmartLink>) => Promise<SmartLink | null>;
  incrementSmartLinkClicks: (id: string) => Promise<void>;
  deleteSmartLink: (id: string) => Promise<void>;
  fetchArtistWebsites: (userId?: string, role?: string) => Promise<void>;
  addArtistWebsite: (websiteData: Partial<ArtistWebsite>) => Promise<ArtistWebsite | null>;
  updateArtistWebsite: (id: string, websiteData: Partial<ArtistWebsite>) => Promise<ArtistWebsite | null>;
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
  updateLoginConfig: (config: any) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  updateHomeConfig: (config: any) => Promise<void>;
  updateAdminConfig: (config: any) => Promise<void>;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const DEFAULT_GENRES = [
  'Hip-Hop / Rap', 'R&B', 'Pop', 'Rock', 'Electronic / EDM', 'Jazz', 'Classical',
  'Country', 'Latin', 'Metal', 'Indie', 'Alternative', 'Folk', 'Blues', 'Reggae',
  'Soundtrack', 'World', 'Dance', 'Drill', 'UK Drill', 'Afro', 'Amapiano', 'Phonk',
  'Lo-Fi', 'Trap', 'Grime', 'Другое'
];

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
  tasks: [],
  settings: { siteName: "ЖУРБА MUSIC", registrationEnabled: true, contactEmail: "support@jurba.music" },
  homePageConfig: { heroTitle: "Твоя музика. Скрізь.", heroSubtitle: "Дистрибуція на 150+ платформ.", buttonText: "Почати", primaryColor: "#ef4444" },
  adminPanelConfig: { logoText: "ЖУРБА", accentColor: "#ef4444" },
  loginPageConfig: { logoText: "ЖУРБА MUSIC", welcomeTitle: "Ласкаво просимо", welcomeSubtitle: "Увійдіть, щоб продовжити", socialIcons: ["Spotify", "Apple Music"] },
  isLoading: true,

  init: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        get().fetchConfig(),
        get().fetchStatuses(),
        get().fetchFields(),
      ]);
    } catch (e) {
      console.error('Init error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReleases: async (userId, role) => {
    try {
      let query = supabase.from('releases').select('*').order('created_at', { ascending: false });
      if (role !== 'admin' && userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        set({ releases: data.map(r => ({
          ...r,
          userId: r.user_id,
          releaseDate: r.release_date,
          coverUrl: r.cover_url,
          releaseUrl: r.release_url,
          createdAt: r.created_at,
          isSingle: r.is_single,
          copyrightConfirmed: r.copyright_confirmed,
          distributor: r.distributor,
          rejection_reason: r.rejection_reason
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addRelease: async (releaseData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');
      
      // Core fields
      const dbData: any = {
        user_id: user.id,
        title: releaseData.title,
        artist: releaseData.artist,
        genre: releaseData.genre,
        release_date: releaseData.releaseDate,
        cover_url: releaseData.coverUrl,
        composer: releaseData.composer,
        performer: releaseData.performer,
        label: releaseData.label,
        description: releaseData.description,
        explicit: !!releaseData.explicit,
        is_single: !!releaseData.isSingle,
        isrc: releaseData.isrc || null,
        upc: releaseData.upc || null,
        release_url: releaseData.releaseUrl || null,
        copyrights: releaseData.copyrights,
        copyright_confirmed: !!releaseData.copyrightConfirmed,
        tracks: releaseData.tracks || [],
        status: releaseData.status || 'На модерації',
        streams: 0,
        history: [],
        distributor: releaseData.distributor || null
      };

      // Add dynamic fields
      const releaseFields = get().fields.filter(f => f.section === 'release');
      releaseFields.forEach(f => {
        if (releaseData[f.name] !== undefined) {
          dbData[f.name] = releaseData[f.name];
        }
      });

      const { data, error } = await supabase.from('releases').insert(dbData).select().single();
      
      if (error) throw error;

      if (data) {
        const mapped: Release = {
          ...data,
          userId: data.user_id,
          releaseDate: data.release_date,
          coverUrl: data.cover_url,
          releaseUrl: data.release_url,
          createdAt: data.created_at,
          isSingle: data.is_single,
          copyrightConfirmed: data.copyright_confirmed,
          distributor: data.distributor
        };
        set((state) => ({ releases: [mapped, ...state.releases] }));
        return mapped;
      }
      return null;
    } catch (e) { 
      console.error('Add Release Error:', e);
      throw e; 
    }
  },

  updateRelease: async (id, releaseData) => {
    try {
      const dbData: any = {
        title: releaseData.title,
        artist: releaseData.artist,
        genre: releaseData.genre,
        release_date: releaseData.releaseDate,
        cover_url: releaseData.coverUrl,
        composer: releaseData.composer,
        performer: releaseData.performer,
        label: releaseData.label,
        description: releaseData.description,
        explicit: !!releaseData.explicit,
        is_single: !!releaseData.isSingle,
        isrc: releaseData.isrc || null,
        upc: releaseData.upc || null,
        release_url: releaseData.releaseUrl || null,
        copyrights: releaseData.copyrights,
        copyright_confirmed: !!releaseData.copyrightConfirmed,
        tracks: releaseData.tracks || [],
        status: releaseData.status,
        distributor: releaseData.distributor,
        rejection_reason: releaseData.rejection_reason || null
      };

      // Add dynamic fields
      const releaseFields = get().fields.filter(f => f.section === 'release');
      releaseFields.forEach(f => {
        if (releaseData[f.name] !== undefined) {
          dbData[f.name] = releaseData[f.name];
        }
      });

      const { data, error } = await supabase.from('releases').update(dbData).eq('id', id).select().single();
      
      if (error) throw error;

      if (data) {
        const mapped: Release = {
          ...data,
          userId: data.user_id,
          releaseDate: data.release_date,
          coverUrl: data.cover_url,
          releaseUrl: data.release_url,
          createdAt: data.created_at,
          isSingle: data.is_single,
          copyrightConfirmed: data.copyright_confirmed,
          distributor: data.distributor,
          rejection_reason: data.rejection_reason
        };
        set((state) => ({ releases: state.releases.map(r => r.id === id ? mapped : r) }));
        return mapped;
      }
      return null;
    } catch (e) { 
      console.error('Update Release Error:', e);
      return null; 
    }
  },

  updateReleaseStatus: async (id, status) => {
    try {
      await supabase.from('releases').update({ status }).eq('id', id);
      set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, status } : r) }));
    } catch (e) { console.error(e); }
  },

  updateReleaseStreams: async (id, count, date) => {
    try {
      const release = get().releases.find(r => r.id === id);
      if (!release) return;
      const newHistory = [...(release.history || []), { date, count }];
      const newTotal = (release.streams || 0) + count;
      await supabase.from('releases').update({ streams: newTotal, history: newHistory }).eq('id', id);
      set((state) => ({ releases: state.releases.map(r => r.id === id ? { ...r, streams: newTotal, history: newHistory } : r) }));
    } catch (e) { console.error(e); }
  },

  deleteRelease: async (id) => {
    try {
      await supabase.from('releases').delete().eq('id', id);
      set((state) => ({ releases: state.releases.filter(r => r.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchSmartLinks: async (userId, role) => {
    try {
      let query = supabase.from('smart_links').select('*');
      if (role !== 'admin' && userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        set({ smartLinks: data.map(l => ({
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const insertData = {
        user_id: user.id,
        release_id: linkData.releaseId,
        slug: linkData.slug,
        title: linkData.title,
        artist: linkData.artist,
        cover_url: linkData.coverUrl,
        platforms: linkData.platforms,
        clicks: 0
      };

      const { data, error } = await supabase.from('smart_links').insert(insertData).select().single();
      if (!error && data) {
        const mapped: SmartLink = {
          ...data,
          userId: data.user_id,
          releaseId: data.release_id,
          coverUrl: data.cover_url,
          createdAt: data.created_at,
        };
        set((state) => ({ smartLinks: [...state.smartLinks, mapped] }));
        return mapped;
      }
      return null;
    } catch (e) { console.error(e); return null; }
  },

  updateSmartLink: async (id, linkData) => {
    try {
      const updateData = {
        slug: linkData.slug,
        title: linkData.title,
        artist: linkData.artist,
        cover_url: linkData.coverUrl,
        platforms: linkData.platforms
      };

      const { data, error } = await supabase.from('smart_links').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        const mapped: SmartLink = {
          ...data,
          userId: data.user_id,
          releaseId: data.release_id,
          coverUrl: data.cover_url,
          createdAt: data.created_at,
        };
        set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? mapped : l) }));
        return mapped;
      }
      return null;
    } catch (e) { console.error(e); return null; }
  },

  incrementSmartLinkClicks: async (id) => {
    try {
      const link = get().smartLinks.find(l => l.id === id);
      if (!link) return;
      const newClicks = (link.clicks || 0) + 1;
      await supabase.from('smart_links').update({ clicks: newClicks }).eq('id', id);
      set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? { ...l, clicks: newClicks } : l) }));
    } catch (e) { console.error(e); }
  },

  deleteSmartLink: async (id) => {
    try {
      await supabase.from('smart_links').delete().eq('id', id);
      set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchArtistWebsites: async (userId, role) => {
    try {
      let query = supabase.from('artist_websites').select('*');
      if (role !== 'admin' && userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        set({ artistWebsites: data.map(w => ({
          ...w,
          userId: w.user_id,
          stageName: w.title || w.slug || '',
          photoUrl: w.photo_url,
          createdAt: w.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addArtistWebsite: async (websiteData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const insertData = {
        user_id: user.id,
        title: websiteData.stageName,
        slug: websiteData.slug,
        bio: websiteData.bio,
        photo_url: websiteData.photoUrl,
        links: websiteData.links
      };

      const { data, error } = await supabase.from('artist_websites').insert(insertData).select().single();
      if (!error && data) {
        const mapped: ArtistWebsite = {
          ...data,
          userId: data.user_id,
          stageName: data.title,
          photoUrl: data.photo_url,
          createdAt: data.created_at,
        };
        set((state) => ({ artistWebsites: [...state.artistWebsites, mapped] }));
        return mapped;
      }
      return null;
    } catch (e) { console.error(e); return null; }
  },

  updateArtistWebsite: async (id, websiteData) => {
    try {
      const updateData = {
        title: websiteData.stageName,
        slug: websiteData.slug,
        bio: websiteData.bio,
        photo_url: websiteData.photoUrl,
        links: websiteData.links
      };

      const { data, error } = await supabase.from('artist_websites').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        const mapped: ArtistWebsite = {
          ...data,
          userId: data.user_id,
          stageName: data.title,
          photoUrl: data.photo_url,
          createdAt: data.created_at,
        };
        set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? mapped : s) }));
        return mapped;
      }
      return null;
    } catch (e) { console.error(e); return null; }
  },

  deleteArtistWebsite: async (id) => {
    try {
      await supabase.from('artist_websites').delete().eq('id', id);
      set((state) => ({ artistWebsites: state.artistWebsites.filter(s => s.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchUsers: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) set({ users: data.map(p => toAppProfile(p)) });
    } catch (e) { console.error(e); }
  },

  updateUser: async (id, userData) => {
    try {
      const dbData: any = {};
      if (userData.artistName !== undefined) { dbData.full_name = userData.artistName; dbData.artist_name = userData.artistName; }
      if (userData.role !== undefined) dbData.role = userData.role;
      if (userData.isVerified !== undefined) dbData.is_verified = userData.isVerified;
      if (userData.bio !== undefined) dbData.bio = userData.bio;
      if (userData.balance !== undefined) dbData.balance = userData.balance;
      
      const profileFields = get().fields.filter(f => f.section === 'profile');
      profileFields.forEach(f => {
        if ((userData as any)[f.name] !== undefined) {
          dbData[f.name] = (userData as any)[f.name];
        }
      });

      const { data, error } = await supabase.from('profiles').update(dbData).eq('id', id).select().single();
      if (!error && data) {
        const appUser = toAppProfile(data);
        set((state) => ({ users: state.users.map(u => u.id === id ? appUser : u) }));
      }
    } catch (e) { console.error(e); }
  },

  deleteUser: async (id) => {
    try {
      await supabase.from('profiles').delete().eq('id', id);
      set((state) => ({ users: state.users.filter(u => u.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchTransactions: async (userId) => {
    try {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        set({ transactions: data.map(t => ({
          ...t,
          userId: t.user_id,
          createdAt: t.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addTransaction: async (txData) => {
    try {
      const { data, error } = await supabase.from('transactions').insert({
        user_id: txData.userId,
        amount: txData.amount,
        type: txData.type,
        status: txData.status || 'completed',
        description: txData.description
      }).select().single();

      if (!error && data) {
        const user = get().users.find(u => u.id === txData.userId);
        const currentBalance = user?.balance || 0;
        const newBalance = txData.type === 'deposit' ? currentBalance + txData.amount : currentBalance - txData.amount;
        
        await get().updateUser(txData.userId, { balance: newBalance });

        set((state) => ({ 
          transactions: [{
            ...data,
            userId: data.user_id,
            createdAt: data.created_at,
          }, ...state.transactions] 
        }));
      }
    } catch (e) { console.error(e); }
  },

  fetchWithdrawalRequests: async () => {
    try {
      const { data, error } = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        set({ withdrawalRequests: data.map(r => ({
          ...r,
          userId: r.user_id,
          contactInfo: r.contact_info,
          confirmationAgreed: r.confirmation_agreed,
          createdAt: r.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addWithdrawalRequest: async (reqData) => {
    try {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      if (!sessionUser) return;
      
      const insertData = {
        user_id: sessionUser.id,
        amount: reqData.amount,
        contact_info: reqData.contact_info,
        confirmation_agreed: reqData.confirmation_agreed,
        status: 'pending'
      };

      const { data, error } = await supabase.from('withdrawal_requests').insert(insertData).select().single();
      
      if (!error && data) {
        const user = get().users.find(u => u.id === sessionUser.id);
        const newBalance = (user?.balance || 0) - reqData.amount;
        await get().updateUser(sessionUser.id, { balance: newBalance });

        await get().addTransaction({
          userId: sessionUser.id,
          amount: reqData.amount,
          type: 'withdrawal',
          status: 'pending',
          description: 'Запит на вивід коштів'
        });

        set((state) => ({ 
          withdrawalRequests: [{
            ...data,
            userId: data.user_id,
            contactInfo: data.contact_info,
            confirmationAgreed: data.confirmation_agreed,
            createdAt: data.created_at,
          }, ...state.withdrawalRequests] 
        }));
      }
    } catch (e) { console.error(e); }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    try {
      const req = get().withdrawalRequests.find(r => r.id === id);
      if (!req) return;

      await supabase.from('withdrawal_requests').update({ status, admin_comment: comment }).eq('id', id);
      
      if (status === 'rejected') {
        const user = get().users.find(u => u.id === req.userId);
        const newBalance = (user?.balance || 0) + req.amount;
        await get().updateUser(req.userId, { balance: newBalance });
        
        await get().addTransaction({
          userId: req.userId,
          amount: req.amount,
          type: 'deposit',
          status: 'completed',
          description: `Повернення коштів (Відмова по заявці #${id})`
        });
      }

      set((state) => ({ 
        withdrawalRequests: state.withdrawalRequests.map(r => r.id === id ? { ...r, status, admin_comment: comment } : r) 
      }));
    } catch (e) { console.error(e); }
  },

  fetchReports: async (userId) => {
    try {
      let query = supabase.from('quarterly_reports').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        set({ quarterlyReports: data.map(r => ({
          ...r,
          userId: r.user_id,
          fileUrl: r.file_url,
          fileName: r.file_name,
          createdAt: r.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addReport: async (reportData) => {
    try {
      const insertData = {
        user_id: reportData.userId,
        quarter: reportData.quarter,
        year: reportData.year,
        file_url: reportData.fileUrl,
        file_name: reportData.fileName,
      };

      const { data, error } = await supabase.from('quarterly_reports').insert(insertData).select().single();
      if (!error && data) {
        set((state) => ({ quarterlyReports: [{
          ...data,
          userId: data.user_id,
          fileUrl: data.file_url,
          fileName: data.file_name,
          createdAt: data.created_at,
        }, ...state.quarterlyReports] }));
      }
    } catch (e) { console.error(e); }
  },

  deleteReport: async (id) => {
    try {
      await supabase.from('quarterly_reports').delete().eq('id', id);
      set((state) => ({ quarterlyReports: state.quarterlyReports.filter(r => r.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchStatuses: async () => {
    try {
      const { data, error } = await supabase.from('statuses').select('*').order('sort_order');
      if (!error && data) set({ statuses: data.map(s => ({ id: s.id, name: s.name, color: s.color, order: s.sort_order || 0, isDefault: s.is_default || false })) });
    } catch (e) { console.error(e); }
  },

  updateStatuses: async (statuses) => {
    try {
      for (const s of statuses) {
        await supabase.from('statuses').update({ name: s.name, color: s.color, sort_order: s.order, is_default: s.is_default }).eq('id', s.id);
      }
      set({ statuses });
    } catch (e) { console.error(e); }
  },

  addStatus: async (status) => {
    try {
      const { data, error } = await supabase.from('statuses').insert({ name: status.name, color: status.color, sort_order: status.order, is_default: status.isDefault }).select().single();
      if (!error && data) set((state) => ({ statuses: [...state.statuses, { id: data.id, name: data.name, color: data.color, order: data.sort_order, isDefault: data.is_default }] }));
    } catch (e) { console.error(e); }
  },

  deleteStatus: async (id) => {
    try {
      await supabase.from('statuses').delete().eq('id', id);
      set((state) => ({ statuses: state.statuses.filter(s => s.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchFields: async () => {
    try {
      const { data, error } = await supabase.from('fields').select('*').order('sort_order');
      if (!error && data) set({ fields: data.map(f => ({ id: f.id, name: f.name, label: f.label, type: f.type, required: f.required || false, section: f.section || 'release', order: f.sort_order || 0, visible: f.visible !== false, options: f.options || '', fileTypes: f.file_types || '', maxSize: f.max_size || '5' })) });
    } catch (e) { console.error(e); }
  },

  updateFields: async (fields) => {
    try {
      for (const f of fields) {
        await supabase.from('fields').update({ label: f.label, type: f.type, required: f.required, section: f.section, sort_order: f.order, visible: f.visible, options: f.options }).eq('id', f.id);
      }
      set({ fields });
    } catch (e) { console.error(e); }
  },

  addField: async (field) => {
    try {
      const { data, error } = await supabase.from('fields').insert({ name: field.name, label: field.label, type: field.type, required: field.required, section: field.section, sort_order: field.order, visible: field.visible, options: field.options }).select().single();
      if (!error && data) {
        const mapped = { id: data.id, name: data.name, label: data.label, type: data.type, required: data.required, section: data.section, order: data.sort_order, visible: data.visible, options: data.options };
        set((state) => ({ fields: [...state.fields, mapped] }));
      }
    } catch (e) { console.error(e); }
  },

  deleteField: async (id) => {
    try {
      await supabase.from('fields').delete().eq('id', id);
      set((state) => ({ fields: state.fields.filter(f => f.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchConfig: async () => {
    try {
      const { data, error } = await supabase.from('app_config').select('*').single();
      if (!error && data) {
        set({
          settings: data.settings || { siteName: "ЖУРБА MUSIC", registrationEnabled: true, contactEmail: "support@jurba.music" },
          homePageConfig: data.home_page || { heroTitle: "Твоя музика. Скрізь.", heroSubtitle: "Дистрибуція на 150+ платформ.", buttonText: "Почати", primaryColor: "#ef4444" },
          adminPanelConfig: data.admin_panel || { logoText: "ЖУРБА", accentColor: "#ef4444" },
          loginPageConfig: data.login_page || { logoText: "ЖУРБА MUSIC", welcomeTitle: "Ласкаво просимо", welcomeSubtitle: "Увійдіть, щоб продовжити", socialIcons: [] },
          labelSocials: (data.label_socials || []).map((s: any) => ({ id: s.id || Date.now().toString(), name: s.name || s.platform, url: s.url || '' })),
        });
      }
    } catch (e) { console.error(e); }
  },

  updateLabelSocials: async (labelSocials) => {
    try {
      await supabase.from('app_config').update({ label_socials: labelSocials }).eq('id', 1);
      set({ labelSocials });
    } catch (e) { console.error(e); }
  },

  updateLoginConfig: async (loginPageConfig) => {
    try {
      await supabase.from('app_config').update({ login_page: loginPageConfig }).eq('id', 1);
      set({ loginPageConfig });
    } catch (e) { console.error(e); }
  },

  updateSettings: async (settings) => {
    try {
      await supabase.from('app_config').update({ settings }).eq('id', 1);
      set({ settings });
    } catch (e) { console.error(e); }
  },

  updateHomeConfig: async (homePageConfig) => {
    try {
      await supabase.from('app_config').update({ home_page: homePageConfig }).eq('id', 1);
      set({ homePageConfig });
    } catch (e) { console.error(e); }
  },

  updateAdminConfig: async (adminPanelConfig) => {
    try {
      await supabase.from('app_config').update({ admin_panel: adminPanelConfig }).eq('id', 1);
      set({ adminPanelConfig });
    } catch (e) { console.error(e); }
  },

  fetchTasks: async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (!error && data) set({ tasks: data });
    } catch (e) { console.error(e); }
  },

  addTask: async (taskData) => {
    try {
      const insertData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium'
      };
      const { data, error } = await supabase.from('tasks').insert(insertData).select().single();
      if (error) throw error;
      if (data) set((state) => ({ tasks: [data, ...state.tasks] }));
    } catch (e) { 
      console.error('Add Task Error:', e);
      throw e; 
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const updateData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority
      };
      const { data, error } = await supabase.from('tasks').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      if (data) set((state) => ({ tasks: state.tasks.map(t => t.id === id ? data : t) }));
    } catch (e) { 
      console.error('Update Task Error:', e);
      throw e;
    }
  },

  deleteTask: async (id) => {
    try {
      await supabase.from('tasks').delete().eq('id', id);
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    } catch (e) { console.error(e); }
  },
}));