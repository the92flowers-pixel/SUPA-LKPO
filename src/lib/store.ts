import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  settings: any;
  homePageConfig: any;
  adminPanelConfig: any;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  settings: {},
  homePageConfig: {},
  adminPanelConfig: {},

  updateSettings: (settings) => set({ settings }),
  updateHomeConfig: (homePageConfig) => set({ homePageConfig }),
  updateAdminConfig: (adminPanelConfig) => set({ adminPanelConfig }),
}));