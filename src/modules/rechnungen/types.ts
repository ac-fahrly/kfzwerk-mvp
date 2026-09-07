export const rechnungStatusList = ['entwurf', 'offen', 'teilbezahlt', 'bezahlt', 'ueberfaellig'] as const;
export type RechnungStatus = (typeof rechnungStatusList)[number];

export type Rechnung = {
  id: string;
  nummer: string;
  bestellungId?: string;
  customerId: string;
  vehicleId?: string;
  datum: string;
  faelligDatum: string;
  betrag: number;
  bezahltBetrag: number;
  status: RechnungStatus;
  notiz?: string;
};

export function offenerBetrag(r: Rechnung) {
  return Math.max(0, r.betrag - r.bezahltBetrag);
}

export function istUeberfaellig(r: Rechnung, today = new Date()) {
  if (r.status === 'bezahlt' || r.status === 'entwurf') return false;
  return new Date(r.faelligDatum) < today && offenerBetrag(r) > 0;
}
