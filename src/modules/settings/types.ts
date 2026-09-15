export type BusinessSettings = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  ustId: string;
  steuernummer: string;
  email: string;
  telefon: string;
  iban: string;
  bic: string;
  bank: string;
};

export const emptyBusinessSettings: BusinessSettings = {
  name: '',
  strasse: '',
  plz: '',
  ort: '',
  land: '',
  ustId: '',
  steuernummer: '',
  email: '',
  telefon: '',
  iban: '',
  bic: '',
  bank: '',
};
