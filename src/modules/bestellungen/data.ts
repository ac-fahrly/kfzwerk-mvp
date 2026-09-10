// NOT LOADED BY THE APP any more. The workshop's data lives in PostgreSQL
// and arrives through the API (see ../../store/create-api-store.ts).
//
// This file is kept as the SOURCE of the backend demo dataset: it was
// extracted verbatim into kfzwerk-mvp-backend/prisma/seed-data.json, which
// `npm run seed` loads. Edit here, re-extract, and the seeded app still
// matches the prototype.
import type { Bestellung } from './types';

export const seedBestellungen: Bestellung[] = [
  {
    id: 'b-1',
    nummer: 'B-2026-0001',
    customerId: 'c-1',
    vehicleId: 'v-1',
    status: 'in_arbeit',
    eingangDatum: '2026-09-01',
    beschreibung: 'Große Inspektion + Bremsenwechsel vorne',
    positionen: [
      { id: 'p-1a', kind: 'arbeit', bezeichnung: 'Inspektion groß', menge: 2, einheit: 'h', einzelpreis: 95 },
      { id: 'p-1b', kind: 'teil', teilId: 't-4', bezeichnung: 'Motoröl 5W-30 (5 l)', menge: 1, einheit: 'kanne', einzelpreis: 48.9 },
      { id: 'p-1c', kind: 'teil', teilId: 't-5', bezeichnung: 'Ölfilter', menge: 1, einheit: 'Stk', einzelpreis: 14.9 },
      { id: 'p-1d', kind: 'teil', teilId: 't-1', bezeichnung: 'Bremsbeläge vorne (Satz)', menge: 1, einheit: 'Satz', einzelpreis: 68.9 },
      { id: 'p-1e', kind: 'teil', teilId: 't-2', bezeichnung: 'Bremsscheiben vorne (Paar)', menge: 1, einheit: 'Paar', einzelpreis: 119 },
      { id: 'p-1f', kind: 'arbeit', bezeichnung: 'Bremsenwechsel', menge: 1.5, einheit: 'h', einzelpreis: 95 },
    ],
  },
  {
    id: 'b-2',
    nummer: 'B-2026-0002',
    customerId: 'c-2',
    vehicleId: 'v-3',
    status: 'wartet_auf_teile',
    eingangDatum: '2026-09-03',
    beschreibung: 'Zahnriemenwechsel',
    positionen: [
      { id: 'p-2a', kind: 'teil', teilId: 't-22', bezeichnung: 'Zahnriemen-Satz', menge: 1, einheit: 'Satz', einzelpreis: 189 },
      { id: 'p-2b', kind: 'teil', teilId: 't-23', bezeichnung: 'Wasserpumpe', menge: 1, einheit: 'Stk', einzelpreis: 128 },
      { id: 'p-2c', kind: 'arbeit', bezeichnung: 'Zahnriemenwechsel', menge: 4, einheit: 'h', einzelpreis: 95 },
    ],
  },
  {
    id: 'b-3',
    nummer: 'B-2026-0003',
    customerId: 'c-3',
    vehicleId: 'v-4',
    status: 'fertig',
    eingangDatum: '2026-08-28',
    fertigstellungDatum: '2026-09-02',
    beschreibung: 'Reifenwechsel Winter → Sommer',
    positionen: [
      { id: 'p-3a', kind: 'arbeit', bezeichnung: 'Reifen montieren + auswuchten', menge: 4, einheit: 'Stk', einzelpreis: 22 },
    ],
  },
  {
    id: 'b-4',
    nummer: 'B-2026-0004',
    customerId: 'c-4',
    vehicleId: 'v-5',
    status: 'abgeholt',
    eingangDatum: '2026-08-20',
    fertigstellungDatum: '2026-08-22',
    beschreibung: 'Batteriewechsel',
    positionen: [
      { id: 'p-4a', kind: 'teil', teilId: 't-13', bezeichnung: 'Autobatterie 70 Ah', menge: 1, einheit: 'Stk', einzelpreis: 149 },
      { id: 'p-4b', kind: 'arbeit', bezeichnung: 'Einbau Batterie', menge: 0.5, einheit: 'h', einzelpreis: 95 },
    ],
  },
  {
    id: 'b-5',
    nummer: 'B-2026-0005',
    customerId: 'c-5',
    vehicleId: 'v-6',
    status: 'neu',
    eingangDatum: '2026-09-08',
    beschreibung: 'Ölwechsel + Innenraumfilter',
    positionen: [
      { id: 'p-5a', kind: 'teil', teilId: 't-4', bezeichnung: 'Motoröl 5W-30 (5 l)', menge: 1, einheit: 'kanne', einzelpreis: 48.9 },
      { id: 'p-5b', kind: 'teil', teilId: 't-5', bezeichnung: 'Ölfilter', menge: 1, einheit: 'Stk', einzelpreis: 14.9 },
      { id: 'p-5c', kind: 'teil', teilId: 't-7', bezeichnung: 'Innenraumfilter', menge: 1, einheit: 'Stk', einzelpreis: 26 },
      { id: 'p-5d', kind: 'arbeit', bezeichnung: 'Ölwechsel + Filter', menge: 1, einheit: 'h', einzelpreis: 95 },
    ],
  },
  {
    id: 'b-6',
    nummer: 'B-2026-0006',
    customerId: 'c-6',
    vehicleId: 'v-7',
    status: 'in_arbeit',
    eingangDatum: '2026-09-05',
    beschreibung: 'Klimaservice + Innenraumfilter',
    positionen: [
      { id: 'p-6a', kind: 'arbeit', bezeichnung: 'Klimaservice', menge: 1, einheit: 'Pauschal', einzelpreis: 89 },
      { id: 'p-6b', kind: 'teil', teilId: 't-7', bezeichnung: 'Innenraumfilter', menge: 1, einheit: 'Stk', einzelpreis: 26 },
    ],
  },
  {
    id: 'b-7',
    nummer: 'B-2026-0007',
    customerId: 'c-7',
    vehicleId: 'v-8',
    status: 'fertig',
    eingangDatum: '2026-08-30',
    fertigstellungDatum: '2026-09-01',
    beschreibung: 'HU-Vorbereitung',
    positionen: [
      { id: 'p-7a', kind: 'arbeit', bezeichnung: 'HU-Vorbereitung', menge: 1.5, einheit: 'h', einzelpreis: 95 },
      { id: 'p-7b', kind: 'teil', teilId: 't-14', bezeichnung: 'Scheibenwischer vorne', menge: 1, einheit: 'Satz', einzelpreis: 32.9 },
    ],
  },
  {
    id: 'b-8',
    nummer: 'B-2026-0008',
    customerId: 'c-8',
    vehicleId: 'v-9',
    status: 'neu',
    eingangDatum: '2026-09-07',
    beschreibung: 'Diagnose Motorkontrollleuchte',
    positionen: [
      { id: 'p-8a', kind: 'arbeit', bezeichnung: 'Diagnose', menge: 1, einheit: 'h', einzelpreis: 95 },
    ],
  },
];
