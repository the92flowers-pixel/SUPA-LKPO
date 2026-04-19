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
  addRelease: (releaseData: Partial<Release>) => Promise<Release | null>;
  updateRelease: (id: string, releaseData: Partial<Release>) => Promise<Release | null>;
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
  homePageConfig: { heroTitle: "Твоя музыка. Твоя власть.", heroSubtitle: "Дистрибуция нового поколения.", buttonText: "Присоединиться", primaryColor: "#ef4444" },
  adminPanelConfig: { logoText: "ЖУРБА", accentColor: "#ef4444" },
  loginPageConfig: { logoText: "ЖУРБА MUSIC", welcomeTitle: "Добро пожаловать", welcomeSubtitle: "Войдите", socialIcons: ["Spotify", "Apple Music"] },
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
      
      if (role !== 'admin' && userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Fetch releases error:', error);
        return;
      }
      
      if (data) {
        const mappedReleases = data.map(r => ({
          id: r.id,
          userId: r.user_id,
          artist: r.artist || r.title?.split(' - ')[0] || '',
          genre: r.genre || 'Другое',
          releaseDate: r.release_date || new Date().toISOString().split('T')[0],
          coverUrl: r.cover_url || '',
          status: r.status || 'На модерації',
          streams: r.streams || 0,
          history: r.history || [],
          createdAt: r.created_at,
          composer: r.composer || '',
          performer: r.performer || '',
          label: r.label || '',
          description: r.description || '',
          explicit: r.explicit || false,
          isSingle: r.is_single !== undefined ? r.is_single : true,
          isrc: r.isrc || '',
          tracks: r.tracks || [],
          releaseUrl: r.release_url || '',
        }));
        
        set({ releases: mappedReleases });
      }
    } catch (e) {
      console.error('Fetch releases exception:', e);
    }
  },

  addRelease: async (releaseData) => {
    console.log('=== ADD RELEASE STORE ===');
    console.log('Input data:', releaseData);
    
    try {
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Не вдалося отримати сесію користувача');
      }
      
      if (!sessionData?.user) {
        console.error('No user in session');
        throw new Error('Користувач не авторизований');
      }
      
      console.log('User ID:', sessionData.user.id);
      
      const defaultStatus = get().statuses.find(s => s.isDefault)?.name || 'На модерації';
      console.log('Default status:', defaultStatus);
      
      const insertData = {
        user_id: sessionData.user.id,
        title: releaseData.title || '',
        artist: releaseData.artist || '',
        genre: releaseData.genre || 'Другое',
        release_date: releaseData.releaseDate || new Date().toISOString().split('T')[0],
        cover_url: releaseData.coverUrl || '',
        release_url: releaseData.releaseUrl || '',
        status: releaseData.status || defaultStatus,
        streams: 0,
        history: [],
        composer: releaseData.composer || '',
        performer: releaseData.performer || '',
        label: releaseData.label || '',
        description: releaseData.description || '',
        explicit: releaseData.explicit || false,
        is_single: releaseData.isSingle !== undefined ? releaseData.isSingle : true,
        isrc: releaseData.isrc || '',
        tracks: releaseData.tracks || [],
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('releases')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Insert error:', error);
        throw new Error(error.message || 'Помилка при збереженні релізу');
      }
      
      console.log('Insert result:', data);
      
      if (data) {
        const mapped: Release = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          artist: data.artist || '',
          genre: data.genre || 'Другое',
          releaseDate: data.release_date,
          coverUrl: data.cover_url || '',
          releaseUrl: data.release_url || '',
          status: data.status,
          streams: data.streams || 0,
          history: data.history || [],
          createdAt: data.created_at,
          composer: data.composer || '',
          performer: data.performer || '',
          label: data.label || '',
          description: data.description || '',
          explicit: data.explicit || false,
          isSingle: data.is_single !== undefined ? data.is_single : true,
          isrc: data.isrc || '',
          tracks: data.tracks || [],
        };
        
        console.log('Mapped release:', mapped);
        
        set((state) => ({ releases: [mapped, ...state.releases] }));
        console.log('Release added to store');
        return mapped;
      }
      
      return null;
    } catch (e) {
      console.error('Add release exception:', e);
      throw e; // Re-throw to let component handle it
    }
  },

  updateRelease: async (id, releaseData) => {
    try {
      const updateData: any = {};
      
      if (releaseData.title !== undefined) updateData.title = releaseData.title;
      if (releaseData.artist !== undefined) updateData.artist = releaseData.artist;
      if (releaseData.genre !== undefined) updateData.genre = releaseData.genre;
      if (releaseData.coverUrl !== undefined) updateData.cover_url = releaseData.coverUrl;
      if (releaseData.releaseUrl !== undefined) updateData.release_url = releaseData.releaseUrl;
      if (releaseData.releaseDate !== undefined) updateData.release_date = releaseData.releaseDate;
      if (releaseData.status !== undefined) updateData.status = releaseData.status;
      if (releaseData.composer !== undefined) updateData.composer = releaseData.composer;
      if (releaseData.performer !== undefined) updateData.performer = releaseData.performer;
      if (releaseData.label !== undefined) updateData.label = releaseData.label;
      if (releaseData.description !== undefined) updateData.description = releaseData.description;
      if (releaseData.explicit !== undefined) updateData.explicit = releaseData.explicit;

      const { data, error } = await supabase
        .from('releases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Update release error:', error);
        return null;
      }
      
      if (data) {
        const mapped: Release = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          artist: data.artist || '',
          genre: data.genre || 'Другое',
          releaseDate: data.release_date,
          coverUrl: data.cover_url || '',
          releaseUrl: data.release_url || '',
          status: data.status,
          streams: data.streams || 0,
          history: data.history || [],
          createdAt: data.created_at,
          composer: data.composer || '',
          performer: data.performer || '',
          label: data.label || '',
          description: data.description || '',
          explicit: data.explicit || false,
          isSingle: data.is_single !== undefined ? data.is_single : true,
          isrc: data.isrc || '',
          tracks: data.tracks || [],
        };
        
        set((state) => ({ releases: state.releases.map(r => r.id === id ? mapped : r) }));
        return mapped;
      }
      
      return null;
    } catch (e) {
      console.error('Update release exception:', e);
      return null;
    }
  },

  updateReleaseStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('Update status error:', error);
        return;
      }
      
      set((state) => ({ 
        releases: state.releases.map(r => r.id === id ? { ...r, status } : r) 
      }));
    } catch (e) {
      console.error('Update status exception:', e);
    }
  },

  updateReleaseStreams: async (id, count, date) => {
    try {
      const release = get().releases.find(r => r.id === id);
      if (!release) return;
      
      const newHistory = [...(release.history || []), { date, count }];
      
      const { error } = await supabase
        .from('releases')
        .update({ streams: release.streams + count, history: newHistory })
        .eq('id', id);
      
      if (!error) {
        set((state) => ({ 
          releases: state.releases.map(r => r.id === id ? { ...r, streams: r.streams + count, history: newHistory } : r) 
        }));
      }
    } catch (e) {
      console.error('Update streams exception:', e);
    }
  },

  deleteRelease: async (id) => {
    try {
      await supabase.from('releases').delete().eq('id', id);
      set((state) => ({ releases: state.releases.filter(r => r.id !== id) }));
    } catch (e) {
      console.error('Delete release exception:', e);
    }
  },

  fetchSmartLinks: async (userId) => {
    try {
      let query = supabase.from('smart_links').select('*');
      if (userId) query = query.eq('user_id', userId);
      
      const { data, error } = await query;
      if (!error && data) {
        set({ smartLinks: data.map(l => ({
          id: l.id,
          userId: l.user_id,
          releaseId: l.release_id,
          title: l.title || '',
          artist: l.artist || '',
          coverUrl: l.cover_url || '',
          slug: l.slug || '',
          platforms: l.platforms || [],
          clicks: l.clicks || 0,
          createdAt: l.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addSmartLink: async (linkData) => {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) return;
      
      const { data, error } = await supabase
        .from('smart_links')
        .insert({ ...linkData, user_id: sessionData.user.id })
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({ smartLinks: [...state.smartLinks, {
          id: data.id,
          userId: data.user_id,
          releaseId: data.release_id,
          title: data.title || '',
          artist: data.artist || '',
          coverUrl: data.cover_url || '',
          slug: data.slug || '',
          platforms: data.platforms || [],
          clicks: data.clicks || 0,
          createdAt: data.created_at,
        }] }));
      }
    } catch (e) { console.error(e); }
  },

  updateSmartLink: async (id, linkData) => {
    try {
      const { data, error } = await supabase
        .from('smart_links')
        .update(linkData)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({ smartLinks: state.smartLinks.map(l => l.id === id ? {
          id: data.id,
          userId: data.user_id,
          releaseId: data.release_id,
          title: data.title || '',
          artist: data.artist || '',
          coverUrl: data.cover_url || '',
          slug: data.slug || '',
          platforms: data.platforms || [],
          clicks: data.clicks || 0,
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
          id: w.id,
          userId: w.user_id,
          slug: w.slug || '',
          stageName: w.title || w.slug || '',
          bio: w.bio || '',
          photoUrl: w.photo_url || '',
          links: w.links || [],
          createdAt: w.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addArtistWebsite: async (websiteData) => {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) return;
      
      const { data, error } = await supabase
        .from('artist_websites')
        .insert({ ...websiteData, user_id: sessionData.user.id })
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({ artistWebsites: [...state.artistWebsites, {
          id: data.id,
          userId: data.user_id,
          slug: data.slug || '',
          stageName: data.title || data.slug || '',
          bio: data.bio || '',
          photoUrl: data.photo_url || '',
          links: data.links || [],
          createdAt: data.created_at,
        }] }));
      }
    } catch (e) { console.error(e); }
  },

  updateArtistWebsite: async (id, websiteData) => {
    try {
      const { data, error } = await supabase
        .from('artist_websites')
        .update(websiteData)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({ artistWebsites: state.artistWebsites.map(s => s.id === id ? {
          id: data.id,
          userId: data.user_id,
          slug: data.slug || '',
          stageName: data.title || data.slug || '',
          bio: data.bio || '',
          photoUrl: data.photo_url || '',
          links: data.links || [],
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
      if (!error && data) {
        set({ users: data.map(p => toAppProfile(p)) });
      }
    } catch (e) { console.error(e); }
  },

  updateUser: async (id, userData) => {
    try {
      const dbData: any = {};
      if (userData.artistName !== undefined) dbData.full_name = userData.artistName;
      if (userData.artistName !== undefined) dbData.artist_name = userData.artistName;
      if (userData.role !== undefined) dbData.role = userData.role;
      if (userData.isVerified !== undefined) dbData.is_verified = userData.isVerified;
      if (userData.bio !== undefined) dbData.bio = userData.bio;
      
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
          id: t.id,
          userId: t.user_id,
          type: t.type,
          amount: t.amount,
          description: t.description || '',
          status: t.status,
          createdAt: t.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addTransaction: async (txData) => {
    try {
      const { data, error } = await supabase.from('transactions').insert(txData).select().single();
      if (!error && data) {
        set((state) => ({ transactions: [{
          id: data.id,
          userId: data.user_id,
          type: data.type,
          amount: data.amount,
          description: data.description || '',
          status: data.status,
          createdAt: data.created_at,
        }, ...state.transactions] }));
      }
    } catch (e) { console.error(e); }
  },

  fetchWithdrawalRequests: async () => {
    try {
      const { data, error } = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        set({ withdrawalRequests: data.map(r => ({
          id: r.id,
          userId: r.user_id,
          amount: r.amount,
          status: r.status,
          contactInfo: r.contact_info,
          confirmationAgreed: r.confirmation_agreed,
          admin_comment: r.admin_comment,
          createdAt: r.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addWithdrawalRequest: async (reqData) => {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) return;
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({ 
          ...reqData, 
          user_id: sessionData.user.id,
          contact_info: reqData.contactInfo,
          confirmation_agreed: reqData.confirmationAgreed
        })
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({ withdrawalRequests: [{
          id: data.id,
          userId: data.user_id,
          amount: data.amount,
          status: data.status,
          contactInfo: data.contact_info,
          confirmationAgreed: data.confirmation_agreed,
          admin_comment: data.admin_comment,
          createdAt: data.created_at,
        }, ...state.withdrawalRequests] }));
      }
    } catch (e) { console.error(e); }
  },

  updateWithdrawalStatus: async (id, status, comment) => {
    try {
      await supabase.from('withdrawal_requests').update({ status, admin_comment: comment }).eq('id', id);
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
          id: r.id,
          userId: r.user_id,
          quarter: r.quarter,
          year: r.year,
          fileUrl: r.file_url || '',
          fileName: r.file_name || '',
          createdAt: r.created_at,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  addReport: async (reportData) => {
    try {
      const { data, error } = await supabase.from('quarterly_reports').insert(reportData).select().single();
      if (!error && data) {
        set((state) => ({ quarterlyReports: [{
          id: data.id,
          userId: data.user_id,
          quarter: data.quarter,
          year: data.year,
          fileUrl: data.file_url || '',
          fileName: data.file_name || '',
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
      if (!error && data) {
        set({ statuses: data.map(s => ({
          id: s.id,
          name: s.name,
          color: s.color,
          order: s.sort_order || 0,
          isDefault: s.is_default || false,
        })) });
      }
    } catch (e) { console.error(e); }
  },

  updateStatuses: async (statuses) => set({ statuses }),

  addStatus: async (status) => {
    try {
      const { data, error } = await supabase.from('statuses').insert({
        name: status.name,
        color: status.color,
        sort_order: status.order,
        is_default: status.isDefault,
      }).select().single();
      
      if (!error && data) {
        set((state) => ({ statuses: [...state.statuses, {
          id: data.id,
          name: data.name,
          color: data.color,
          order: data.sort_order || 0,
          isDefault: data.is_default || false,
        }] }));
      }
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
      if (!error && data) {
        set({ fields: data.map(f => ({
          id: f.id,
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required || false,
          section: f.section || 'release',
          order: f.sort_order || 0,
          visible: f.visible !== false,
          options: f.options || '',
          fileTypes: f.file_types || '',
          maxSize: f.max_size || '5',
        })) });
      }
    } catch (e) { console.error(e); }
  },

  updateFields: async (fields) => set({ fields }),

  addField: async (field) => {
    try {
      const { data, error } = await supabase.from('fields').insert({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        section: field.section,
        sort_order: field.order,
        visible: field.visible,
        options: field.options || '',
        file_types: field.fileTypes || '',
        max_size: field.maxSize || '5',
      }).select().single();
      
      if (!error && data) {
        set((state) => ({ fields: [...state.fields, {
          id: data.id,
          name: data.name,
          label: data.label,
          type: data.type,
          required: data.required || false,
          section: data.section || 'release',
          order: data.sort_order || 0,
          visible: data.visible !== false,
          options: data.options || '',
          fileTypes: data.file_types || '',
          maxSize: data.max_size || '5',
        }] }));
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
          homePageConfig: data.home_page || { heroTitle: "Твоя музыка. Твоя власть.", heroSubtitle: "Дистрибуция нового поколения.", buttonText: "Присоединиться", primaryColor: "#ef4444" },
          adminPanelConfig: data.admin_panel || { logoText: "ЖУРБА", accentColor: "#ef4444" },
          loginPageConfig: data.login_page || { logoText: "ЖУРБА MUSIC", welcomeTitle: "Добро пожаловать", welcomeSubtitle: "Войдите", socialIcons: [] },
          labelSocials: (data.label_socials || []).map((s: any) => ({
            id: s.id || Date.now().toString(),
            name: s.name || s.platform,
            url: s.url || '',
          })),
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