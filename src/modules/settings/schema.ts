import { z } from 'zod';

const opt = z.string().optional().or(z.literal('')).transform((v) => v ?? '');

export const businessSettingsSchema = z.object({
  name: z.string().min(1, 'errors.nameRequired'),
  strasse: opt,
  plz: opt,
  ort: opt,
  land: opt,
  ustId: opt,
  steuernummer: opt,
  email: z.string().email('errors.invalidEmail').or(z.literal('')).transform((v) => v ?? ''),
  telefon: opt,
  iban: opt,
  bic: opt,
  bank: opt,
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
