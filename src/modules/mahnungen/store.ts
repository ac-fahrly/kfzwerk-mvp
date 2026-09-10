import { api } from '@/lib/api';
import { createApiStore } from '@/store/create-api-store';
import type { Mahnung } from './types';

/** Mahnungen — backed by `GET/POST/PATCH/DELETE /api/dunning`. */
export const useMahnungen = createApiStore<Mahnung>(api.dunning);

/**
 * Next dunning number for the current year, derived from what this client has
 * loaded. The API enforces uniqueness per workshop.
 */
export function nextMahnNummer(): string {
  const items = useMahnungen.getState().items;
  const year = new Date().getFullYear();
  const nums = items
    .map((m) => m.nummer)
    .filter((n) => n.startsWith(`M-${year}-`))
    .map((n) => parseInt(n.split('-')[2] ?? '0', 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `M-${year}-${String(next).padStart(4, '0')}`;
}
