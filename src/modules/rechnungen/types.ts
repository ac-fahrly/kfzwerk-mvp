import type { BusinessSettings } from '@/modules/settings/types';

export const rechnungStatusList = ['entwurf', 'offen', 'teilbezahlt', 'bezahlt', 'ueberfaellig'] as const;
export type RechnungStatus = (typeof rechnungStatusList)[number];

/**
 * Bill-to party as it stood when the invoice was issued — the server froze it
 * onto the invoice row (§14 UStG: an invoice is a document, not a live view of
 * the customer record). Plain strings, possibly empty; an empty one means
 * "this line is not on the document".
 */
export type RechnungEmpfaenger = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  ustId: string;
};

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
  /**
   * Vendor identity (letterhead, tax ids, bank) frozen at issue time, in the
   * same 12-field shape as the settings form. The server always sends it — it
   * is optional here only because an optimistic row has not round-tripped yet,
   * which is also why `RechnungDetail` treats a missing one as "no letterhead"
   * and blocks the export.
   *
   * It is never sent back: the invoice DTOs do not declare it and the backend's
   * `forbidNonWhitelisted` pipe answers 400. `invoicesApi` strips it (and
   * `empfaenger`) from every write, so no call site has to remember.
   */
  absender?: BusinessSettings;
  /** Bill-to party frozen at issue time. Optional for the same reason. */
  empfaenger?: RechnungEmpfaenger;
};

export function offenerBetrag(r: Rechnung) {
  return Math.max(0, r.betrag - r.bezahltBetrag);
}

export function istUeberfaellig(r: Rechnung, today = new Date()) {
  if (r.status === 'bezahlt' || r.status === 'entwurf') return false;
  return new Date(r.faelligDatum) < today && offenerBetrag(r) > 0;
}
