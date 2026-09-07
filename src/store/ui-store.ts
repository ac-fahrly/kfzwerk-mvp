import { create } from 'zustand';

type UiState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  toggleMobileNav: () => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  toggleCommand: () => void;
  listQuery: string;
  setListQuery: (v: string) => void;
  firstMatchPath: string | null;
  setFirstMatchPath: (v: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  commandOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
  toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),
  listQuery: '',
  setListQuery: (v) => set({ listQuery: v }),
  firstMatchPath: null,
  setFirstMatchPath: (v) => set({ firstMatchPath: v }),
}));
