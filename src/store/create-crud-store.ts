import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CrudState<T extends { id: string }> = {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  replaceAll: (items: T[]) => void;
};

export function createCrudStore<T extends { id: string }>(
  storageKey: string,
  seed: T[],
): UseBoundStore<StoreApi<CrudState<T>>> {
  return create<CrudState<T>>()(
    persist(
      (set) => ({
        items: seed,
        add: (item) => set((s) => ({ items: [item, ...s.items] })),
        update: (id, patch) =>
          set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
        remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
        replaceAll: (items) => set({ items }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        version: 1,
      },
    ),
  );
}
