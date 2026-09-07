export type Locale = 'de' | 'en';

export type Namespace =
  | 'common'
  | 'dashboard'
  | 'bestellungen'
  | 'rechnungen'
  | 'termine'
  | 'mahnungen'
  | 'teile';

export type Params = Record<string, string | number>;
