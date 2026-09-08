import { useMemo } from 'react';
import { useBestellungen } from '@/modules/bestellungen/store';
import type { Bestellung } from '@/modules/bestellungen/types';
import { useRechnungen } from '@/modules/rechnungen/store';
import { offenerBetrag } from '@/modules/rechnungen/types';
import { useMahnungen } from '@/modules/mahnungen/store';
import { useTermine } from '@/modules/termine/store';

export const RESERVED_STATUSES = new Set(['neu', 'in_arbeit', 'wartet_auf_teile']);
export const CONSUMED_STATUSES = new Set(['fertig', 'abgeholt']);

export function useBestellungenForCustomer(customerId: string) {
  const items = useBestellungen((s) => s.items);
  return useMemo(() => items.filter((b) => b.customerId === customerId), [items, customerId]);
}

export function useBestellungenForVehicle(vehicleId: string) {
  const items = useBestellungen((s) => s.items);
  return useMemo(() => items.filter((b) => b.vehicleId === vehicleId), [items, vehicleId]);
}

export function useRechnungenForCustomer(customerId: string) {
  const items = useRechnungen((s) => s.items);
  return useMemo(() => items.filter((r) => r.customerId === customerId), [items, customerId]);
}

export function useRechnungForBestellung(bestellungId: string) {
  const items = useRechnungen((s) => s.items);
  return useMemo(() => items.find((r) => r.bestellungId === bestellungId), [items, bestellungId]);
}

export function useMahnungenForCustomer(customerId: string) {
  const items = useMahnungen((s) => s.items);
  return useMemo(() => items.filter((m) => m.customerId === customerId), [items, customerId]);
}

export function useMahnungenForRechnung(rechnungId: string) {
  const items = useMahnungen((s) => s.items);
  return useMemo(() => items.filter((m) => m.rechnungId === rechnungId), [items, rechnungId]);
}

export function useTermineForCustomer(customerId: string) {
  const items = useTermine((s) => s.items);
  return useMemo(() => items.filter((t) => t.customerId === customerId), [items, customerId]);
}

export function useTermineForVehicle(vehicleId: string) {
  const items = useTermine((s) => s.items);
  return useMemo(() => items.filter((t) => t.vehicleId === vehicleId), [items, vehicleId]);
}

export function useReservedForPart(teilId: string): number {
  const items = useBestellungen((s) => s.items);
  return useMemo(() => {
    let sum = 0;
    for (const b of items) {
      if (!RESERVED_STATUSES.has(b.status)) continue;
      for (const p of b.positionen) {
        if (p.kind === 'teil' && p.teilId === teilId) sum += p.menge;
      }
    }
    return sum;
  }, [items, teilId]);
}

export function useConsumingBestellungenForPart(teilId: string): Bestellung[] {
  const items = useBestellungen((s) => s.items);
  return useMemo(
    () =>
      items.filter((b) =>
        b.positionen.some((p) => p.kind === 'teil' && p.teilId === teilId) &&
        (RESERVED_STATUSES.has(b.status) || CONSUMED_STATUSES.has(b.status)),
      ),
    [items, teilId],
  );
}

export function useOpenAmountForCustomer(customerId: string) {
  const items = useRechnungen((s) => s.items);
  return useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const r of items) {
      if (r.customerId !== customerId) continue;
      if (r.status === 'entwurf' || r.status === 'bezahlt') continue;
      sum += offenerBetrag(r);
      count += 1;
    }
    return { sum, count };
  }, [items, customerId]);
}
