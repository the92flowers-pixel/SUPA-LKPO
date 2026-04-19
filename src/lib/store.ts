import { create } from 'zustand';
import { supabase, toAppProfile, AppUser, Release, SmartLink, ArtistWebsite, Transaction, WithdrawalRequest, QuarterlyReport, Status, Field, LabelSocial } from './supabase';

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
  addRelease: (releaseData: any) => Promise<Release | null>;
  updateRelease: (id: string, releaseData: any) => Promise<Release | null>;
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
  updateLoginConfig: (config: any) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  updateHomeConfig: (config: any) => Promise<void>;
  updateAdminConfig: (config: any) => Promise<void>;
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
  settings: { siteName: "ЖУРБА MUSIC", registrationEnabled: true, contactEmail: "support@jurba.music" },
  homePageConfig: { heroTitle: "Твоя музика. Твоя влада.", heroSubtitle: "Дистрибуція нового покоління.", buttonText: "Приєднатися", primaryColor: "#ef4444" },
  adminPanelConfig: { logoText: "ЖУРБА", accentColor: "#ef4444" },
  loginPageConfig: { logoText: "ЖУРБА MUSIC", welcomeTitle: "Ласкаво просимо", welcomeSubtitle: "Увійдіть", socialIcons: ["Spotify", "Apple Music"] },
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
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addRelease: async (releaseData) => {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) throw new Error('Unauthorized');
      
      const insertData = {
        ...releaseData,
        user_id: sessionData.user.id,
        release_date: releaseData.releaseDate,
        cover_url: releaseData.coverUrl,
        release_url: releaseData.releaseUrl,
        is_single: releaseData.isSingle,
      };
      
      delete insertData.releaseDate;
      delete insertData.coverUrl;
      delete insertData.releaseUrl;
      delete insertData.isSingle;

      const { data, error } = await supabase.from('releases').insert(insertData).select().single();
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
        };
        set((state) => ({ releases: [mapped, ...state.releases] }));
        return mapped;
      }
      return null;
    } catch (e) { throw e; }
  },

  updateRelease: async (id, releaseData) => {
    try {
      const updateData: any = {
        ...releaseData,
        release_date: releaseData.releaseDate,
        cover_url: releaseData.coverUrl,
        release_url: releaseData.releaseUrl,
        is_single: releaseData.isSingle,
      };
      
      delete updateData.id;
      delete updateData.userId;
      delete updateData.releaseDate;
      delete updateData.coverUrl;
      delete updateData.releaseUrl;
      delete updateData.isSingle;
      delete updateData.createdAt;

      const { data, error } = await supabase.from('releases').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        const mapped: Release = {
          ...data,
          userId: data.user_id,
          releaseDate: data.release_date,
          coverUrl: data.cover_url,
          releaseUrl: data.release_url,
          createdAt: data.created_at,
          isSingle: data.is_single,
        };
        set((state) => ({ releases: state.releases.map(r => r.id === id ? mapped : r) }));
        return mapped;
      }
      return null;
    } catch (e) { return null; }
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

  fetchSmartLinks: async (userId) => {
    try {
      let query = supabase.from('smart_links').select('*');
      if (userId) query = query.eq('user_id', userId);
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
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) return;
      const insertData = {
        ...linkData,
        user_id: sessionData.user.id,
        release_id: linkData.releaseId,
        cover_url: linkData.coverUrl,
      };
      delete (insertData as any).releaseId;
      delete (insertData as any).coverUrl;

      const { data, error } = await supabase.from('smart_links').insert(insertData).select().single();
      if (!error && data) {
        set((state) => ({ smartLinks: [...state.smartLinks, {
          ...data,
          userId: data.user_id,
          releaseId: data.release_id,
          coverUrl: data.cover_url,
          createdAt: data.created_at,
        }] }));
      }
    } catch (e) { console.error(e); }
  },

  updateSmartLink: async (id, linkData) => {
    try {
      const updateData = {
        ...linkData,
        release_id: linkData.releaseId,
        cover_url: linkData.coverUrl,
      };
      delete (updateData as any).releaseId;
      delete (updateData as any).coverUrl;

      const { data, error } = await supabase.from('smart_links').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? {
          ...data,
          userId: data.user_id,
          releaseId: data.release_id,
          coverUrl: data.cover_url,
          createdAt: data.created_at,
        } : l) }));
      }
    } catch (e) { console.error(e); }
  },

  deleteSmartLink: async (id) => {
    try {
      await supabase.from('smart_links').delete().eq('id', id);
      set((state) => ({ smartLinks: state.smartLinks.filter(l => l.id !== id) }));
    } catch (e) { console.error(e); }
  },

  fetchArtistWebsites: async (userId) => {
    try {
      let query = supabase.from('artist_websites').select('*');
      if (userId) query = query.eq('user_id', userId);
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
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) return;
      const insertData = {
        ...websiteData,
        user_id: sessionData.user.id,
        title: websiteData.stageName,
        photo_url: websiteData.photoUrl,
      };
      delete (insertData as any).stageName;
      delete (insertData as any).photoUrl;

      const { data, error } = await supabase.from('artist_websites').insert(insertData).select().single();
      if (!error && data) {
        set((state) => ({ artistWebsites: [...state.artistWebsites, {
          ...data,
          userId: data.user_id,
          stageName: data.title,
          photoUrl: data.photo_url,
          createdAt: data.created_at,
        }] }));
      }
    } catch (e) { console.error(e); }
  },

  updateArtistWebsite: async (id, websiteData) => {
    try {
      const updateData = {
        ...websiteData,
        title: websiteData.stageName,
        photo_url: websiteData.photoUrl,
      };
      delete (updateData as any).stageName;
      delete (updateData as any).photoUrl;

      const { data, error } = await supabase.from('artist_websites').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? {
          ...data,
          userId: data.user_id,
          stageName: data.title,
          photoUrl: data.photo_url,
          createdAt: data.created_at,
        } : s) }));
      }
    } catch (e) { console.error(e); }
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
      
      // Handle dynamic profile fields
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
      // 1. Insert transaction
      const { data, error } = await supabase.from('transactions').insert({
        user_id: txData.userId,
        amount: txData.amount,
        type: txData.type,
        status: txData.status || 'completed',
        description: txData.description
      }).select().single();

      if (!error && data) {
        // 2. Update user balance in profiles
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
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) return;
      
      // 1. Create request
      const insertData = {
        user_id: sessionData.user.id,
        amount: reqData.amount,
        contact_info: reqData.contactInfo,
        confirmation_agreed: reqData.confirmationAgreed,
        status: 'pending'
      };

      const { data, error } = await supabase.from('withdrawal_requests').insert(insertData).select().single();
      
      if (!error && data) {
        // 2. Deduct balance immediately
        const user = get().users.find(u => u.id === sessionData.user.id);
        const newBalance = (user?.balance || 0) - reqData.amount;
        await get().updateUser(sessionData.user.id, { balance: newBalance });

        // 3. Add to transactions
        await get().addTransaction({
          userId: sessionData.user.id,
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
      
      // If rejected, return funds to user
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
        await supabase.from('statuses').update({ name: s.name, color: s.color, sort_order: s.order, is_default: s.isDefault }).eq('id', s.id);
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
      if (!error && data) set((state) => ({ fields: [...state.fields, { id: data.id, name: data.name, label: data.label, type: data.type, required: data.required, section: data.section, order: data.sort_order, visible: data.visible, options: data.options }] }));
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
          homePageConfig: data.home_page || { heroTitle: "Твоя музика. Твоя влада.", heroSubtitle: "Дистрибуція нового покоління.", buttonText: "Приєднатися", primaryColor: "#ef4444" },
          adminPanelConfig: data.admin_panel || { logoText: "ЖУРБА", accentColor: "#ef4444" },
          loginPageConfig: data.login_page || { logoText: "ЖУРБА MUSIC", welcomeTitle: "Ласкаво просимо", welcomeSubtitle: "Увійдіть", socialIcons: [] },
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
}));