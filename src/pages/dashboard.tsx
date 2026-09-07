import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Package, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Money } from '@/components/shared/money';
import { useBestellungen } from '@/modules/bestellungen/store';
import { useRechnungen } from '@/modules/rechnungen/store';
import { useTermine } from '@/modules/termine/store';
import { useMahnungen } from '@/modules/mahnungen/store';
import { useTeile } from '@/modules/teile/store';
import { formatCompact } from '@/lib/format';
import { useT } from '@/i18n';
import { istUeberfaellig, offenerBetrag } from '@/modules/rechnungen/types';

const tiles = [
  { to: '/bestellungen', key: 'nav.bestellungen', icon: ClipboardList },
  { to: '/rechnungen', key: 'nav.rechnungen', icon: FileText },
  { to: '/termine', key: 'nav.termine', icon: Calendar },
  { to: '/mahnungen', key: 'nav.mahnungen', icon: Receipt },
  { to: '/teile', key: 'nav.teile', icon: Package },
] as const;

export function Dashboard() {
  const { t } = useT('dashboard');
  const { t: tc } = useT('common');
  const bestellungen = useBestellungen((s) => s.items);
  const rechnungen = useRechnungen((s) => s.items);
  const termine = useTermine((s) => s.items);
  const mahnungen = useMahnungen((s) => s.items);
  const teile = useTeile((s) => s.items);
  void mahnungen;

  const offen = rechnungen.filter((r) => r.status === 'offen' || r.status === 'ueberfaellig');
  const offenBetrag = offen.reduce((sum, r) => sum + offenerBetrag(r), 0);

  const ueber = rechnungen.filter((r) => istUeberfaellig(r));
  const ueberBetrag = ueber.reduce((sum, r) => sum + offenerBetrag(r), 0);

  const today = new Date().toISOString().slice(0, 10);
  const termineHeute = termine.filter((x) => x.datum === today).length;

  const bestandNiedrig = teile.filter((x) => x.bestand <= x.mindestbestand).length;

  const counts: Record<string, number> = {
    '/bestellungen': bestellungen.length,
    '/rechnungen': rechnungen.length,
    '/termine': termine.length,
    '/mahnungen': mahnungen.length,
    '/teile': teile.length,
  };

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t('kpi.openInvoices')} value={<Money value={offenBetrag} />} sub={t('kpi.invoicesCount', { count: offen.length })} />
        <Kpi
          label={t('kpi.overdue')}
          value={<Money value={ueberBetrag} />}
          sub={t('kpi.invoicesCount', { count: ueber.length })}
          accent={ueber.length > 0 ? 'destructive' : undefined}
        />
        <Kpi label={t('kpi.appointmentsToday')} value={<span className="num">{formatCompact(termineHeute)}</span>} />
        <Kpi
          label={t('kpi.lowStock')}
          value={<span className="num">{formatCompact(bestandNiedrig)}</span>}
          sub={t('kpi.lowStockSub')}
          accent={bestandNiedrig > 0 ? 'warning' : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {tiles.map(({ to, key, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="transition-colors group-hover:bg-accent/40">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-md bg-muted p-2 text-muted-foreground">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{tc(key)}</div>
                  <div className="num text-lg font-semibold leading-tight">{counts[to]}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

type Accent = 'destructive' | 'warning';

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: Accent;
}) {
  const accentBar =
    accent === 'destructive'
      ? 'bg-destructive'
      : accent === 'warning'
        ? 'bg-warning'
        : 'bg-transparent';
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} />
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-semibold leading-none">{value}</div>
        {sub ? <div className="mt-2 text-xs text-muted-foreground">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}
