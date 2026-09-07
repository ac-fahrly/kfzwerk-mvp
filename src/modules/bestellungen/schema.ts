import { z } from 'zod';
import { bestellStatusList } from './types';

export const positionSchema = z.object({
  id: z.string(),
  kind: z.enum(['teil', 'arbeit']),
  bezeichnung: z.string().min(1, 'errors.bezeichnungRequired'),
  teilId: z.string().optional(),
  menge: z.coerce.number().min(0.01),
  einheit: z.string().min(1, 'errors.required'),
  einzelpreis: z.coerce.number().min(0),
});

export const bestellungSchema = z.object({
  id: z.string(),
  nummer: z.string().min(1),
  customerId: z.string().min(1, 'errors.customerRequired'),
  vehicleId: z.string().min(1, 'errors.vehicleRequired'),
  status: z.enum(bestellStatusList),
  eingangDatum: z.string().min(1),
  fertigstellungDatum: z.string().optional(),
  beschreibung: z.string().min(1, 'errors.descriptionRequired'),
  positionen: z.array(positionSchema).min(1, 'errors.positionRequired'),
});

export type BestellungInput = z.infer<typeof bestellungSchema>;
