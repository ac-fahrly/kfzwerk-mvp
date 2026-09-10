import { api } from '@/lib/api';
import { createApiStore } from '@/store/create-api-store';
import type { Rechnung } from './types';

/** Rechnungen — backed by `GET/POST/PATCH/DELETE /api/invoices`. */
export const useRechnungen = createApiStore<Rechnung>(api.invoices);

export function rechnungById(id: string): Rechnung | undefined {
  return useRechnungen.getState().items.find((r) => r.id === id);
}

/**
 * Next invoice number for the current year, derived from what this client has
 * loaded. The API enforces uniqueness per workshop, so a second browser
 * creating the same number gets a 409 rather than a duplicate.
 */
export function nextRechnungNummer(): string {
  const items = useRechnungen.getState().items;
  const year = new Date().getFullYear();
  const nums = items
    .map((r) => r.nummer)
    .filter((n) => n.startsWith(`R-${year}-`))
    .map((n) => parseInt(n.split('-')[2] ?? '0', 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `R-${year}-${String(next).padStart(4, '0')}`;
}
