import { createCrudStore } from '@/store/create-crud-store';
import { seedBestellungen } from './data';
import type { Bestellung } from './types';

export const useBestellungen = createCrudStore<Bestellung>('kfz.bestellungen', seedBestellungen);

export function bestellungById(id: string): Bestellung | undefined {
  return useBestellungen.getState().items.find((b) => b.id === id);
}

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
