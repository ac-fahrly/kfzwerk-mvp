// NOT LOADED BY THE APP any more. The workshop's data lives in PostgreSQL
// and arrives through the API (see ../../store/create-api-store.ts).
//
// This file is kept as the SOURCE of the backend demo dataset: it was
// extracted verbatim into kfzwerk-mvp-backend/prisma/seed-data.json, which
// `npm run seed` loads. Edit here, re-extract, and the seeded app still
// matches the prototype.
import type { Mahnung } from './types';

export const seedMahnungen: Mahnung[] = [
  { id: 'm-1', nummer: 'M-2026-0001', rechnungId: 'r-4', customerId: 'c-1', datum: '2026-08-05', faelligDatum: '2026-08-19', status: 'stufe_1', offenerBetrag: 542.90, mahngebuehr: 0 },
  { id: 'm-2', nummer: 'M-2026-0002', rechnungId: 'r-4', customerId: 'c-1', datum: '2026-08-20', faelligDatum: '2026-08-30', status: 'stufe_2', offenerBetrag: 542.90, mahngebuehr: 5, notiz: 'Zweite Zahlungsaufforderung versendet.' },
  { id: 'm-3', nummer: 'M-2026-0003', rechnungId: 'r-6', customerId: 'c-2', datum: '2026-08-27', faelligDatum: '2026-09-10', status: 'stufe_1', offenerBetrag: 328.00, mahngebuehr: 0 },
  { id: 'm-4', nummer: 'M-2026-0004', rechnungId: 'r-9', customerId: 'c-3', datum: '2026-07-10', faelligDatum: '2026-07-24', status: 'stufe_1', offenerBetrag: 780.00, mahngebuehr: 0 },
  { id: 'm-5', nummer: 'M-2026-0005', rechnungId: 'r-9', customerId: 'c-3', datum: '2026-07-25', faelligDatum: '2026-08-04', status: 'stufe_2', offenerBetrag: 780.00, mahngebuehr: 5 },
  { id: 'm-6', nummer: 'M-2026-0006', rechnungId: 'r-9', customerId: 'c-3', datum: '2026-08-05', faelligDatum: '2026-08-12', status: 'stufe_3', offenerBetrag: 780.00, mahngebuehr: 10, notiz: 'Letzte Mahnung vor Inkasso.' },
];
