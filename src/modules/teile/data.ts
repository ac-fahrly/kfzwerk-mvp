// NOT LOADED BY THE APP any more. The workshop's data lives in PostgreSQL
// and arrives through the API (see ../../store/create-api-store.ts).
//
// This file is kept as the SOURCE of the backend demo dataset: it was
// extracted verbatim into kfzwerk-mvp-backend/prisma/seed-data.json, which
// `npm run seed` loads. Edit here, re-extract, and the seeded app still
// matches the prototype.
import type { Teil } from './types';

export const seedTeile: Teil[] = [
  { id: 't-1', artikelnr: 'BR-2001', bezeichnung: 'Bremsbeläge vorne (Satz)', kategorie: 'Bremse', einheit: 'Satz', bestand: 24, mindestbestand: 5, ekPreis: 32.5, vkPreis: 68.9, lieferant: 'Bosch', lagerort: 'A-1-3' },
  { id: 't-2', artikelnr: 'BR-2002', bezeichnung: 'Bremsscheiben vorne (Paar)', kategorie: 'Bremse', einheit: 'Paar', bestand: 12, mindestbestand: 4, ekPreis: 58.0, vkPreis: 119.0, lieferant: 'ATE', lagerort: 'A-1-4' },
  { id: 't-3', artikelnr: 'BR-2010', bezeichnung: 'Bremsflüssigkeit DOT 4 (1 l)', kategorie: 'Betriebsstoffe', einheit: 'l', bestand: 40, mindestbestand: 10, ekPreis: 4.9, vkPreis: 12.5, lieferant: 'Liqui Moly', lagerort: 'C-2-1' },
  { id: 't-4', artikelnr: 'MO-3001', bezeichnung: 'Motoröl 5W-30 (5 l)', kategorie: 'Betriebsstoffe', einheit: 'kanne', bestand: 32, mindestbestand: 8, ekPreis: 21.0, vkPreis: 48.9, lieferant: 'Castrol', lagerort: 'C-1-1' },
  { id: 't-5', artikelnr: 'MO-3002', bezeichnung: 'Ölfilter', kategorie: 'Motor', einheit: 'Stk', bestand: 55, mindestbestand: 12, ekPreis: 6.4, vkPreis: 14.9, lieferant: 'Mann-Filter', lagerort: 'A-3-2' },
  { id: 't-6', artikelnr: 'MO-3003', bezeichnung: 'Luftfilter', kategorie: 'Motor', einheit: 'Stk', bestand: 28, mindestbestand: 10, ekPreis: 8.9, vkPreis: 19.9, lieferant: 'Mann-Filter', lagerort: 'A-3-3' },
  { id: 't-7', artikelnr: 'MO-3004', bezeichnung: 'Innenraumfilter (Aktivkohle)', kategorie: 'Motor', einheit: 'Stk', bestand: 20, mindestbestand: 6, ekPreis: 11.5, vkPreis: 26.0, lieferant: 'Mann-Filter', lagerort: 'A-3-4' },
  { id: 't-8', artikelnr: 'MO-3005', bezeichnung: 'Zündkerzen (Satz 4 Stk)', kategorie: 'Motor', einheit: 'Satz', bestand: 18, mindestbestand: 5, ekPreis: 24.0, vkPreis: 52.0, lieferant: 'NGK', lagerort: 'A-3-5' },
  { id: 't-9', artikelnr: 'FA-4001', bezeichnung: 'Stoßdämpfer vorne (Paar)', kategorie: 'Fahrwerk', einheit: 'Paar', bestand: 6, mindestbestand: 2, ekPreis: 145.0, vkPreis: 298.0, lieferant: 'Sachs', lagerort: 'B-2-1' },
  { id: 't-10', artikelnr: 'FA-4002', bezeichnung: 'Koppelstange', kategorie: 'Fahrwerk', einheit: 'Stk', bestand: 14, mindestbestand: 4, ekPreis: 12.0, vkPreis: 29.9, lieferant: 'Lemförder', lagerort: 'B-2-2' },
  { id: 't-11', artikelnr: 'FA-4010', bezeichnung: 'Sommerreifen 205/55 R16', kategorie: 'Fahrwerk', einheit: 'Stk', bestand: 22, mindestbestand: 8, ekPreis: 78.0, vkPreis: 129.0, lieferant: 'Continental', lagerort: 'D-1-1' },
  { id: 't-12', artikelnr: 'FA-4011', bezeichnung: 'Winterreifen 205/55 R16', kategorie: 'Fahrwerk', einheit: 'Stk', bestand: 18, mindestbestand: 8, ekPreis: 82.0, vkPreis: 135.0, lieferant: 'Michelin', lagerort: 'D-1-2' },
  { id: 't-13', artikelnr: 'EL-5001', bezeichnung: 'Autobatterie 70 Ah', kategorie: 'Elektrik', einheit: 'Stk', bestand: 8, mindestbestand: 3, ekPreis: 85.0, vkPreis: 149.0, lieferant: 'Varta', lagerort: 'E-1-1' },
  { id: 't-14', artikelnr: 'EL-5002', bezeichnung: 'Scheibenwischer vorne (Satz)', kategorie: 'Elektrik', einheit: 'Satz', bestand: 30, mindestbestand: 10, ekPreis: 14.0, vkPreis: 32.9, lieferant: 'Bosch', lagerort: 'E-2-1' },
  { id: 't-15', artikelnr: 'EL-5003', bezeichnung: 'H7 Halogenlampe (Paar)', kategorie: 'Elektrik', einheit: 'Paar', bestand: 26, mindestbestand: 10, ekPreis: 8.5, vkPreis: 18.9, lieferant: 'Osram', lagerort: 'E-2-2' },
  { id: 't-16', artikelnr: 'KA-6001', bezeichnung: 'Kotflügel vorne links', kategorie: 'Karosserie', einheit: 'Stk', bestand: 2, mindestbestand: 1, ekPreis: 165.0, vkPreis: 320.0, lieferant: 'Van Wezel', lagerort: 'F-1-1' },
  { id: 't-17', artikelnr: 'KA-6010', bezeichnung: 'Türgriff außen', kategorie: 'Karosserie', einheit: 'Stk', bestand: 9, mindestbestand: 2, ekPreis: 22.5, vkPreis: 49.0, lieferant: 'Blic', lagerort: 'F-2-1' },
  { id: 't-18', artikelnr: 'ZU-7001', bezeichnung: 'Reinigungsmittel Innenraum (500 ml)', kategorie: 'Zubehör', einheit: 'Flasche', bestand: 15, mindestbestand: 4, ekPreis: 3.5, vkPreis: 9.9, lieferant: 'Sonax', lagerort: 'G-1-1' },
  { id: 't-19', artikelnr: 'ZU-7002', bezeichnung: 'Fußmatten-Set (4-teilig)', kategorie: 'Zubehör', einheit: 'Satz', bestand: 12, mindestbestand: 4, ekPreis: 18.0, vkPreis: 42.0, lieferant: 'Petex', lagerort: 'G-1-2' },
  { id: 't-20', artikelnr: 'BE-8001', bezeichnung: 'Kühlerfrostschutz G12+ (1,5 l)', kategorie: 'Betriebsstoffe', einheit: 'Flasche', bestand: 22, mindestbestand: 6, ekPreis: 6.9, vkPreis: 15.9, lieferant: 'Liqui Moly', lagerort: 'C-2-2' },
  { id: 't-21', artikelnr: 'BE-8002', bezeichnung: 'Scheibenwaschkonzentrat (250 ml)', kategorie: 'Betriebsstoffe', einheit: 'Flasche', bestand: 40, mindestbestand: 10, ekPreis: 2.5, vkPreis: 6.9, lieferant: 'Sonax', lagerort: 'C-2-3' },
  { id: 't-22', artikelnr: 'MO-3020', bezeichnung: 'Zahnriemen-Satz', kategorie: 'Motor', einheit: 'Satz', bestand: 4, mindestbestand: 2, ekPreis: 92.0, vkPreis: 189.0, lieferant: 'Gates', lagerort: 'A-4-1' },
  { id: 't-23', artikelnr: 'MO-3021', bezeichnung: 'Wasserpumpe', kategorie: 'Motor', einheit: 'Stk', bestand: 5, mindestbestand: 2, ekPreis: 58.0, vkPreis: 128.0, lieferant: 'Hepu', lagerort: 'A-4-2' },
  { id: 't-24', artikelnr: 'BR-2020', bezeichnung: 'Bremssattel hinten links', kategorie: 'Bremse', einheit: 'Stk', bestand: 3, mindestbestand: 1, ekPreis: 89.0, vkPreis: 179.0, lieferant: 'ATE', lagerort: 'A-2-1' },
];
