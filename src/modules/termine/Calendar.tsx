import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n, useT } from '@/i18n';
import { useStatusLabel } from '@/components/shared/status-badge';
import type { Termin } from './types';

type Props = {
  termine: Termin[];
  onCreate: (isoDate: string) => void;
  onOpen: (t: Termin) => void;
};

export function TermineCalendar({ termine, onCreate, onOpen }: Props) {
  const { t } = useT('termine');
  const { t: tc } = useT('common');
  const { locale } = useI18n();
  const dfLocale = locale === 'de' ? de : enUS;
  const statusLabel = useStatusLabel();
  const [cursor, setCursor] = useState(() => new Date());
  const weekStartsOn = 1 as const;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, Termin[]>();
    for (const x of termine) {
      const key = x.datum;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(x);
    }
    for (const list of m.values()) list.sort((a, b) => a.von.localeCompare(b.von));
    return m;
  }, [termine]);

  const weekdaysDe = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const weekdaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdays = locale === 'de' ? weekdaysDe : weekdaysEn;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <div className="text-sm font-medium capitalize">{format(cursor, 'LLLL yyyy', { locale: dfLocale })}</div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>{tc('actions.today')}</Button>
          <Button variant="ghost" size="icon" onClick={() => setCursor((d) => subMonths(d, 1))} aria-label={t('calendar.prevMonth')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCursor((d) => addMonths(d, 1))} aria-label={t('calendar.nextMonth')}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b bg-muted/40 text-xs text-muted-foreground">
        {weekdays.map((w) => (
          <div key={w} className="p-2 text-center font-medium">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const dayItems = byDay.get(iso) ?? [];
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <div
              key={iso}
              className={cn(
                'group min-h-[110px] border-b border-r p-1.5 last:border-r-0',
                !inMonth && 'bg-muted/20 text-muted-foreground',
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'num text-xs font-medium',
                    today && 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <button
                  onClick={() => onCreate(iso)}
                  className="rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                  aria-label={t('calendar.addAppointment')}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((x) => (
                  <button
                    key={x.id}
                    onClick={() => onOpen(x)}
                    className="block w-full truncate rounded-sm bg-accent px-1.5 py-0.5 text-left text-[11px] hover:bg-accent/70"
                    title={`${x.von}–${x.bis} · ${tc(`grund.${x.grund}`)} · ${statusLabel(x.status)}`}
                  >
                    <span className="num">{x.von}</span> <span className="text-muted-foreground">{tc(`grund.${x.grund}`)}</span>
                  </button>
                ))}
                {dayItems.length > 3 ? (
                  <div className="px-1 text-[10px] text-muted-foreground">{t('calendar.andMore', { n: dayItems.length - 3 })}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
