// NOT LOADED BY THE APP any more. The workshop's data lives in PostgreSQL
// and arrives through the API (see ../../store/create-api-store.ts).
//
// This file is kept as the SOURCE of the backend demo dataset: it was
// extracted verbatim into kfzwerk-mvp-backend/prisma/seed-data.json, which
// `npm run seed` loads. Edit here, re-extract, and the seeded app still
// matches the prototype.
import type { Termin } from './types';

export const seedTermine: Termin[] = [
  { id: 'te-1', customerId: 'c-1', vehicleId: 'v-1', datum: '2026-09-10', von: '09:00', bis: '11:00', grund: 'Inspektion', techniker: 'Andreas', status: 'bestaetigt' },
  { id: 'te-2', customerId: 'c-2', vehicleId: 'v-3', datum: '2026-09-10', von: '13:30', bis: '17:30', grund: 'Bremsen', techniker: 'Martin', status: 'bestaetigt' },
  { id: 'te-3', customerId: 'c-3', vehicleId: 'v-4', datum: '2026-09-11', von: '08:30', bis: '10:00', grund: 'Reifenwechsel', techniker: 'Sven', status: 'geplant' },
  { id: 'te-4', customerId: 'c-4', vehicleId: 'v-5', datum: '2026-09-11', von: '11:00', bis: '12:00', grund: 'HU / AU', techniker: 'Andreas', status: 'geplant' },
  { id: 'te-5', customerId: 'c-5', vehicleId: 'v-6', datum: '2026-09-12', von: '09:00', bis: '10:30', grund: 'Klimaservice', techniker: 'Kevin', status: 'geplant' },
  { id: 'te-6', customerId: 'c-6', vehicleId: 'v-7', datum: '2026-09-15', von: '14:00', bis: '15:00', grund: 'Diagnose', techniker: 'Martin', status: 'geplant' },
  { id: 'te-7', customerId: 'c-7', vehicleId: 'v-8', datum: '2026-09-16', von: '08:00', bis: '12:00', grund: 'Karosseriearbeit', techniker: 'Sven', status: 'bestaetigt' },
  { id: 'te-8', customerId: 'c-8', vehicleId: 'v-9', datum: '2026-09-17', von: '10:00', bis: '11:00', grund: 'Ölwechsel', techniker: 'Andreas', status: 'geplant' },
  { id: 'te-9', customerId: 'c-1', vehicleId: 'v-2', datum: '2026-09-18', von: '13:00', bis: '15:00', grund: 'Inspektion', techniker: 'Kevin', status: 'geplant' },
  { id: 'te-10', customerId: 'c-2', vehicleId: 'v-10', datum: '2026-09-22', von: '09:30', bis: '11:30', grund: 'Reifenwechsel', techniker: 'Sven', status: 'geplant' },
  { id: 'te-11', customerId: 'c-4', vehicleId: 'v-5', datum: '2026-09-04', von: '10:00', bis: '11:00', grund: 'Ölwechsel', techniker: 'Andreas', status: 'abgeschlossen' },
  { id: 'te-12', customerId: 'c-6', vehicleId: 'v-7', datum: '2026-09-05', von: '15:00', bis: '16:00', grund: 'Klimaservice', techniker: 'Kevin', status: 'abgeschlossen' },
];
