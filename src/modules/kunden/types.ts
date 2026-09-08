export type Customer = {
  id: string;
  name: string;
  email: string;
  telefon: string;
  strasse: string;
  plz: string;
  ort: string;
};

export type Vehicle = {
  id: string;
  customerId: string;
  kennzeichen: string;
  hersteller: string;
  modell: string;
  baujahr: number;
  vin: string;
};
