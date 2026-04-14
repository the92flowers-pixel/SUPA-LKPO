import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

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

interface DataState {
  adminPanelConfig: any;
  updateAdminConfig: (config: any) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      adminPanelConfig: {
        sidebarColor: "#000000",
        accentColor: "#b91c1c",
        logoText: "ЖУРБА"
      },
      updateAdminConfig: (config) => set({ adminPanelConfig: config }),
    }),
    { name: 'zhurba-settings-supabase' }
  )
);