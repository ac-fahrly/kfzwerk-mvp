export const bestellStatusList = [
  'neu',
  'in_arbeit',
  'wartet_auf_teile',
  'fertig',
  'abgeholt',
  'storniert',
] as const;
export type BestellStatus = (typeof bestellStatusList)[number];

export type Position = {
  id: string;
  kind: 'teil' | 'arbeit';
  bezeichnung: string;
  teilId?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
};

export type Bestellung = {
  id: string;
  nummer: string;
  customerId: string;
  vehicleId: string;
  status: BestellStatus;
  eingangDatum: string;
  fertigstellungDatum?: string;
  beschreibung: string;
  positionen: Position[];
};

export function berechneSumme(positionen: Position[]) {
  const netto = positionen.reduce((sum, p) => sum + p.menge * p.einzelpreis, 0);
  const mwst = netto * 0.19;
  const brutto = netto + mwst;
  return { netto, mwst, brutto };
}
