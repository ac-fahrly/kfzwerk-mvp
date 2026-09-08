import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  kennzeichen: z.string().min(1, 'errors.kennzeichenRequired'),
  hersteller: z.string().min(1, 'errors.herstellerRequired'),
  modell: z.string().min(1, 'errors.modellRequired'),
  baujahr: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional().or(z.literal('')),
});

export const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'errors.nameRequired'),
  email: z.string().email('errors.invalidEmail').or(z.literal('')),
  telefon: z.string().optional().or(z.literal('')),
  strasse: z.string().optional().or(z.literal('')),
  plz: z.string().optional().or(z.literal('')),
  ort: z.string().optional().or(z.literal('')),
});

export const customerWithVehiclesSchema = z.object({
  customer: customerSchema,
  vehicles: z.array(vehicleSchema),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type CustomerWithVehiclesInput = z.infer<typeof customerWithVehiclesSchema>;
