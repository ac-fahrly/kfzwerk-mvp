export const terminStatusList = ['geplant', 'bestaetigt', 'abgeschlossen', 'abgesagt'] as const;
export type TerminStatus = (typeof terminStatusList)[number];

export const servicegruende = [
  'Inspektion',
  'Reifenwechsel',
  'HU / AU',
  'Bremsen',
  'Klimaservice',
  'Ölwechsel',
  'Diagnose',
  'Karosseriearbeit',
  'Sonstiges',
] as const;
export type Servicegrund = (typeof servicegruende)[number];

export const techniker = ['Andreas', 'Martin', 'Sven', 'Kevin'] as const;

export type Termin = {
  id: string;
  customerId: string;
  vehicleId: string;
  datum: string;
  von: string;
  bis: string;
  grund: Servicegrund;
  techniker: string;
  status: TerminStatus;
  notiz?: string;
};
