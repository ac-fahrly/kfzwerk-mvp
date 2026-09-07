import { z } from 'zod';
import { servicegruende, terminStatusList } from './types';

export const terminSchema = z
  .object({
    id: z.string(),
    customerId: z.string().min(1, 'errors.customerRequired'),
    vehicleId: z.string().min(1, 'errors.vehicleRequired'),
    datum: z.string().min(1),
    von: z.string().regex(/^\d{2}:\d{2}$/, 'errors.invalidTime'),
    bis: z.string().regex(/^\d{2}:\d{2}$/, 'errors.invalidTime'),
    grund: z.enum(servicegruende),
    techniker: z.string().min(1),
    status: z.enum(terminStatusList),
    notiz: z.string().optional(),
  })
  .refine((v) => v.bis > v.von, { message: 'errors.endBeforeStart', path: ['bis'] });

export type TerminInput = z.infer<typeof terminSchema>;
