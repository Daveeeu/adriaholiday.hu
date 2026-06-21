import { create } from 'zustand';

type UiState = {
  mobileSidebarOpen: boolean;
  desktopSidebarCollapsed: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleDesktopSidebar: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  mobileSidebarOpen: false,
  desktopSidebarCollapsed: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleDesktopSidebar: () =>
    set((state) => ({
      desktopSidebarCollapsed: !state.desktopSidebarCollapsed,
    })),
}));
