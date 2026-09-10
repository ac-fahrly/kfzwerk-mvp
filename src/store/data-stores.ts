import { useBestellungen } from '@/modules/bestellungen/store';
import { useKunden } from '@/modules/kunden/store';
import { useMahnungen } from '@/modules/mahnungen/store';
import { useRechnungen } from '@/modules/rechnungen/store';
import { useTeile } from '@/modules/teile/store';
import { useTermine } from '@/modules/termine/store';

/**
 * The registry of backend-backed data stores, so sign-in and sign-out can
 * load and clear all of them in one place.
 *
 * Every list, detail view and dashboard KPI reads from these stores, and the
 * dashboard needs all six at once, so the app loads the whole working set on
 * sign-in rather than per route. For a single workshop's data that is a handful
 * of small requests; when a dataset outgrows that, the fix is per-route
 * hydration, not a client-side cache.
 */
const stores = [useKunden, useTeile, useBestellungen, useRechnungen, useTermine, useMahnungen];

/**
 * Load every store. Runs in parallel and NEVER throws: a rejected request
 * leaves that store empty (its `loaded` stays false) rather than blocking the
 * whole app on one failure. A 401 has already triggered the sign-out path via
 * the axios interceptor.
 *
 * Returns how many stores failed, so the caller can say so — an empty list
 * that is actually a failed request must not look like an empty workshop.
 */
export async function hydrateAll(): Promise<number> {
  const results = await Promise.allSettled(
    stores.map((store) => store.getState().hydrate()),
  );
  return results.filter((r) => r.status === 'rejected').length;
}

/** Drop every row from memory. Called on sign-out and before a new sign-in, so
 * one account can never see the previous account's data. */
export function resetAll(): void {
  for (const store of stores) store.getState().reset();
}
