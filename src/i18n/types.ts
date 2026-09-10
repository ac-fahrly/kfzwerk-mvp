export type Locale = 'de' | 'en';

export type Namespace =
  | 'common'
  | 'auth'
  | 'dashboard'
  | 'bestellungen'
  | 'rechnungen'
  | 'termine'
  | 'mahnungen'
  | 'teile'
  | 'kunden';

export type Params = Record<string, string | number>;
