import { createCrudStore } from '@/store/create-crud-store';
import { seedMahnungen } from './data';
import type { Mahnung } from './types';

export const useMahnungen = createCrudStore<Mahnung>('kfz.mahnungen', seedMahnungen);

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
