import { z } from 'zod';
import { rechnungStatusList } from './types';

export const rechnungSchema = z.object({
  id: z.string(),
  nummer: z.string().min(1),
  bestellungId: z.string().optional(),
  customerId: z.string().min(1, 'errors.customerRequired'),
  vehicleId: z.string().optional(),
  datum: z.string().min(1),
  faelligDatum: z.string().min(1),
  betrag: z.coerce.number().min(0),
  bezahltBetrag: z.coerce.number().min(0),
  status: z.enum(rechnungStatusList),
  notiz: z.string().optional(),
});

export type RechnungInput = z.infer<typeof rechnungSchema>;
