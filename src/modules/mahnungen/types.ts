export const mahnungStatusList = ['stufe_1', 'stufe_2', 'stufe_3', 'inkasso', 'erledigt'] as const;
export type MahnungStatus = (typeof mahnungStatusList)[number];

export const mahnstufen = {
  stufe_1: { label: 'Zahlungserinnerung', gebuehr: 0, fristTage: 14 },
  stufe_2: { label: '1. Mahnung', gebuehr: 5, fristTage: 10 },
  stufe_3: { label: '2. Mahnung', gebuehr: 10, fristTage: 7 },
  inkasso: { label: 'Inkasso', gebuehr: 25, fristTage: 0 },
  erledigt: { label: 'Erledigt', gebuehr: 0, fristTage: 0 },
} as const;

export type Mahnung = {
  id: string;
  nummer: string;
  rechnungId: string;
  customerId: string;
  datum: string;
  faelligDatum: string;
  status: MahnungStatus;
  offenerBetrag: number;
  mahngebuehr: number;
  notiz?: string;
};
