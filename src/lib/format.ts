import { format as fmt } from 'date-fns';
import { de } from 'date-fns/locale';

const NBSP = '\u00A0';

export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...opts,
  })
    .format(n)
    .replace(/\s/g, NBSP);
}

export function formatMoney(n: number) {
  const s = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `${s}${NBSP}€`;
}

export function formatPercent(n: number) {
  return `${formatNumber(n, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}${NBSP}%`;
}

export function formatCompact(n: number) {
  const abs = Math.abs(n);
  const units: [number, string][] = [
    [1e12, 't'],
    [1e9, 'b'],
    [1e6, 'm'],
    [1e3, 'k'],
  ];
  for (const [threshold, unit] of units) {
    if (abs >= threshold) {
      const v = n / threshold;
      const s = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: v < 10 ? 1 : 0,
        maximumFractionDigits: 1,
      }).format(v);
      return `${s}${unit}`;
    }
  }
  return formatNumber(n);
}

export function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return fmt(date, 'dd.MM.yyyy', { locale: de });
}

export function formatTime(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return fmt(date, 'HH:mm', { locale: de });
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${formatDate(date)}${NBSP}${formatTime(date)}`;
}
