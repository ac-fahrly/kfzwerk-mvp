export const kategorien = ['Motor', 'Bremse', 'Fahrwerk', 'Elektrik', 'Karosserie', 'Betriebsstoffe', 'Zubehör'] as const;
export type Kategorie = (typeof kategorien)[number];

export type Teil = {
  id: string;
  artikelnr: string;
  bezeichnung: string;
  kategorie: Kategorie;
  einheit: string;
  bestand: number;
  mindestbestand: number;
  ekPreis: number;
  vkPreis: number;
  lieferant: string;
  lagerort?: string;
};
