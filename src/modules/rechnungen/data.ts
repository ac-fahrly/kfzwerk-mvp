import type { Rechnung } from './types';

export const seedRechnungen: Rechnung[] = [
  { id: 'r-1', nummer: 'R-2026-0001', bestellungId: 'b-3', customerId: 'c-3', vehicleId: 'v-4', datum: '2026-09-02', faelligDatum: '2026-09-16', betrag: 104.72, bezahltBetrag: 104.72, status: 'bezahlt' },
  { id: 'r-2', nummer: 'R-2026-0002', bestellungId: 'b-4', customerId: 'c-4', vehicleId: 'v-5', datum: '2026-08-22', faelligDatum: '2026-09-05', betrag: 233.03, bezahltBetrag: 233.03, status: 'bezahlt' },
  { id: 'r-3', nummer: 'R-2026-0003', bestellungId: 'b-7', customerId: 'c-7', vehicleId: 'v-8', datum: '2026-09-01', faelligDatum: '2026-09-15', betrag: 208.71, bezahltBetrag: 0, status: 'offen' },
  { id: 'r-4', nummer: 'R-2026-0004', customerId: 'c-1', vehicleId: 'v-2', datum: '2026-07-15', faelligDatum: '2026-07-29', betrag: 542.90, bezahltBetrag: 0, status: 'ueberfaellig', notiz: 'HU + AU + Bremsen' },
  { id: 'r-5', nummer: 'R-2026-0005', customerId: 'c-6', vehicleId: 'v-7', datum: '2026-07-30', faelligDatum: '2026-08-13', betrag: 189.50, bezahltBetrag: 100.00, status: 'teilbezahlt', notiz: 'Ratenzahlung vereinbart' },
  { id: 'r-6', nummer: 'R-2026-0006', customerId: 'c-2', vehicleId: 'v-10', datum: '2026-08-10', faelligDatum: '2026-08-24', betrag: 328.00, bezahltBetrag: 0, status: 'ueberfaellig' },
  { id: 'r-7', nummer: 'R-2026-0007', customerId: 'c-5', vehicleId: 'v-6', datum: '2026-08-30', faelligDatum: '2026-09-13', betrag: 92.40, bezahltBetrag: 0, status: 'offen' },
  { id: 'r-8', nummer: 'R-2026-0008', customerId: 'c-8', vehicleId: 'v-9', datum: '2026-09-05', faelligDatum: '2026-09-19', betrag: 175.10, bezahltBetrag: 0, status: 'offen' },
  { id: 'r-9', nummer: 'R-2026-0009', customerId: 'c-3', vehicleId: 'v-4', datum: '2026-06-20', faelligDatum: '2026-07-04', betrag: 780.00, bezahltBetrag: 0, status: 'ueberfaellig', notiz: 'Getriebeschaden' },
  { id: 'r-10', nummer: 'R-2026-0010', customerId: 'c-4', vehicleId: 'v-5', datum: '2026-09-06', faelligDatum: '2026-09-20', betrag: 62.50, bezahltBetrag: 0, status: 'entwurf' },
];
