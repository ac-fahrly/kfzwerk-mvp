import { create, type StoreApi, type UseBoundStore } from 'zustand';

/**
 * The backend-backed replacement for `create-crud-store`.
 *
 * The public surface is deliberately the SAME as the old localStorage store —
 * `items`, `add`, `update`, `remove`, `replaceAll` — so every List/Detail/Form
 * component keeps working untouched. What changed:
 *
 *  - `items` starts EMPTY and is filled by `hydrate()` (called once after
 *    sign-in, see `./data-stores`). There is no seed data in the client any
 *    more; the demo dataset lives in the database (`npm run seed` on the API).
 *  - the mutators are async and OPTIMISTIC: the change lands in `items`
 *    immediately, the request follows, and a failure ROLLS BACK and rethrows.
 *    Call sites await them and only toast success once the server agreed —
 *    otherwise the row would silently reappear on the next reload.
 *  - nothing is persisted to localStorage. The database is the single source of
 *    truth; persisting a copy here would resurrect deleted rows and mask
 *    another user's edits.
 */
export interface ApiResource<T extends { id: string }> {
  list: () => Promise<T[]>;
  create: (item: T) => Promise<T>;
  update: (id: string, patch: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<{ id: string }>;
}

export interface ApiState<T extends { id: string }> {
  items: T[];
  /** A request is in flight for the initial load. */
  loading: boolean;
  /** `hydrate()` has completed at least once — lets a list tell "empty" from
   * "not loaded yet". */
  loaded: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  add: (item: T) => Promise<T>;
  update: (id: string, patch: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  replaceAll: (items: T[]) => void;
}

export function createApiStore<T extends { id: string }>(
  resource: ApiResource<T>,
  /** Runs after any successful mutation. Used by orders, whose stock movements
   * change the parts catalogue server-side. */
  onMutated?: () => void,
): UseBoundStore<StoreApi<ApiState<T>>> {
  return create<ApiState<T>>()((set, get) => ({
    items: [],
    loading: false,
    loaded: false,

    hydrate: async () => {
      set({ loading: true });
      try {
        const items = await resource.list();
        set({ items, loaded: true });
      } finally {
        set({ loading: false });
      }
    },

    reset: () => set({ items: [], loaded: false, loading: false }),

    add: async (item) => {
      // Newest first, matching the old store's insertion order.
      set((s) => ({ items: [item, ...s.items] }));
      try {
        const saved = await resource.create(item);
        // Swap in the server's canonical row: it carries the normalisation the
        // API applies (optional fields dropped, numbers coerced).
        set((s) => ({ items: s.items.map((it) => (it.id === item.id ? saved : it)) }));
        onMutated?.();
        return saved;
      } catch (err) {
        set((s) => ({ items: s.items.filter((it) => it.id !== item.id) }));
        throw err;
      }
    },

    update: async (id, patch) => {
      const before = get().items.find((it) => it.id === id);
      set((s) => ({
        items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      }));
      try {
        const saved = await resource.update(id, patch);
        set((s) => ({ items: s.items.map((it) => (it.id === id ? saved : it)) }));
        onMutated?.();
        return saved;
      } catch (err) {
        if (before) {
          set((s) => ({ items: s.items.map((it) => (it.id === id ? before : it)) }));
        }
        throw err;
      }
    },

    remove: async (id) => {
      const index = get().items.findIndex((it) => it.id === id);
      const before = index >= 0 ? get().items[index] : undefined;
      set((s) => ({ items: s.items.filter((it) => it.id !== id) }));
      try {
        await resource.remove(id);
        onMutated?.();
      } catch (err) {
        // Restore at the original position so the list does not jump.
        if (before) {
          set((s) => {
            const items = s.items.slice();
            items.splice(Math.min(index, items.length), 0, before);
            return { items };
          });
        }
        throw err;
      }
    },

    replaceAll: (items) => set({ items }),
  }));
}
