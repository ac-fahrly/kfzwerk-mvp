import { create } from 'zustand';
import { emptyBusinessSettings, type BusinessSettings } from './types';

const STORAGE_KEY = 'kfz.business';

function load(): BusinessSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBusinessSettings;
    const parsed = JSON.parse(raw) as Partial<BusinessSettings>;
    return { ...emptyBusinessSettings, ...parsed };
  } catch {
    return emptyBusinessSettings;
  }
}

type State = {
  business: BusinessSettings;
  save: (b: BusinessSettings) => void;
};

export const useBusinessSettings = create<State>()((set) => ({
  business: load(),
  save: (b) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    set({ business: b });
  },
}));

export function getBusinessSettings(): BusinessSettings {
  return useBusinessSettings.getState().business;
}

export function hasBusinessSettings(): boolean {
  return getBusinessSettings().name.trim().length > 0;
}
