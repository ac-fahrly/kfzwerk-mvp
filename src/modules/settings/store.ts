import { create } from 'zustand';
import { api } from '@/lib/api';
import { emptyBusinessSettings, type BusinessSettings } from './types';

/**
 * Einstellungen — backed by `GET/PUT /api/settings/business`.
 *
 * Like `kunden/store.ts` this is hand-rolled rather than built on
 * `createApiStore`: the workshop profile is a SINGLETON, not `items: T[]`, and
 * `ApiResource` demands `list(): Promise<T[]>` plus a `/:id` for every write.
 * The server identifies the row by the session, so there is no id here at all.
 *
 * Everything else matches the other stores: `hydrate()` runs once after
 * sign-in via `hydrateAll()`, `reset()` clears on sign-out, and `save()` is
 * optimistic — it applies the change immediately, rolls back and RETHROWS on
 * failure, so the call site awaits it and only toasts success once the server
 * agreed.
 *
 * Nothing is persisted to the browser any more. The previous build kept the
 * profile in `localStorage['kfz.business']`; that blob is now only READ once,
 * by the settings page, to offer it as a prefill — see
 * `legacyBusinessSettings()` below — and is deleted as soon as it is provably
 * redundant, which means the server holds a profile.
 */
type SettingsState = {
  business: BusinessSettings;
  /** A request is in flight for the initial load. */
  loading: boolean;
  /** `hydrate()` has completed at least once — lets the page tell "no profile
   * saved yet" from "the load failed". */
  loaded: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  save: (b: BusinessSettings) => Promise<void>;
};

const LEGACY_KEY = 'kfz.business';

/** Drop the pre-API copy. Wrapped because localStorage throws in private mode
 * and when site data is blocked, and losing the profile is not worth a crash. */
function forgetLegacy(): void {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* nothing we can do, and nothing depends on it */
  }
}

export const useBusinessSettings = create<SettingsState>()((set, get) => ({
  business: emptyBusinessSettings,
  loading: false,
  loaded: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const business = await api.settings.getBusiness();
      set({ business, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    // Drop the legacy blob ONLY when the server demonstrably holds a profile —
    // then it is a stale duplicate, and leaving an IBAN and a Steuernummer in a
    // shared browser for whoever signs in next is the greater risk.
    //
    // When the server has nothing, this blob is the workshop's ONLY copy of
    // twelve hand-typed fields. `reset()` runs on sign-out, before every
    // sign-in and on any 401, so deleting it unconditionally would destroy that
    // copy the first time a token expired — before the user ever saw the
    // migration notice on the settings page.
    if (get().business.name) forgetLegacy();
    set({ business: emptyBusinessSettings, loaded: false, loading: false });
  },

  save: async (b) => {
    const before = get().business;
    set({ business: b });
    try {
      const saved = await api.settings.saveBusiness(b);
      set({ business: saved, loaded: true });
      // The server now holds these values; the browser copy has no reason to
      // survive and every reason not to.
      forgetLegacy();
    } catch (err) {
      set({ business: before });
      throw err;
    }
  },
}));

/**
 * Values a previous build left in THIS BROWSER. Read only by `SettingsPage`,
 * and only while the server profile is still empty, to prefill the form once so
 * a workshop that already typed its letterhead does not have to retype it.
 * Nothing else may read this, and it never reaches an invoice — the invoice
 * carries its own snapshot from the server.
 *
 * Accepted residual risk: the old build recorded no account with the blob, so
 * on a shared browser account B can be offered values account A typed and never
 * saved. It is offered as a PREFILL behind an explicit "check these and save"
 * notice, never adopted silently and never printed on a document, and it
 * disappears the moment either account saves a profile.
 *
 * Delete this function, its call site and the import notice once every workshop
 * has saved its profile server-side.
 */
export function legacyBusinessSettings(): BusinessSettings | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return { ...emptyBusinessSettings, ...(JSON.parse(raw) as Partial<BusinessSettings>) };
  } catch {
    return null;
  }
}
