import { api } from '@/lib/api';
import { useTeile } from '@/modules/teile/store';
import { createApiStore } from '@/store/create-api-store';
import type { Bestellung } from './types';

/**
 * Bestellungen — backed by `GET/POST/PATCH/DELETE /api/orders`.
 *
 * The stock bookkeeping this store used to do (subtract a part's quantity once
 * an order reaches `fertig`/`abgeholt`, add it back when it leaves that state)
 * now lives in the API, inside the same transaction as the order write — see
 * `stockDelta` in the backend's `orders.service.ts`. The shelf is shared
 * state: two browsers editing the same order would each have applied the
 * movement locally, and a failed request would have left stock wrong with no
 * way to notice.
 *
 * So all this side of it does is refresh the parts catalogue afterwards, so the
 * Teile list and the low-stock KPI show the levels the server just wrote.
 */
export const useBestellungen = createApiStore<Bestellung>(api.orders, () => {
  // Fire-and-forget: the order mutation has already succeeded, and a failed
  // refresh only means slightly stale stock numbers until the next load.
  void useTeile.getState().hydrate();
});

export function bestellungById(id: string): Bestellung | undefined {
  return useBestellungen.getState().items.find((b) => b.id === id);
}

/**
 * Next order number for the current year, derived from what this client has
 * loaded. The API enforces uniqueness per workshop.
 */
export function nextBestellNummer(): string {
  const items = useBestellungen.getState().items;
  const year = new Date().getFullYear();
  const nums = items
    .map((b) => b.nummer)
    .filter((n) => n.startsWith(`B-${year}-`))
    .map((n) => parseInt(n.split('-')[2] ?? '0', 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `B-${year}-${String(next).padStart(4, '0')}`;
}
