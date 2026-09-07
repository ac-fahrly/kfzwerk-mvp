import { z } from 'zod';
import { mahnungStatusList } from './types';

export const mahnungSchema = z.object({
  id: z.string(),
  nummer: z.string().min(1),
  rechnungId: z.string().min(1, 'errors.rechnungRequired'),
  customerId: z.string().min(1),
  datum: z.string().min(1),
  faelligDatum: z.string().min(1),
  status: z.enum(mahnungStatusList),
  offenerBetrag: z.coerce.number().min(0),
  mahngebuehr: z.coerce.number().min(0),
  notiz: z.string().optional(),
});

export type MahnungInput = z.infer<typeof mahnungSchema>;
