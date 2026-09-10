// NOT LOADED BY THE APP any more. The workshop's data lives in PostgreSQL
// and arrives through the API (see ../../store/create-api-store.ts).
//
// This file is kept as the SOURCE of the backend demo dataset: it was
// extracted verbatim into kfzwerk-mvp-backend/prisma/seed-data.json, which
// `npm run seed` loads. Edit here, re-extract, and the seeded app still
// matches the prototype.
import type { Customer, Vehicle } from './types';

export const seedCustomers: Customer[] = [
  { id: 'c-1', name: 'Michael Weber', email: 'm.weber@example.de', telefon: '+49 89 12345678', strasse: 'Hauptstr. 12', plz: '80331', ort: 'München' },
  { id: 'c-2', name: 'Sabine Fischer', email: 's.fischer@example.de', telefon: '+49 89 23456789', strasse: 'Lindenweg 4', plz: '80333', ort: 'München' },
  { id: 'c-3', name: 'Thomas Becker', email: 't.becker@example.de', telefon: '+49 89 34567890', strasse: 'Bergstr. 88', plz: '80335', ort: 'München' },
  { id: 'c-4', name: 'Julia Hoffmann', email: 'j.hoffmann@example.de', telefon: '+49 89 45678901', strasse: 'Am Anger 21', plz: '80337', ort: 'München' },
  { id: 'c-5', name: 'Klaus Schneider', email: 'k.schneider@example.de', telefon: '+49 89 56789012', strasse: 'Rosenweg 7', plz: '80339', ort: 'München' },
  { id: 'c-6', name: 'Petra Meyer', email: 'p.meyer@example.de', telefon: '+49 89 67890123', strasse: 'Kirchplatz 3', plz: '80341', ort: 'München' },
  { id: 'c-7', name: 'Andreas Braun', email: 'a.braun@example.de', telefon: '+49 89 78901234', strasse: 'Marktstr. 15', plz: '80343', ort: 'München' },
  { id: 'c-8', name: 'Nicole Wagner', email: 'n.wagner@example.de', telefon: '+49 89 89012345', strasse: 'Ringstr. 60', plz: '80345', ort: 'München' },
];

export const seedVehicles: Vehicle[] = [
  { id: 'v-1', customerId: 'c-1', kennzeichen: 'M-AB 1234', hersteller: 'BMW', modell: '320d', baujahr: 2019, vin: 'WBA8E5G50KNU12345' },
  { id: 'v-2', customerId: 'c-1', kennzeichen: 'M-AB 5678', hersteller: 'BMW', modell: 'X3', baujahr: 2021, vin: 'WBAXX9C50DDW67890' },
  { id: 'v-3', customerId: 'c-2', kennzeichen: 'M-SF 100', hersteller: 'Audi', modell: 'A4 Avant', baujahr: 2020, vin: 'WAUZZZ8K2AA123456' },
  { id: 'v-4', customerId: 'c-3', kennzeichen: 'M-TB 42', hersteller: 'Volkswagen', modell: 'Golf VII', baujahr: 2018, vin: 'WVWZZZAUZKW111222' },
  { id: 'v-5', customerId: 'c-4', kennzeichen: 'M-JH 777', hersteller: 'Mercedes-Benz', modell: 'C 220 d', baujahr: 2022, vin: 'WDD2050451R333444' },
  { id: 'v-6', customerId: 'c-5', kennzeichen: 'M-KS 9', hersteller: 'Opel', modell: 'Astra K', baujahr: 2017, vin: 'W0LBD6EX8H8555666' },
  { id: 'v-7', customerId: 'c-6', kennzeichen: 'M-PM 21', hersteller: 'Ford', modell: 'Focus', baujahr: 2019, vin: 'WF0DXXWPMDGA77788' },
  { id: 'v-8', customerId: 'c-7', kennzeichen: 'M-AB 300', hersteller: 'Škoda', modell: 'Octavia', baujahr: 2021, vin: 'TMBJG7NE1L0888999' },
  { id: 'v-9', customerId: 'c-8', kennzeichen: 'M-NW 55', hersteller: 'Toyota', modell: 'Yaris', baujahr: 2020, vin: 'JTDKB20U907999000' },
  { id: 'v-10', customerId: 'c-2', kennzeichen: 'M-SF 200', hersteller: 'Volkswagen', modell: 'Passat', baujahr: 2022, vin: 'WVWZZZ3CZME000111' },
];
