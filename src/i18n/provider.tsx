import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import type { Locale, Namespace, Params } from './types';

import deCommon from './locales/de/common.json';
import deDashboard from './locales/de/dashboard.json';
import deBestellungen from './locales/de/bestellungen.json';
import deRechnungen from './locales/de/rechnungen.json';
import deTermine from './locales/de/termine.json';
import deMahnungen from './locales/de/mahnungen.json';
import deTeile from './locales/de/teile.json';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enBestellungen from './locales/en/bestellungen.json';
import enRechnungen from './locales/en/rechnungen.json';
import enTermine from './locales/en/termine.json';
import enMahnungen from './locales/en/mahnungen.json';
import enTeile from './locales/en/teile.json';

type Bundle = Record<string, unknown>;

const bundles: Record<Locale, Record<Namespace, Bundle>> = {
  de: {
    common: deCommon as Bundle,
    dashboard: deDashboard as Bundle,
    bestellungen: deBestellungen as Bundle,
    rechnungen: deRechnungen as Bundle,
    termine: deTermine as Bundle,
    mahnungen: deMahnungen as Bundle,
    teile: deTeile as Bundle,
  },
  en: {
    common: enCommon as Bundle,
    dashboard: enDashboard as Bundle,
    bestellungen: enBestellungen as Bundle,
    rechnungen: enRechnungen as Bundle,
    termine: enTermine as Bundle,
    mahnungen: enMahnungen as Bundle,
    teile: enTeile as Bundle,
  },
};

function resolve(bundle: Bundle, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = bundle;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

function interpolate(s: string, params?: Params): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

const STORAGE_KEY = 'kfz.locale';

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'de' || stored === 'en') return stored;
  return navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  translate: (ns: Namespace, key: string, params?: Params) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

function makeErrorMap(tCommon: (key: string, params?: Params) => string): z.ZodErrorMap {
  return (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type && issue.received === 'undefined') {
      return { message: tCommon('errors.required') };
    }
    if (issue.code === z.ZodIssueCode.too_small) {
      if (issue.type === 'string') return { message: tCommon('errors.required') };
      return { message: tCommon('errors.tooSmall') };
    }
    if (issue.code === z.ZodIssueCode.invalid_string) {
      return { message: tCommon('errors.invalidFormat') };
    }
    return { message: ctx.defaultError };
  };
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const translate = useCallback(
    (ns: Namespace, key: string, params?: Params) => {
      const val = resolve(bundles[locale][ns], key) ?? resolve(bundles[locale].common, key);
      if (val == null) return key;
      return interpolate(val, params);
    },
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    const tCommon = (key: string, params?: Params) => translate('common', key, params);
    z.setErrorMap(makeErrorMap(tCommon));
  }, [locale, translate]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const value = useMemo<Ctx>(() => ({ locale, setLocale, translate }), [locale, setLocale, translate]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT(ns: Namespace) {
  const { translate, locale, setLocale } = useI18n();
  const t = useCallback((key: string, params?: Params) => translate(ns, key, params), [translate, ns]);
  return { t, locale, setLocale };
}
