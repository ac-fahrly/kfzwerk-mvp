import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useTeile } from '@/modules/teile/store';
import { seedBestellungen } from './data';
import type { Bestellung } from './types';

const CONSUMED_STATUSES = new Set(['fertig', 'abgeholt']);

function stockDelta(before: Bestellung | null, after: Bestellung | null): Map<string, number> {
  const delta = new Map<string, number>();
  const wasConsumed = before && CONSUMED_STATUSES.has(before.status);
  const isConsumed = after && CONSUMED_STATUSES.has(after.status);
  if (wasConsumed) {
    for (const p of before.positionen) {
      if (p.kind === 'teil' && p.teilId) delta.set(p.teilId, (delta.get(p.teilId) ?? 0) + p.menge);
    }
  }
  if (isConsumed) {
    for (const p of after.positionen) {
      if (p.kind === 'teil' && p.teilId) delta.set(p.teilId, (delta.get(p.teilId) ?? 0) - p.menge);
    }
  }
  return delta;
}

function applyStockDelta(delta: Map<string, number>) {
  const teile = useTeile.getState();
  for (const [teilId, change] of delta) {
    if (change === 0) continue;
    const t = teile.items.find((x) => x.id === teilId);
    if (t) teile.update(teilId, { bestand: t.bestand + change });
  }
}

type State = {
  items: Bestellung[];
  add: (b: Bestellung) => void;
  update: (id: string, patch: Partial<Bestellung>) => void;
  remove: (id: string) => void;
  replaceAll: (items: Bestellung[]) => void;
};

export const useBestellungen = create<State>()(
  persist(
    (set, get) => ({
      items: seedBestellungen,
      add: (b) => {
        const delta = stockDelta(null, b);
        set((s) => ({ items: [b, ...s.items] }));
        applyStockDelta(delta);
      },
      update: (id, patch) => {
        const before = get().items.find((x) => x.id === id) ?? null;
        const after: Bestellung | null = before ? { ...before, ...patch } : null;
        const delta = stockDelta(before, after);
        set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
        applyStockDelta(delta);
      },
      remove: (id) => {
        const before = get().items.find((x) => x.id === id) ?? null;
        const delta = stockDelta(before, null);
        set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
        applyStockDelta(delta);
      },
      replaceAll: (items) => set({ items }),
    }),
    { name: 'kfz.bestellungen', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

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
