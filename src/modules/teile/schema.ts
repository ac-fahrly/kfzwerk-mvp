import { z } from 'zod';
import { kategorien } from './types';

export const teilSchema = z.object({
  id: z.string(),
  artikelnr: z.string().min(1, 'errors.artikelnrRequired'),
  bezeichnung: z.string().min(2, 'errors.bezeichnungRequired'),
  kategorie: z.enum(kategorien),
  einheit: z.string().min(1, 'errors.required'),
  bestand: z.coerce.number().min(0),
  mindestbestand: z.coerce.number().min(0),
  ekPreis: z.coerce.number().min(0),
  vkPreis: z.coerce.number().min(0),
  lieferant: z.string().min(1, 'errors.lieferantRequired'),
  lagerort: z.string().optional(),
});

export type TeilInput = z.infer<typeof teilSchema>;
