import { createCrudStore } from '@/store/create-crud-store';
import { seedRechnungen } from './data';
import type { Rechnung } from './types';

export const useRechnungen = createCrudStore<Rechnung>('kfz.rechnungen', seedRechnungen);

export function rechnungById(id: string): Rechnung | undefined {
  return useRechnungen.getState().items.find((r) => r.id === id);
}

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
